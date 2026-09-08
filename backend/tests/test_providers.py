from fastapi.testclient import TestClient

from app.api.dependencies import get_current_session
from app.main import app


client = TestClient(app)


def test_list_providers_requires_authentication() -> None:
    test_override = app.dependency_overrides.pop(
        get_current_session,
        None,
    )

    try:
        response = client.get("/api/v1/providers")
    finally:
        if test_override is not None:
            app.dependency_overrides[get_current_session] = test_override

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "authentication_required"
