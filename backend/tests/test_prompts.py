from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_prompt() -> None:
    response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Test Prompt",
            "description": "Used for testing",
            "system_prompt": "You are helpful.",
            "user_prompt": "Summarize {{text}}",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Test Prompt"
    assert data["user_prompt"] == "Summarize {{text}}"
    assert "id" in data


def test_get_missing_prompt_returns_404() -> None:
    response = client.get(
        "/api/v1/prompts/999999",
    )

    assert response.status_code == 404

    assert response.json()["error"]["code"] == ("prompt_not_found")
