from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.workspace_scope import current_workspace_id
from app.models.collection import Collection


class CollectionRepository:
    def create(self, db: Session, collection: Collection) -> Collection:
        collection.workspace_id = current_workspace_id(db)
        db.add(collection)
        db.commit()
        db.refresh(collection)
        return collection

    def list_all(self, db: Session) -> list[Collection]:
        workspace_id = current_workspace_id(db)
        statement = (
            select(Collection)
            .where(Collection.workspace_id == workspace_id)
            .order_by(Collection.name.asc())
        )
        return list(db.scalars(statement).all())

    def get_by_id(self, db: Session, collection_id: int) -> Collection | None:
        workspace_id = current_workspace_id(db)
        statement = select(Collection).where(
            Collection.id == collection_id,
            Collection.workspace_id == workspace_id,
        )
        return db.scalar(statement)

    def get_by_name(self, db: Session, name: str) -> Collection | None:
        workspace_id = current_workspace_id(db)
        statement = select(Collection).where(
            Collection.name == name,
            Collection.workspace_id == workspace_id,
        )
        return db.scalar(statement)

    def claim_unscoped(self, db: Session, workspace_id: int) -> int:
        result = db.execute(
            update(Collection)
            .where(Collection.workspace_id.is_(None))
            .values(workspace_id=workspace_id)
        )
        return int(result.rowcount or 0)

    def update(self, db: Session, collection: Collection) -> Collection:
        if collection.workspace_id != current_workspace_id(db):
            raise RuntimeError("Cannot update a collection outside the active workspace.")
        db.commit()
        db.refresh(collection)
        return collection

    def delete(self, db: Session, collection: Collection) -> None:
        if collection.workspace_id != current_workspace_id(db):
            raise RuntimeError("Cannot delete a collection outside the active workspace.")
        db.delete(collection)
        db.commit()


collection_repository = CollectionRepository()
