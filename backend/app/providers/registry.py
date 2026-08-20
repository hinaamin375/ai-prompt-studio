from __future__ import annotations

from app.core.config import settings
from app.providers.base import ModelProvider
from app.providers.gemini_provider import (
    GeminiProvider,
)
from app.providers.qwen_provider import (
    QwenProvider,
)


class ProviderRegistry:
    def __init__(
        self,
        *,
        known_provider_ids: set[str] | None = None,
    ) -> None:
        self._providers: dict[
            str,
            ModelProvider,
        ] = {}

        self._known_provider_ids = known_provider_ids or set()

    def register(
        self,
        provider: ModelProvider,
    ) -> None:
        self._known_provider_ids.add(provider.provider_id)

        self._providers[provider.provider_id] = provider

    def get(
        self,
        provider_id: str,
    ) -> ModelProvider | None:
        return self._providers.get(provider_id)

    def is_known(
        self,
        provider_id: str,
    ) -> bool:
        return provider_id in self._known_provider_ids

    def configured_providers(
        self,
    ) -> list[ModelProvider]:
        return list(self._providers.values())


def build_provider_registry() -> ProviderRegistry:
    registry = ProviderRegistry(
        known_provider_ids={
            "qwen",
            "gemini",
        },
    )

    if settings.qwen_api_key:
        registry.register(
            QwenProvider(
                api_key=settings.qwen_api_key,
                base_url=settings.qwen_base_url,
                default_model=(settings.qwen_default_model),
            )
        )

    if settings.gemini_api_key:
        registry.register(
            GeminiProvider(
                api_key=settings.gemini_api_key,
                base_url=settings.gemini_base_url,
                default_model=(settings.gemini_default_model),
            )
        )

    return registry
