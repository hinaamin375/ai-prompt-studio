from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def _headers(workspace_id: int) -> dict[str, str]:
    return {"X-Test-Workspace-ID": str(workspace_id)}


def test_prompts_are_isolated_by_workspace() -> None:
    created = client.post(
        "/api/v1/prompts",
        headers=_headers(1),
        json={
            "title": "Workspace A prompt",
            "description": None,
            "system_prompt": None,
            "user_prompt": "Only A should see this.",
        },
    )
    assert created.status_code == 201
    prompt_id = created.json()["id"]

    workspace_b_list = client.get(
        "/api/v1/prompts",
        headers=_headers(2),
    )
    assert workspace_b_list.status_code == 200
    assert workspace_b_list.json() == []

    workspace_b_get = client.get(
        f"/api/v1/prompts/{prompt_id}",
        headers=_headers(2),
    )
    assert workspace_b_get.status_code == 404
    assert workspace_b_get.json()["error"]["code"] == "prompt_not_found"

    workspace_a_list = client.get(
        "/api/v1/prompts",
        headers=_headers(1),
    )
    assert workspace_a_list.status_code == 200
    assert [item["id"] for item in workspace_a_list.json()] == [prompt_id]


def test_collection_and_tag_names_are_workspace_local() -> None:
    for workspace_id in (1, 2):
        collection = client.post(
            "/api/v1/collections",
            headers=_headers(workspace_id),
            json={"name": "Research"},
        )
        assert collection.status_code == 201

        tag = client.post(
            "/api/v1/tags",
            headers=_headers(workspace_id),
            json={"name": "writing"},
        )
        assert tag.status_code == 201

    a_collections = client.get(
        "/api/v1/collections", headers=_headers(1)
    ).json()
    b_collections = client.get(
        "/api/v1/collections", headers=_headers(2)
    ).json()
    assert len(a_collections) == 1
    assert len(b_collections) == 1
    assert a_collections[0]["id"] != b_collections[0]["id"]

    a_tags = client.get("/api/v1/tags", headers=_headers(1)).json()
    b_tags = client.get("/api/v1/tags", headers=_headers(2)).json()
    assert len(a_tags) == 1
    assert len(b_tags) == 1
    assert a_tags[0]["id"] != b_tags[0]["id"]


def test_cross_workspace_collection_and_tag_cannot_be_assigned() -> None:
    collection = client.post(
        "/api/v1/collections",
        headers=_headers(1),
        json={"name": "Private collection"},
    ).json()
    tag = client.post(
        "/api/v1/tags",
        headers=_headers(1),
        json={"name": "private-tag"},
    ).json()

    prompt_with_foreign_collection = client.post(
        "/api/v1/prompts",
        headers=_headers(2),
        json={
            "title": "B prompt",
            "description": None,
            "system_prompt": None,
            "user_prompt": "Hello",
            "collection_id": collection["id"],
        },
    )
    assert prompt_with_foreign_collection.status_code == 404
    assert (
        prompt_with_foreign_collection.json()["error"]["code"]
        == "collection_not_found"
    )

    prompt_with_foreign_tag = client.post(
        "/api/v1/prompts",
        headers=_headers(2),
        json={
            "title": "B prompt",
            "description": None,
            "system_prompt": None,
            "user_prompt": "Hello",
            "tag_ids": [tag["id"]],
        },
    )
    assert prompt_with_foreign_tag.status_code == 404
    assert prompt_with_foreign_tag.json()["error"]["code"] == "tag_not_found"
