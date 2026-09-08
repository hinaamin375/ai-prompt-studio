from __future__ import annotations

import hashlib
import re
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ApplicationError
from app.models.auth_session import AuthSession
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_membership import WorkspaceMembership
from app.repositories.auth_session_repository import auth_session_repository
from app.repositories.collection_repository import collection_repository
from app.repositories.prompt_repository import prompt_repository
from app.repositories.provider_connection_repository import (
    provider_connection_repository,
)
from app.repositories.tag_repository import tag_repository
from app.repositories.user_repository import user_repository
from app.repositories.workspace_repository import workspace_repository
from app.schemas.auth import (
    AuthSessionResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
    WorkspaceResponse,
)
from app.services.password_service import password_service


@dataclass(frozen=True, slots=True)
class AuthenticatedSession:
    session: AuthSession
    user: User
    workspace: Workspace
    membership: WorkspaceMembership


class AuthService:
    @staticmethod
    def token_hash(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    @staticmethod
    def _slug(value: str) -> str:
        base = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
        base = base[:100] or "workspace"
        return f"{base}-{secrets.token_hex(3)}"

    def _workspace_response(
        self,
        workspace: Workspace,
        membership: WorkspaceMembership,
    ) -> WorkspaceResponse:
        return WorkspaceResponse(
            id=workspace.id,
            name=workspace.name,
            slug=workspace.slug,
            role=membership.role,
        )

    def response(
        self,
        db: Session,
        authenticated: AuthenticatedSession,
    ) -> AuthSessionResponse:
        workspaces = [
            self._workspace_response(workspace, membership)
            for workspace, membership in workspace_repository.list_for_user(
                db, authenticated.user.id
            )
        ]
        return AuthSessionResponse(
            user=UserResponse(
                id=authenticated.user.id,
                email=authenticated.user.email,
                full_name=authenticated.user.full_name,
            ),
            workspace=self._workspace_response(
                authenticated.workspace,
                authenticated.membership,
            ),
            workspaces=workspaces,
        )

    def create_session(
        self,
        db: Session,
        user: User,
        workspace: Workspace,
    ) -> tuple[str, AuthenticatedSession]:
        membership = workspace_repository.get_membership(
            db, user.id, workspace.id
        )
        if membership is None:
            raise ApplicationError(
                "You do not have access to this workspace.",
                code="workspace_access_denied",
                status_code=403,
            )

        raw_token = secrets.token_urlsafe(48)
        session = AuthSession(
            token_hash=self.token_hash(raw_token),
            user_id=user.id,
            workspace_id=workspace.id,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.auth_session_days),
        )
        auth_session_repository.create(db, session)
        db.commit()
        db.refresh(session)
        return raw_token, AuthenticatedSession(
            session=session,
            user=user,
            workspace=workspace,
            membership=membership,
        )

    def register(
        self,
        db: Session,
        data: RegisterRequest,
    ) -> tuple[str, AuthenticatedSession]:
        email = str(data.email).strip().lower()
        full_name = data.full_name.strip()

        if user_repository.get_by_email(db, email) is not None:
            raise ApplicationError(
                "An account with this email already exists.",
                code="email_already_registered",
                status_code=409,
            )

        user = user_repository.create(
            db,
            User(
                email=email,
                full_name=full_name,
                password_hash=password_service.hash(data.password),
            ),
        )
        workspace = workspace_repository.create(
            db,
            Workspace(
                name=f"{full_name}'s Workspace",
                slug=self._slug(full_name),
            ),
        )
        membership = workspace_repository.add_membership(
            db,
            WorkspaceMembership(
                user_id=user.id,
                workspace_id=workspace.id,
                role="owner",
            ),
        )

        # Preserve data from the pre-workspace application. Only rows that
        # are still unscoped are claimed; data already owned by another
        # workspace is never moved.
        provider_connection_repository.claim_unscoped(db, workspace.id)
        collection_repository.claim_unscoped(db, workspace.id)
        tag_repository.claim_unscoped(db, workspace.id)
        prompt_repository.claim_unscoped(db, workspace.id)
        db.commit()
        db.refresh(user)
        db.refresh(workspace)
        db.refresh(membership)

        return self.create_session(db, user, workspace)

    def login(
        self,
        db: Session,
        data: LoginRequest,
    ) -> tuple[str, AuthenticatedSession]:
        email = str(data.email).strip().lower()
        user = user_repository.get_by_email(db, email)

        if user is None or not password_service.verify(
            data.password, user.password_hash
        ):
            raise ApplicationError(
                "Email or password is incorrect.",
                code="invalid_credentials",
                status_code=401,
            )

        if not user.is_active:
            raise ApplicationError(
                "This account is disabled.",
                code="account_disabled",
                status_code=403,
            )

        memberships = workspace_repository.list_for_user(db, user.id)
        if not memberships:
            raise ApplicationError(
                "This account has no workspace.",
                code="workspace_missing",
                status_code=409,
            )

        workspace, _membership = memberships[0]
        return self.create_session(db, user, workspace)

    def authenticate(
        self,
        db: Session,
        raw_token: str | None,
    ) -> AuthenticatedSession:
        if not raw_token:
            raise ApplicationError(
                "Authentication required.",
                code="authentication_required",
                status_code=401,
            )

        session = auth_session_repository.get_valid_by_hash(
            db, self.token_hash(raw_token)
        )
        if session is None:
            raise ApplicationError(
                "Your session has expired. Sign in again.",
                code="invalid_session",
                status_code=401,
            )

        user = user_repository.get_by_id(db, session.user_id)
        workspace = workspace_repository.get_by_id(db, session.workspace_id)
        membership = workspace_repository.get_membership(
            db, session.user_id, session.workspace_id
        )

        if (
            user is None
            or not user.is_active
            or workspace is None
            or membership is None
        ):
            raise ApplicationError(
                "Your session is no longer valid.",
                code="invalid_session",
                status_code=401,
            )

        # Services can safely discover the active workspace from the same
        # request-scoped SQLAlchemy session without changing every service API.
        db.info["workspace_id"] = workspace.id
        db.info["user_id"] = user.id

        return AuthenticatedSession(
            session=session,
            user=user,
            workspace=workspace,
            membership=membership,
        )

    def switch_workspace(
        self,
        db: Session,
        authenticated: AuthenticatedSession,
        workspace_id: int,
    ) -> AuthenticatedSession:
        membership = workspace_repository.get_membership(
            db, authenticated.user.id, workspace_id
        )
        workspace = workspace_repository.get_by_id(db, workspace_id)
        if membership is None or workspace is None:
            raise ApplicationError(
                "You do not have access to this workspace.",
                code="workspace_access_denied",
                status_code=403,
            )

        authenticated.session.workspace_id = workspace_id
        db.add(authenticated.session)
        db.commit()
        db.refresh(authenticated.session)
        db.info["workspace_id"] = workspace_id

        return AuthenticatedSession(
            session=authenticated.session,
            user=authenticated.user,
            workspace=workspace,
            membership=membership,
        )


auth_service = AuthService()
