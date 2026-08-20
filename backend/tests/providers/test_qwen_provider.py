import json

import httpx

from app.providers import (
    ProviderMessage,
    QwenProvider,
)


def test_qwen_provider_normalizes_response():
    def handler(
        request: httpx.Request,
    ) -> httpx.Response:
        payload = json.loads(request.content)

        assert payload["model"] == ("qwen3.6-plus")

        assert payload["messages"] == [
            {
                "role": "user",
                "content": "Hello",
            }
        ]

        assert request.headers["Authorization"] == "Bearer test-key"

        return httpx.Response(
            200,
            json={
                "model": "qwen3.6-plus",
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": "Hi there",
                        }
                    }
                ],
                "usage": {
                    "prompt_tokens": 5,
                    "completion_tokens": 3,
                    "total_tokens": 8,
                },
            },
        )

    client = httpx.Client(transport=httpx.MockTransport(handler))

    provider = QwenProvider(
        api_key="test-key",
        base_url="https://example.test/v1",
        default_model="qwen3.6-plus",
        client=client,
    )

    result = provider.run(
        messages=[
            ProviderMessage(
                role="user",
                content="Hello",
            )
        ]
    )

    assert result.provider == "qwen"
    assert result.model == "qwen3.6-plus"
    assert result.output_text == "Hi there"

    assert result.usage.input_tokens == 5
    assert result.usage.output_tokens == 3
    assert result.usage.total_tokens == 8
