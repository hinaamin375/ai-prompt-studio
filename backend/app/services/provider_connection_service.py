from __future__ import annotations

import httpx
from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.provider_connection import ProviderConnection
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.catalog import PROVIDER_CATALOG, ProviderDefinition
from app.providers.gemini_provider import GeminiProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.qwen_provider import QwenProvider
from app.providers.base import ModelProvider
from app.repositories.provider_connection_repository import (
    provider_connection_repository,
)
from app.schemas.provider_connection import (
    ProviderConnectionResponse,
    ProviderConnectionTestResponse,
    ProviderConnectionUpsert,
)
from app.services.credential_cipher import credential_cipher


class ProviderConnectionService:
    def _workspace_id(
        self,
        db: Session,
        provider_id: str | None = None,
    ) -> int:
        workspace_id = db.info.get("workspace_id")
        if isinstance(workspace_id, int):
            return workspace_id

        # Transitional safety path for existing prompt execution. Old prompt
        # routes do not yet carry workspace ownership. If exactly one scoped
        # connection exists for the requested provider, it is unambiguous and
        # safe to use. As soon as multiple workspaces connect the same provider,
        # execution fails closed instead of guessing another tenant's key.
        if provider_id is not None:
            matches = provider_connection_repository.list_by_provider(
                db, provider_id
            )
            if len(matches) == 1 and matches[0].workspace_id is not None:
                return matches[0].workspace_id

        raise ApplicationError(
            "An authenticated workspace is required for provider credentials.",
            code="workspace_required",
            status_code=401,
        )

    def _definition(
        self,
        provider_id: str,
    ) -> ProviderDefinition:
        normalized = provider_id.strip().lower()
        definition = PROVIDER_CATALOG.get(normalized)

        if definition is None:
            raise ApplicationError(
                f"Provider '{provider_id}' is not supported.",
                code="unsupported_provider",
                status_code=404,
            )

        return definition

    def _response(
        self,
        definition: ProviderDefinition,
        connection: ProviderConnection | None,
    ) -> ProviderConnectionResponse:
        connected = connection is not None

        return ProviderConnectionResponse(
            provider=definition.provider_id,
            name=definition.display_name,
            connected=connected,
            key_last_four=(
                connection.key_last_four
                if connection is not None
                else None
            ),
            default_model=definition.default_model,
            models=list(definition.models),
            status=(
                "connected"
                if connected
                else "not_connected"
            ),
        )

    def list_connections(
        self,
        db: Session,
    ) -> list[ProviderConnectionResponse]:
        workspace_id = self._workspace_id(db)
        stored = {
            item.provider: item
            for item in provider_connection_repository.list_all(
                db, workspace_id
            )
        }

        return [
            self._response(
                definition,
                stored.get(definition.provider_id),
            )
            for definition in PROVIDER_CATALOG.values()
        ]

    def upsert_connection(
        self,
        db: Session,
        provider_id: str,
        data: ProviderConnectionUpsert,
    ) -> ProviderConnectionResponse:
        definition = self._definition(provider_id)
        api_key = data.api_key.strip()

        if not api_key:
            raise ApplicationError(
                "API key cannot be empty.",
                code="invalid_provider_api_key",
                status_code=400,
            )

        encrypted_api_key = credential_cipher.encrypt(api_key)
        workspace_id = self._workspace_id(db, definition.provider_id)
        connection = provider_connection_repository.get_by_provider(
            db,
            workspace_id,
            definition.provider_id,
        )

        if connection is None:
            connection = ProviderConnection(
                workspace_id=workspace_id,
                provider=definition.provider_id,
                encrypted_api_key=encrypted_api_key,
                key_last_four=api_key[-4:],
            )
        else:
            connection.encrypted_api_key = encrypted_api_key
            connection.key_last_four = api_key[-4:]

        connection = provider_connection_repository.save(
            db,
            connection,
        )

        return self._response(definition, connection)

    def remove_connection(
        self,
        db: Session,
        provider_id: str,
    ) -> None:
        definition = self._definition(provider_id)
        workspace_id = self._workspace_id(db, definition.provider_id)
        connection = provider_connection_repository.get_by_provider(
            db,
            workspace_id,
            definition.provider_id,
        )

        if connection is None:
            return

        provider_connection_repository.delete(
            db,
            connection,
        )

    def build_provider(
        self,
        db: Session,
        provider_id: str,
    ) -> ModelProvider:
        definition = self._definition(provider_id)
        workspace_id = self._workspace_id(db, definition.provider_id)
        connection = provider_connection_repository.get_by_provider(
            db,
            workspace_id,
            definition.provider_id,
        )

        if connection is None:
            raise ApplicationError(
                f"{definition.display_name} is not connected. Add your API key in Model Providers.",
                code="provider_not_connected",
                status_code=400,
            )

        api_key = credential_cipher.decrypt(
            connection.encrypted_api_key,
        )

        if definition.provider_id == "gemini":
            return GeminiProvider(
                api_key=api_key,
                base_url=definition.base_url,
                default_model=definition.default_model,
            )

        if definition.provider_id == "qwen":
            return QwenProvider(
                api_key=api_key,
                base_url=definition.base_url,
                default_model=definition.default_model,
            )

        if definition.provider_id == "openai":
            return OpenAIProvider(
                api_key=api_key,
                base_url=definition.base_url,
                default_model=definition.default_model,
            )

        if definition.provider_id == "anthropic":
            return AnthropicProvider(
                api_key=api_key,
                base_url=definition.base_url,
                default_model=definition.default_model,
            )

        raise AssertionError("Provider catalog and factory are out of sync.")

    def list_connected_providers(
        self,
        db: Session,
    ) -> list[ProviderConnectionResponse]:
        return [
            connection
            for connection in self.list_connections(db)
            if connection.connected
        ]

    def test_connection(
        self,
        db: Session,
        provider_id: str,
    ) -> ProviderConnectionTestResponse:
        definition = self._definition(provider_id)
        workspace_id = self._workspace_id(db, definition.provider_id)
        connection = provider_connection_repository.get_by_provider(
            db,
            workspace_id,
            definition.provider_id,
        )

        if connection is None:
            raise ApplicationError(
                f"{definition.display_name} is not connected.",
                code="provider_not_connected",
                status_code=400,
            )

        api_key = credential_cipher.decrypt(
            connection.encrypted_api_key,
        )

        try:
            with httpx.Client(timeout=15.0) as client:
                if definition.provider_id == "gemini":
                    response = client.get(
                        f"{definition.base_url}/models",
                        headers={"x-goog-api-key": api_key},
                        params={"pageSize": 1},
                    )
                elif definition.provider_id == "anthropic":
                    response = client.get(
                        f"{definition.base_url}/models",
                        headers={
                            "x-api-key": api_key,
                            "anthropic-version": "2023-06-01",
                        },
                        params={"limit": 1},
                    )
                else:
                    response = client.get(
                        f"{definition.base_url}/models",
                        headers={
                            "Authorization": f"Bearer {api_key}",
                        },
                    )

                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            return ProviderConnectionTestResponse(
                ok=False,
                message=(
                    f"{definition.display_name} rejected the credentials "
                    f"(HTTP {status_code})."
                ),
            )
        except httpx.HTTPError:
            return ProviderConnectionTestResponse(
                ok=False,
                message=(
                    f"Could not reach {definition.display_name}. "
                    "Try again in a moment."
                ),
            )

        return ProviderConnectionTestResponse(
            ok=True,
            message=f"{definition.display_name} connection verified.",
        )


provider_connection_service = ProviderConnectionService()
