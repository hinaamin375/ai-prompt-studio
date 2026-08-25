from __future__ import annotations

from time import perf_counter

from sqlalchemy.orm import Session

from app.core.exceptions import (
    PromptRunError,
    PromptVariablesMissingError,
    ProviderNotConfiguredError,
    UnsupportedProviderError,
)
from app.engine import (
    PromptParser,
    PromptRenderer,
)
from app.mappers import PromptMapper
from app.models.prompt_run import PromptRun
from app.providers import (
    ProviderExecutionSettings,
    ProviderMessage,
    ProviderRegistry,
    build_provider_registry,
)
from app.repositories.prompt_run_repository import (
    prompt_run_repository,
)
from app.schemas.prompt_run import (
    PromptRunRequest,
    PromptRunResponse,
    PromptRunUsage,
)
from app.services.prompt_service import (
    prompt_service,
)


class PromptRunService:
    def __init__(
        self,
        *,
        registry: ProviderRegistry | None = None,
    ) -> None:
        self._registry = registry or build_provider_registry()

        self._renderer = PromptRenderer()
        self._parser = PromptParser()

    def run_prompt(
        self,
        db: Session,
        prompt_id: int,
        data: PromptRunRequest,
    ) -> PromptRunResponse:
        prompt = prompt_service.get_prompt(
            db,
            prompt_id,
        )

        provider_id = data.provider.strip().lower()

        if not self._registry.is_known(provider_id):
            raise UnsupportedProviderError(provider_id)

        provider = self._registry.get(provider_id)

        if provider is None:
            raise ProviderNotConfiguredError(provider_id)

        document = PromptMapper.to_document(prompt)

        rendered_document = self._renderer.render(
            document,
            data.variables,
        )

        remaining_variables = self._parser.parse(
            rendered_document,
        )

        missing_names = list(
            dict.fromkeys(
                occurrence.name
                for occurrence in remaining_variables
            )
        )

        if missing_names:
            raise PromptVariablesMissingError(
                missing_names,
            )

        messages = [
            ProviderMessage(
                role=message.role.value,
                content=message.content,
            )
            for message in rendered_document.messages
        ]

        execution_settings = ProviderExecutionSettings(
            temperature=data.temperature,
            max_output_tokens=data.max_output_tokens,
        )

        started_at = perf_counter()

        try:
            result = provider.run(
                messages=messages,
                model=data.model,
                settings=execution_settings,
            )
        except Exception as exc:
            raise PromptRunError() from exc

        duration_ms = round(
            (perf_counter() - started_at) * 1000
        )

        prompt_run = PromptRun(
            prompt_id=prompt_id,
            provider=result.provider,
            model=result.model,
            variables=dict(data.variables),
            temperature=data.temperature,
            max_output_tokens=data.max_output_tokens,
            output_text=result.output_text,
            duration_ms=duration_ms,
            input_tokens=result.usage.input_tokens,
            output_tokens=result.usage.output_tokens,
            total_tokens=result.usage.total_tokens,
        )

        saved_prompt_run = (
    prompt_run_repository.create(
        db,
        prompt_run,
    )
)

        return PromptRunResponse(
    id=saved_prompt_run.id,
    provider=result.provider,
    model=result.model,
    output_text=result.output_text,
    duration_ms=duration_ms,
    usage=PromptRunUsage(
        input_tokens=result.usage.input_tokens,
        output_tokens=result.usage.output_tokens,
        total_tokens=result.usage.total_tokens,
    ),
)


prompt_run_service = PromptRunService()