import pytest

from app.db.base import Base
from app.db.session import engine
from app.models.prompt import Prompt


@pytest.fixture(autouse=True)
def prepare_database() -> None:
    """
    Create a clean SQLite schema for each test.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
