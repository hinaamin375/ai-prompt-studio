from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.collection import Collection


class CollectionRepository:
    def create(
        self,
        db: Session,
        collection: Collection,
    ) -> Collection:
        db.add(collection)
        db.commit()
        db.refresh(collection)

        return collection

    def list_all(
        self,
        db: Session,
    ) -> list[Collection]:
        statement = select(Collection).order_by(
            Collection.name.asc(),
        )

        return list(
            db.scalars(statement).all(),
        )

    def get_by_id(
        self,
        db: Session,
        collection_id: int,
    ) -> Collection | None:
        return db.get(
            Collection,
            collection_id,
        )

    def get_by_name(
        self,
        db: Session,
        name: str,
    ) -> Collection | None:
        statement = select(Collection).where(
            Collection.name == name,
        )

        return db.scalar(statement)

    def update(
        self,
        db: Session,
        collection: Collection,
    ) -> Collection:
        db.commit()
        db.refresh(collection)

        return collection

    def delete(
        self,
        db: Session,
        collection: Collection,
    ) -> None:
        db.delete(collection)
        db.commit()


collection_repository = CollectionRepository()
