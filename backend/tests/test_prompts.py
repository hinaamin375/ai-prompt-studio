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
def test_duplicate_prompt() -> None:
    create_response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Original Prompt",
            "description": "Original description",
            "system_prompt": "You are helpful.",
            "user_prompt": "Summarize {{text}}",
            "favorite": True,
        },
    )

    assert create_response.status_code == 201

    original = create_response.json()

    response = client.post(
        f"/api/v1/prompts/{original['id']}/duplicate",
    )

    assert response.status_code == 201

    duplicate = response.json()

    assert duplicate["id"] != original["id"]

    assert duplicate["title"] == (
        "Original Prompt (Copy)"
    )

    assert (
        duplicate["description"]
        == original["description"]
    )

    assert (
        duplicate["system_prompt"]
        == original["system_prompt"]
    )

    assert (
        duplicate["user_prompt"]
        == original["user_prompt"]
    )

    assert duplicate["favorite"] is False

    assert (
        duplicate["collection_id"]
        == original["collection_id"]
    )


def test_duplicate_missing_prompt_returns_404() -> None:
    response = client.post(
        "/api/v1/prompts/999999/duplicate",
    )

    assert response.status_code == 404

    assert (
        response.json()["error"]["code"]
        == "prompt_not_found"
    )