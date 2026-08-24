from __future__ import annotations

import httpx

from app.providers.base import (
    ModelProvider,
    ProviderExecutionSettings,
    ProviderMessage,
    ProviderResult,
    ProviderUsage,
)


class QwenProvider(ModelProvider):
    provider_id = "qwen"
    display_name = "Qwen"

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str,
        default_model: str,
        client: httpx.Client | None = None,
    ) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._default_model = default_model

        self._client = client or httpx.Client(
            timeout=httpx.Timeout(
                connect=5.0,
                read=60.0,
                write=15.0,
                pool=5.0,
            ),
        )

    @property
    def default_model(self) -> str:
        return self._default_model

    def run(
        self,
        *,
        messages: list[ProviderMessage],
        model: str | None = None,
        settings: ProviderExecutionSettings | None = None,
    ) -> ProviderResult:
        model_name = model or self.default_model

        payload: dict[str, object] = {
            "model": model_name,
            "messages": [
                {
                    "role": message.role,
                    "content": message.content,
                }
                for message in messages
            ],
        }

        if settings is not None:
            if settings.temperature is not None:
                payload["temperature"] = (
                    settings.temperature
                )

            if settings.max_output_tokens is not None:
                payload["max_tokens"] = (
                    settings.max_output_tokens
                )

        response = self._client.post(
            f"{self._base_url}/chat/completions",
            headers={
                "Authorization": (
                    f"Bearer {self._api_key}"
                ),
                "Content-Type": "application/json",
            },
            json=payload,
        )

        response.raise_for_status()

        data = response.json()

        choices = data.get("choices", [])

        if not choices:
            raise ValueError(
                "Qwen returned no response choices."
            )

        output_text = (
            choices[0]
            .get("message", {})
            .get("content")
        )

        if not isinstance(output_text, str):
            raise ValueError(
                "Qwen returned no text content."
            )

        usage = data.get("usage", {})

        return ProviderResult(
            provider=self.provider_id,
            model=data.get(
                "model",
                model_name,
            ),
            output_text=output_text,
            usage=ProviderUsage(
                input_tokens=usage.get(
                    "prompt_tokens"
                ),
                output_tokens=usage.get(
                    "completion_tokens"
                ),
                total_tokens=usage.get(
                    "total_tokens"
                ),
            ),
        )