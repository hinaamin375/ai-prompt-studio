from __future__ import annotations

import httpx

from app.providers.base import (
    ModelProvider,
    ProviderExecutionSettings,
    ProviderMessage,
    ProviderResult,
    ProviderUsage,
)


class AnthropicProvider(ModelProvider):
    provider_id = "anthropic"
    display_name = "Anthropic"

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

        system_parts: list[str] = []
        anthropic_messages: list[dict[str, str]] = []

        for message in messages:
            if message.role == "system":
                system_parts.append(message.content)
                continue

            role = "assistant" if message.role == "assistant" else "user"
            anthropic_messages.append(
                {
                    "role": role,
                    "content": message.content,
                }
            )

        payload: dict[str, object] = {
            "model": model_name,
            "max_tokens": settings.max_output_tokens or 4096,
            "messages": anthropic_messages,
        }

        if system_parts:
            payload["system"] = "\n\n".join(system_parts)

        response = self._client.post(
            f"{self._base_url}/messages",
            headers={
                "x-api-key": self._api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

        text_parts = [
            item["text"]
            for item in data.get("content", [])
            if isinstance(item, dict)
            and item.get("type") == "text"
            and isinstance(item.get("text"), str)
        ]

        if not text_parts:
            raise ValueError("Anthropic returned no text content.")

        usage = data.get("usage", {})
        input_tokens = usage.get("input_tokens")
        output_tokens = usage.get("output_tokens")
        total_tokens = (
            input_tokens + output_tokens
            if isinstance(input_tokens, int)
            and isinstance(output_tokens, int)
            else None
        )

        return ProviderResult(
            provider=self.provider_id,
            model=data.get("model", model_name),
            output_text="".join(text_parts),
            usage=ProviderUsage(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
            ),
        )
