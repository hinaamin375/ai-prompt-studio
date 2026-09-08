from __future__ import annotations

import httpx

from app.providers.base import (
    ModelProvider,
    ProviderExecutionSettings,
    ProviderMessage,
    ProviderResult,
    ProviderUsage,
)


class OpenAIProvider(ModelProvider):
    provider_id = "openai"
    display_name = "OpenAI"

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
                read=90.0,
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
        settings = settings or ProviderExecutionSettings()

        payload: dict[str, object] = {
            "model": model_name,
            "input": [
                {
                    "role": message.role,
                    "content": message.content,
                }
                for message in messages
            ],
        }

        if settings.max_output_tokens is not None:
            payload["max_output_tokens"] = settings.max_output_tokens

        response = self._client.post(
            f"{self._base_url}/responses",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

        output_text = data.get("output_text")

        if not isinstance(output_text, str):
            text_parts: list[str] = []
            for item in data.get("output", []):
                if not isinstance(item, dict):
                    continue
                for content in item.get("content", []):
                    if (
                        isinstance(content, dict)
                        and isinstance(content.get("text"), str)
                    ):
                        text_parts.append(content["text"])
            output_text = "".join(text_parts)

        if not output_text:
            raise ValueError("OpenAI returned no text content.")

        usage = data.get("usage", {})

        return ProviderResult(
            provider=self.provider_id,
            model=data.get("model", model_name),
            output_text=output_text,
            usage=ProviderUsage(
                input_tokens=usage.get("input_tokens"),
                output_tokens=usage.get("output_tokens"),
                total_tokens=usage.get("total_tokens"),
            ),
        )
