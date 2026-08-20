from __future__ import annotations

import httpx

from app.providers.base import (
    ModelProvider,
    ProviderMessage,
    ProviderResult,
    ProviderUsage,
)


class GeminiProvider(ModelProvider):
    provider_id = "gemini"
    display_name = "Gemini"

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
    ) -> ProviderResult:
        model_name = model or self.default_model

        system_parts: list[str] = []
        contents: list[dict[str, object]] = []

        for message in messages:
            if message.role == "system":
                system_parts.append(message.content)
                continue

            if message.role == "user":
                gemini_role = "user"
            elif message.role == "assistant":
                gemini_role = "model"
            else:
                raise ValueError(
                    "Gemini does not support "
                    f"the '{message.role}' role "
                    "in this prompt runner."
                )

            contents.append(
                {
                    "role": gemini_role,
                    "parts": [
                        {
                            "text": message.content,
                        }
                    ],
                }
            )

        payload: dict[str, object] = {
            "contents": contents,
        }

        if system_parts:
            payload["systemInstruction"] = {
                "parts": [
                    {
                        "text": "\n\n".join(system_parts),
                    }
                ],
            }

        response = self._client.post(
            (f"{self._base_url}/models/{model_name}:generateContent"),
            headers={
                "x-goog-api-key": self._api_key,
                "Content-Type": "application/json",
            },
            json=payload,
        )

        response.raise_for_status()

        data = response.json()

        candidates = data.get(
            "candidates",
            [],
        )

        if not candidates:
            raise ValueError("Gemini returned no response candidates.")

        parts = candidates[0].get("content", {}).get("parts", [])

        text_parts = [
            part["text"]
            for part in parts
            if isinstance(part, dict)
            and isinstance(
                part.get("text"),
                str,
            )
        ]

        if not text_parts:
            raise ValueError("Gemini returned no text content.")

        usage = data.get(
            "usageMetadata",
            {},
        )

        return ProviderResult(
            provider=self.provider_id,
            model=model_name,
            output_text="".join(text_parts),
            usage=ProviderUsage(
                input_tokens=usage.get("promptTokenCount"),
                output_tokens=usage.get("candidatesTokenCount"),
                total_tokens=usage.get("totalTokenCount"),
            ),
        )
