from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.core.workspace_scope import current_workspace_id
from app.models.prompt import Prompt


class PromptRepository:
    def create(self, db: Session, prompt: Prompt) -> Prompt:
        prompt.workspace_id = current_workspace_id(db)
        db.add(prompt)
        db.commit()
        db.refresh(prompt)
        return prompt

    def list_all(self, db: Session) -> list[Prompt]:
        workspace_id = current_workspace_id(db)
        statement = (
            select(Prompt)
            .options(selectinload(Prompt.tags))
            .where(Prompt.workspace_id == workspace_id)
            .order_by(Prompt.updated_at.desc())
        )
        return list(db.scalars(statement).all())

    def get_by_id(self, db: Session, prompt_id: int) -> Prompt | None:
        workspace_id = current_workspace_id(db)
        statement = (
            select(Prompt)
            .options(selectinload(Prompt.tags))
            .where(
                Prompt.id == prompt_id,
                Prompt.workspace_id == workspace_id,
            )
        )
        return db.scalar(statement)

    def claim_unscoped(self, db: Session, workspace_id: int) -> int:
        result = db.execute(
            update(Prompt)
            .where(Prompt.workspace_id.is_(None))
            .values(workspace_id=workspace_id)
        )
        return int(result.rowcount or 0)

    def update(self, db: Session, prompt: Prompt) -> Prompt:
        if prompt.workspace_id != current_workspace_id(db):
            raise RuntimeError("Cannot update a prompt outside the active workspace.")
        db.commit()
        db.refresh(prompt)
        return prompt

    def delete(self, db: Session, prompt: Prompt) -> None:
        if prompt.workspace_id != current_workspace_id(db):
            raise RuntimeError("Cannot delete a prompt outside the active workspace.")
        db.delete(prompt)
        db.commit()


prompt_repository = PromptRepository()
