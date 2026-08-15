from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tag import Tag


class TagRepository:
    def create(
        self,
        db: Session,
        tag: Tag,
    ) -> Tag:
        db.add(tag)
        db.commit()
        db.refresh(tag)

        return tag

    def list_all(
        self,
        db: Session,
    ) -> list[Tag]:
        statement = (
            select(Tag)
            .order_by(Tag.name.asc())
        )

        return list(
            db.scalars(statement).all(),
        )

    def get_by_id(
        self,
        db: Session,
        tag_id: int,
    ) -> Tag | None:
        return db.get(Tag, tag_id)

    def get_by_name(
        self,
        db: Session,
        name: str,
    ) -> Tag | None:
        statement = select(Tag).where(
            Tag.name == name,
        )

        return db.scalar(statement)

    def update(
        self,
        db: Session,
        tag: Tag,
    ) -> Tag:
        db.commit()
        db.refresh(tag)

        return tag

    def delete(
        self,
        db: Session,
        tag: Tag,
    ) -> None:
        db.delete(tag)
        db.commit()


tag_repository = TagRepository()