from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_list_providers_returns_only_connected_providers() -> None:
    response = client.get(
        "/api/v1/providers",
    )

    assert response.status_code == 200

    providers = response.json()

    assert providers == []