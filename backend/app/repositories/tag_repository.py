from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.workspace_scope import current_workspace_id
from app.models.tag import Tag


class TagRepository:
    def create(self, db: Session, tag: Tag) -> Tag:
        tag.workspace_id = current_workspace_id(db)
        db.add(tag)
        db.commit()
        db.refresh(tag)
        return tag

    def list_all(self, db: Session) -> list[Tag]:
        workspace_id = current_workspace_id(db)
        statement = (
            select(Tag)
            .where(Tag.workspace_id == workspace_id)
            .order_by(Tag.name.asc())
        )
        return list(db.scalars(statement).all())

    def get_by_id(self, db: Session, tag_id: int) -> Tag | None:
        workspace_id = current_workspace_id(db)
        statement = select(Tag).where(
            Tag.id == tag_id,
            Tag.workspace_id == workspace_id,
        )
        return db.scalar(statement)

    def get_by_ids(self, db: Session, tag_ids: list[int]) -> list[Tag]:
        if not tag_ids:
            return []
        workspace_id = current_workspace_id(db)
        statement = select(Tag).where(
            Tag.id.in_(tag_ids),
            Tag.workspace_id == workspace_id,
        )
        return list(db.scalars(statement).all())

    def get_by_name(self, db: Session, name: str) -> Tag | None:
        workspace_id = current_workspace_id(db)
        statement = select(Tag).where(
            Tag.name == name,
            Tag.workspace_id == workspace_id,
        )
        return db.scalar(statement)

    def claim_unscoped(self, db: Session, workspace_id: int) -> int:
        result = db.execute(
            update(Tag)
            .where(Tag.workspace_id.is_(None))
            .values(workspace_id=workspace_id)
        )
        return int(result.rowcount or 0)

    def update(self, db: Session, tag: Tag) -> Tag:
        if tag.workspace_id != current_workspace_id(db):
            raise RuntimeError("Cannot update a tag outside the active workspace.")
        db.commit()
        db.refresh(tag)
        return tag

    def delete(self, db: Session, tag: Tag) -> None:
        if tag.workspace_id != current_workspace_id(db):
            raise RuntimeError("Cannot delete a tag outside the active workspace.")
        db.delete(tag)
        db.commit()


tag_repository = TagRepository()
