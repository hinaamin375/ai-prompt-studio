from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_tag(
    name: str,
) -> dict:
    response = client.post(
        "/api/v1/tags",
        json={
            "name": name,
        },
    )

    assert response.status_code == 201

    return response.json()


def create_prompt(
    tag_ids: list[int] | None = None,
) -> dict:
    payload = {
        "title": "Tagged prompt",
        "description": "Test description",
        "system_prompt": "System",
        "user_prompt": "User",
        "favorite": False,
        "collection_id": None,
    }

    if tag_ids is not None:
        payload["tag_ids"] = tag_ids

    response = client.post(
        "/api/v1/prompts",
        json=payload,
    )

    assert response.status_code == 201

    return response.json()


def test_create_prompt_with_tags() -> None:
    writing = create_tag("writing")
    resume = create_tag("resume")

    prompt = create_prompt(
        tag_ids=[
            writing["id"],
            resume["id"],
        ],
    )

    assert len(prompt["tags"]) == 2

    assert {tag["name"] for tag in prompt["tags"]} == {
        "writing",
        "resume",
    }


def test_create_prompt_without_tags() -> None:
    prompt = create_prompt()

    assert prompt["tags"] == []


def test_create_prompt_with_unknown_tag_returns_404() -> None:
    response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Broken tag prompt",
            "description": None,
            "system_prompt": None,
            "user_prompt": "User",
            "tag_ids": [999999],
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["error"]["code"] == "tag_not_found"


def test_duplicate_tag_ids_are_ignored() -> None:
    writing = create_tag("writing")

    prompt = create_prompt(
        tag_ids=[
            writing["id"],
            writing["id"],
        ],
    )

    assert len(prompt["tags"]) == 1
    assert prompt["tags"][0]["name"] == "writing"


def test_update_prompt_replaces_tags() -> None:
    writing = create_tag("writing")
    coding = create_tag("coding")
    resume = create_tag("resume")

    prompt = create_prompt(
        tag_ids=[
            writing["id"],
            coding["id"],
        ],
    )

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "tag_ids": [
                resume["id"],
            ],
        },
    )

    assert response.status_code == 200

    updated = response.json()

    assert len(updated["tags"]) == 1
    assert updated["tags"][0]["name"] == "resume"


def test_update_prompt_with_empty_tag_ids_removes_all_tags() -> None:
    writing = create_tag("writing")
    coding = create_tag("coding")

    prompt = create_prompt(
        tag_ids=[
            writing["id"],
            coding["id"],
        ],
    )

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "tag_ids": [],
        },
    )

    assert response.status_code == 200
    assert response.json()["tags"] == []


def test_update_without_tag_ids_preserves_existing_tags() -> None:
    writing = create_tag("writing")

    prompt = create_prompt(
        tag_ids=[
            writing["id"],
        ],
    )

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Updated title",
        },
    )

    assert response.status_code == 200

    updated = response.json()

    assert len(updated["tags"]) == 1
    assert updated["tags"][0]["name"] == "writing"


def test_update_with_unknown_tag_returns_404() -> None:
    prompt = create_prompt()

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "tag_ids": [999999],
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["error"]["code"] == "tag_not_found"


def test_list_prompts_returns_tags() -> None:
    writing = create_tag("writing")

    create_prompt(
        tag_ids=[
            writing["id"],
        ],
    )

    response = client.get(
        "/api/v1/prompts",
    )

    assert response.status_code == 200

    prompts = response.json()

    assert len(prompts) == 1
    assert len(prompts[0]["tags"]) == 1
    assert prompts[0]["tags"][0]["name"] == "writing"


def test_get_prompt_returns_tags() -> None:
    resume = create_tag("resume")

    prompt = create_prompt(
        tag_ids=[
            resume["id"],
        ],
    )

    response = client.get(
        f"/api/v1/prompts/{prompt['id']}",
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["tags"]) == 1
    assert data["tags"][0]["name"] == "resume"


def test_tag_only_update_does_not_create_version() -> None:
    writing = create_tag("writing")

    prompt = create_prompt()

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "tag_ids": [
                writing["id"],
            ],
        },
    )

    assert response.status_code == 200

    versions_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/versions",
    )

    assert versions_response.status_code == 200
    assert versions_response.json() == []


def test_content_update_with_tags_still_creates_version() -> None:
    writing = create_tag("writing")

    prompt = create_prompt()

    response = client.patch(
        f"/api/v1/prompts/{prompt['id']}",
        json={
            "title": "Changed title",
            "tag_ids": [
                writing["id"],
            ],
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
    assert versions[0]["title"] == "Tagged prompt"


def test_deleting_tag_removes_prompt_relationship() -> None:
    writing = create_tag("writing")

    prompt = create_prompt(
        tag_ids=[
            writing["id"],
        ],
    )

    delete_response = client.delete(
        f"/api/v1/tags/{writing['id']}",
    )

    assert delete_response.status_code == 204

    prompt_response = client.get(
        f"/api/v1/prompts/{prompt['id']}",
    )

    assert prompt_response.status_code == 200
    assert prompt_response.json()["tags"] == []


def test_duplicate_prompt_preserves_tags() -> None:
    writing = create_tag("writing")
    research = create_tag("research")

    original = create_prompt(
        tag_ids=[
            writing["id"],
            research["id"],
        ],
    )

    response = client.post(
        f"/api/v1/prompts/{original['id']}/duplicate",
    )

    assert response.status_code == 201

    duplicate = response.json()

    assert duplicate["id"] != original["id"]

    assert {tag["name"] for tag in duplicate["tags"]} == {
        "writing",
        "research",
    }
