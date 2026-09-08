from fastapi.testclient import TestClient

from app.main import app
from app.services.prompt_service import (
    prompt_service,
)
from app.services.prompt_version_service import (
    prompt_version_service,
)
from tests.conftest import TestingSessionLocal


client = TestClient(app)


def test_ensure_current_version_reuses_snapshot():
    response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Version test",
            "description": None,
            "system_prompt": (
                "You are a helpful assistant."
            ),
            "user_prompt": (
                "Explain {{topic}}."
            ),
        },
    )

    assert response.status_code == 201

    prompt_id = response.json()["id"]

    db = TestingSessionLocal()

    try:
        prompt = prompt_service.get_prompt(
            db,
            prompt_id,
        )

        first = (
            prompt_version_service
            .ensure_current_version(
                db,
                prompt,
            )
        )

        db.commit()

        second = (
            prompt_version_service
            .ensure_current_version(
                db,
                prompt,
            )
        )

        db.commit()

        assert first.id == second.id
        assert first.version == 1
        assert second.version == 1

        versions = (
            prompt_version_service
            .list_versions(
                db,
                prompt_id,
            )
        )

        assert len(versions) == 1

    finally:
        db.close()

def test_edit_creates_next_current_version():
    response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Original",
            "description": None,
            "system_prompt": None,
            "user_prompt": "Original prompt",
        },
    )

    assert response.status_code == 201

    prompt_id = response.json()["id"]

    db = TestingSessionLocal()

    try:
        prompt = prompt_service.get_prompt(
            db,
            prompt_id,
        )

        version_1 = (
            prompt_version_service
            .ensure_current_version(
                db,
                prompt,
            )
        )

        db.commit()

        assert version_1.version == 1

    finally:
        db.close()

    update_response = client.patch(
        f"/api/v1/prompts/{prompt_id}",
        json={
            "user_prompt": "Updated prompt",
        },
    )

    assert update_response.status_code == 200

    db = TestingSessionLocal()

    try:
        prompt = prompt_service.get_prompt(
            db,
            prompt_id,
        )

        current_version = (
            prompt_version_service
            .ensure_current_version(
                db,
                prompt,
            )
        )

        db.commit()

        assert current_version.version == 2
        assert (
            current_version.user_prompt
            == "Updated prompt"
        )

        versions = (
            prompt_version_service
            .list_versions(
                db,
                prompt_id,
            )
        )

        assert len(versions) == 2

        assert versions[0].version == 2
        assert versions[1].version == 1

    finally:
        db.close()