import re
import secrets

from fastapi import APIRouter

from app.api.dependencies import CurrentSession, DatabaseSession
from app.models.workspace import Workspace
from app.models.workspace_membership import WorkspaceMembership
from app.repositories.workspace_repository import workspace_repository
from app.schemas.auth import WorkspaceResponse
from app.schemas.workspace import WorkspaceCreate


router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


def _slug(value: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    base = base[:100] or "workspace"
    return f"{base}-{secrets.token_hex(3)}"


@router.get("", response_model=list[WorkspaceResponse])
def list_workspaces(
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> list[WorkspaceResponse]:
    return [
        WorkspaceResponse(
            id=workspace.id,
            name=workspace.name,
            slug=workspace.slug,
            role=membership.role,
        )
        for workspace, membership in workspace_repository.list_for_user(
            db, authenticated.user.id
        )
    ]


@router.post("", response_model=WorkspaceResponse, status_code=201)
def create_workspace(
    data: WorkspaceCreate,
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> WorkspaceResponse:
    workspace = workspace_repository.create(
        db,
        Workspace(name=data.name.strip(), slug=_slug(data.name)),
    )
    membership = workspace_repository.add_membership(
        db,
        WorkspaceMembership(
            user_id=authenticated.user.id,
            workspace_id=workspace.id,
            role="owner",
        ),
    )
    db.commit()
    db.refresh(workspace)
    db.refresh(membership)
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        slug=workspace.slug,
        role=membership.role,
    )
