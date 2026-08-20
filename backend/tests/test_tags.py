from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_tag() -> None:
    response = client.post(
        "/api/v1/tags",
        json={
            "name": "writing",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "writing"
    assert isinstance(data["id"], int)
    assert "created_at" in data
    assert "updated_at" in data


def test_create_tag_trims_name() -> None:
    response = client.post(
        "/api/v1/tags",
        json={
            "name": "  resume  ",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "resume"


def test_list_tags() -> None:
    client.post(
        "/api/v1/tags",
        json={
            "name": "writing",
        },
    )

    client.post(
        "/api/v1/tags",
        json={
            "name": "analysis",
        },
    )

    response = client.get(
        "/api/v1/tags",
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert [tag["name"] for tag in data] == [
        "analysis",
        "writing",
    ]


def test_get_tag() -> None:
    create_response = client.post(
        "/api/v1/tags",
        json={
            "name": "coding",
        },
    )

    tag_id = create_response.json()["id"]

    response = client.get(
        f"/api/v1/tags/{tag_id}",
    )

    assert response.status_code == 200
    assert response.json()["name"] == "coding"


def test_get_missing_tag_returns_404() -> None:
    response = client.get(
        "/api/v1/tags/999999",
    )

    assert response.status_code == 404

    data = response.json()

    assert data["error"]["code"] == "tag_not_found"


def test_update_tag() -> None:
    create_response = client.post(
        "/api/v1/tags",
        json={
            "name": "old-name",
        },
    )

    tag_id = create_response.json()["id"]

    response = client.patch(
        f"/api/v1/tags/{tag_id}",
        json={
            "name": "new-name",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "new-name"


def test_delete_tag() -> None:
    create_response = client.post(
        "/api/v1/tags",
        json={
            "name": "temporary",
        },
    )

    tag_id = create_response.json()["id"]

    response = client.delete(
        f"/api/v1/tags/{tag_id}",
    )

    assert response.status_code == 204

    get_response = client.get(
        f"/api/v1/tags/{tag_id}",
    )

    assert get_response.status_code == 404


def test_duplicate_tag_name_returns_409() -> None:
    first_response = client.post(
        "/api/v1/tags",
        json={
            "name": "writing",
        },
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/v1/tags",
        json={
            "name": "writing",
        },
    )

    assert second_response.status_code == 409

    data = second_response.json()

    assert data["error"]["code"] == "tag_name_exists"


def test_update_tag_to_existing_name_returns_409() -> None:
    first_response = client.post(
        "/api/v1/tags",
        json={
            "name": "writing",
        },
    )

    second_response = client.post(
        "/api/v1/tags",
        json={
            "name": "coding",
        },
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    second_tag_id = second_response.json()["id"]

    response = client.patch(
        f"/api/v1/tags/{second_tag_id}",
        json={
            "name": "writing",
        },
    )

    assert response.status_code == 409
