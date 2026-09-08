from typing import Annotated

from fastapi import APIRouter, Cookie, Response

from app.api.dependencies import CurrentSession, DatabaseSession
from app.core.config import settings
from app.core.exceptions import ApplicationError
from app.schemas.auth import (
    AuthSessionResponse,
    LoginRequest,
    RegisterRequest,
)
from app.services.auth_service import auth_service


router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_session_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=raw_token,
        max_age=settings.auth_session_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        path="/",
    )


@router.post("/register", response_model=AuthSessionResponse, status_code=201)
def register(
    data: RegisterRequest,
    response: Response,
    db: DatabaseSession,
) -> AuthSessionResponse:
    raw_token, authenticated = auth_service.register(db, data)
    _set_session_cookie(response, raw_token)
    return auth_service.response(db, authenticated)


@router.post("/login", response_model=AuthSessionResponse)
def login(
    data: LoginRequest,
    response: Response,
    db: DatabaseSession,
) -> AuthSessionResponse:
    raw_token, authenticated = auth_service.login(db, data)
    _set_session_cookie(response, raw_token)
    return auth_service.response(db, authenticated)


@router.get("/me", response_model=AuthSessionResponse)
def me(
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> AuthSessionResponse:
    return auth_service.response(db, authenticated)


@router.post(
    "/workspaces/{workspace_id}/select",
    response_model=AuthSessionResponse,
)
def select_workspace(
    workspace_id: int,
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> AuthSessionResponse:
    selected = auth_service.switch_workspace(
        db, authenticated, workspace_id
    )
    return auth_service.response(db, selected)


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    db: DatabaseSession,
    session_cookie: Annotated[
        str | None,
        Cookie(alias=settings.auth_cookie_name),
    ] = None,
) -> Response:
    if session_cookie:
        try:
            authenticated = auth_service.authenticate(db, session_cookie)
        except ApplicationError:
            authenticated = None
        if authenticated is not None:
            db.delete(authenticated.session)
            db.commit()

    response.delete_cookie(
        settings.auth_cookie_name,
        path="/",
        secure=settings.auth_cookie_secure,
        samesite="lax",
    )
    response.status_code = 204
    return response
