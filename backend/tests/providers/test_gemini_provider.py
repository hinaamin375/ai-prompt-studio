import json

import httpx

from app.providers import (
    GeminiProvider,
    ProviderExecutionSettings,
    ProviderMessage,
)


def test_gemini_provider_normalizes_response():
    def handler(
        request: httpx.Request,
    ) -> httpx.Response:
        payload = json.loads(request.content)

        assert request.headers["x-goog-api-key"] == "test-key"

        assert payload["systemInstruction"] == {
            "parts": [
                {
                    "text": ("You are helpful."),
                }
            ],
        }

        assert payload["contents"] == [
            {
                "role": "user",
                "parts": [
                    {
                        "text": "Hello",
                    }
                ],
            }
        ]
        assert payload["generationConfig"] == {
             "temperature": 0.4,
             "maxOutputTokens": 600,
        }

        return httpx.Response(
            200,
            json={
                "candidates": [
                    {
                        "content": {
                            "role": "model",
                            "parts": [
                                {
                                    "text": ("Hi there"),
                                }
                            ],
                        }
                    }
                ],
                "usageMetadata": {
                    "promptTokenCount": 5,
                    "candidatesTokenCount": 3,
                    "totalTokenCount": 8,
                },
            },
        )

    client = httpx.Client(transport=httpx.MockTransport(handler))

    provider = GeminiProvider(
        api_key="test-key",
        base_url=("https://example.test/v1beta"),
        default_model=("gemini-3.1-flash-lite"),
        client=client,
    )

    result = provider.run(
    messages=[
        ProviderMessage(
            role="system",
            content="You are helpful.",
        ),
        ProviderMessage(
            role="user",
            content="Hello",
        ),
    ],
    settings=ProviderExecutionSettings(
        temperature=0.4,
        max_output_tokens=600,
    ),
)

    assert result.provider == "gemini"

    assert result.model == ("gemini-3.1-flash-lite")

    assert result.output_text == "Hi there"

    assert result.usage.input_tokens == 5
    assert result.usage.output_tokens == 3
    assert result.usage.total_tokens == 8
