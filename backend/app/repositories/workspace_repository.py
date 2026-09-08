from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.workspace import Workspace
from app.models.workspace_membership import WorkspaceMembership


class WorkspaceRepository:
    def get_by_id(self, db: Session, workspace_id: int) -> Workspace | None:
        return db.get(Workspace, workspace_id)

    def create(self, db: Session, workspace: Workspace) -> Workspace:
        db.add(workspace)
        db.flush()
        return workspace

    def add_membership(
        self,
        db: Session,
        membership: WorkspaceMembership,
    ) -> WorkspaceMembership:
        db.add(membership)
        db.flush()
        return membership

    def get_membership(
        self,
        db: Session,
        user_id: int,
        workspace_id: int,
    ) -> WorkspaceMembership | None:
        statement = select(WorkspaceMembership).where(
            WorkspaceMembership.user_id == user_id,
            WorkspaceMembership.workspace_id == workspace_id,
        )
        return db.scalar(statement)

    def list_for_user(
        self,
        db: Session,
        user_id: int,
    ) -> list[tuple[Workspace, WorkspaceMembership]]:
        statement = (
            select(Workspace, WorkspaceMembership)
            .join(
                WorkspaceMembership,
                WorkspaceMembership.workspace_id == Workspace.id,
            )
            .where(WorkspaceMembership.user_id == user_id)
            .order_by(Workspace.name.asc())
        )
        return list(db.execute(statement).all())


workspace_repository = WorkspaceRepository()
