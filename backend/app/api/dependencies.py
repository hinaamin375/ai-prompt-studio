from typing import Annotated

from fastapi import Cookie, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services.auth_service import AuthenticatedSession, auth_service


DatabaseSession = Annotated[Session, Depends(get_db)]


def get_current_session(
    db: DatabaseSession,
    session_cookie: Annotated[
        str | None,
        Cookie(alias=settings.auth_cookie_name),
    ] = None,
) -> AuthenticatedSession:
    return auth_service.authenticate(db, session_cookie)


CurrentSession = Annotated[
    AuthenticatedSession,
    Depends(get_current_session),
]
