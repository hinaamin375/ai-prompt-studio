from collections.abc import Generator
from types import SimpleNamespace

import pytest
from fastapi import Depends, Header
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401
from app.api.dependencies import get_current_session
from app.db.base import Base
from app.db.session import get_db
from app.main import app


test_engine = create_engine(
    "sqlite://",
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)


TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
    info={
        "workspace_id": 1,
        "user_id": 1,
    },
)


def override_get_db() -> Generator[
    Session,
    None,
    None,
]:
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


def override_get_current_session(
    db: Session = Depends(get_db),
    x_test_workspace_id: str = Header(default="1"),
):
    """Authenticate test requests without weakening production routes.

    The optional header lets isolation tests simulate another workspace while
    all existing tests continue to run in workspace 1.
    """
    workspace_id = int(x_test_workspace_id)
    db.info["workspace_id"] = workspace_id
    db.info["user_id"] = workspace_id

    return SimpleNamespace(
        user=SimpleNamespace(id=workspace_id),
        workspace=SimpleNamespace(id=workspace_id),
        membership=SimpleNamespace(role="owner"),
        session=SimpleNamespace(workspace_id=workspace_id),
    )


@pytest.fixture(autouse=True)
def prepare_database():
    """
    Create an isolated in-memory SQLite database
    for every test.

    The development database is never modified.
    """
    Base.metadata.drop_all(
        bind=test_engine,
    )

    Base.metadata.create_all(
        bind=test_engine,
    )

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_session] = (
        override_get_current_session
    )

    yield

    app.dependency_overrides.clear()

    Base.metadata.drop_all(
        bind=test_engine,
    )
