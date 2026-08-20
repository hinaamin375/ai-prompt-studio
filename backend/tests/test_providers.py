from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_list_providers() -> None:
    response = client.get(
        "/api/v1/providers",
    )

    assert response.status_code == 200

    providers = response.json()

    provider_ids = {provider["id"] for provider in providers}

    assert "qwen" in provider_ids
    assert "gemini" in provider_ids

    qwen = next(provider for provider in providers if provider["id"] == "qwen")

    assert qwen["name"] == "Qwen"
    assert qwen["default_model"] == "qwen3.6-plus"

    assert "qwen3.6-plus" in qwen["models"]

    gemini = next(provider for provider in providers if provider["id"] == "gemini")

    assert gemini["name"] == "Gemini"

    assert gemini["default_model"] == "gemini-3.1-flash-lite"

    assert "gemini-3.1-flash-lite" in gemini["models"]
