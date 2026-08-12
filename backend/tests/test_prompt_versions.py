from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_prompt(
    title: str = "Original title",
) -> dict:
    response = client.post(
        "/api/v1/prompts",
        json={
            "title": title,
            "description": "Original description",
            "system_prompt": "Original system prompt",
            "user_prompt": "Original user prompt",
            "favorite": False,
            "collection_id": None,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_first_content_edit_creates_version_one() -> None:
    prompt = create_prompt()

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Updated title",
        },
    )

    assert response.status_code == 200

    versions_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    assert versions_response.status_code == 200

    versions = versions_response.json()

    assert len(versions) == 1
    assert versions[0]["version"] == 1
    assert versions[0]["title"] == "Original title"


def test_second_edit_creates_version_two() -> None:
    prompt = create_prompt()

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Second title",
        },
    )

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Third title",
        },
    )

    response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    versions = response.json()

    assert len(versions) == 2

    assert versions[0]["version"] == 2
    assert versions[0]["title"] == "Second title"

    assert versions[1]["version"] == 1
    assert versions[1]["title"] == "Original title"


def test_versions_are_returned_newest_first() -> None:
    prompt = create_prompt()

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "user_prompt": "Version two",
        },
    )

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "user_prompt": "Version three",
        },
    )

    response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    versions = response.json()

    assert [
        version["version"]
        for version in versions
    ] == [2, 1]


def test_favorite_only_update_does_not_create_version() -> None:
    prompt = create_prompt()

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "favorite": True,
        },
    )

    assert response.status_code == 200

    versions_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    assert versions_response.json() == []


def test_collection_only_update_does_not_create_version() -> None:
    prompt = create_prompt()

    collection_response = client.post(
        "/api/v1/collections",
        json={
            "name": "Version Test Collection",
        },
    )

    assert collection_response.status_code == 201

    collection = collection_response.json()

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "collection_id": collection["id"],
        },
    )

    assert response.status_code == 200

    versions_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    assert versions_response.json() == []


def test_same_content_does_not_create_version() -> None:
    prompt = create_prompt()

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": prompt["title"],
        },
    )

    assert response.status_code == 200

    versions_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    assert versions_response.json() == []


def test_get_specific_version() -> None:
    prompt = create_prompt()

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Updated title",
        },
    )

    response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions/1",
    )

    assert response.status_code == 200

    version = response.json()

    assert version["version"] == 1
    assert version["title"] == "Original title"
    assert (
        version["description"]
        == "Original description"
    )
    assert (
        version["system_prompt"]
        == "Original system prompt"
    )
    assert (
        version["user_prompt"]
        == "Original user prompt"
    )


def test_missing_version_returns_404() -> None:
    prompt = create_prompt()

    response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions/999",
    )

    assert response.status_code == 404

    body = response.json()

    assert (
        body["error"]["code"]
        == "prompt_version_not_found"
    )


def test_missing_prompt_versions_returns_404() -> None:
    response = client.get(
        "/api/v1/prompts/999999/versions",
    )

    assert response.status_code == 404

    body = response.json()

    assert (
        body["error"]["code"]
        == "prompt_not_found"
    )


def test_restore_version_restores_old_content() -> None:
    prompt = create_prompt()

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Updated title",
            "description": "Updated description",
            "user_prompt": "Updated user prompt",
        },
    )

    response = client.post(
        f"/api/v1/prompts/{prompt['id']}/versions/1/restore",
    )

    assert response.status_code == 200

    restored = response.json()

    assert restored["title"] == "Original title"
    assert (
        restored["description"]
        == "Original description"
    )
    assert (
        restored["user_prompt"]
        == "Original user prompt"
    )


def test_restore_preserves_current_state_as_new_version() -> None:
    prompt = create_prompt()

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Second state",
        },
    )

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Third state",
        },
    )

    restore_response = client.post(
        f"/api/v1/prompts/{prompt['id']}/versions/1/restore",
    )

    assert restore_response.status_code == 200

    versions_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    versions = versions_response.json()

    assert [
        version["version"]
        for version in versions
    ] == [3, 2, 1]

    assert versions[0]["title"] == "Third state"


def test_restoring_current_equivalent_version_does_not_duplicate_history() -> None:
    prompt = create_prompt()

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Second state",
        },
    )

    client.post(
        f"/api/v1/prompts/{prompt['id']}/versions/1/restore",
    )

    before_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    before_count = len(
        before_response.json(),
    )

    response = client.post(
        f"/api/v1/prompts/{prompt['id']}/versions/1/restore",
    )

    assert response.status_code == 200

    after_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    assert (
        len(after_response.json())
        == before_count
    )


def test_deleting_prompt_deletes_versions() -> None:
    prompt = create_prompt()

    client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Updated title",
        },
    )

    versions_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    assert len(
        versions_response.json(),
    ) == 1

    delete_response = client.delete(
        f"/api/v1/prompts/{prompt['id']}",
    )

    assert delete_response.status_code == 204

    prompt_response = client.get(
        f"/api/v1/prompts/{prompt['id']}",
    )

    assert prompt_response.status_code == 404