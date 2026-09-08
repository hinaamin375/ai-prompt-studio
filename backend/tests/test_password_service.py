from app.services.password_service import password_service


def test_password_hash_round_trip() -> None:
    encoded = password_service.hash("a-strong-password")

    assert encoded != "a-strong-password"
    assert password_service.verify("a-strong-password", encoded)
    assert not password_service.verify("wrong-password", encoded)
