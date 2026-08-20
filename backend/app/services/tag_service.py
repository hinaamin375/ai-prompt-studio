from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.tag import Tag
from app.repositories.tag_repository import (
    tag_repository,
)
from app.schemas.tag import (
    TagCreate,
    TagUpdate,
)


class TagService:
    def create_tag(
        self,
        db: Session,
        data: TagCreate,
    ) -> Tag:
        name = data.name.strip()

        if not name:
            raise ApplicationError(
                "Tag name cannot be empty.",
                code="invalid_tag_name",
                status_code=400,
            )

        existing_tag = tag_repository.get_by_name(
            db,
            name,
        )

        if existing_tag is not None:
            raise ApplicationError(
                "A tag with this name already exists.",
                code="tag_name_exists",
                status_code=409,
            )

        tag = Tag(
            name=name,
        )

        return tag_repository.create(
            db,
            tag,
        )

    def list_tags(
        self,
        db: Session,
    ) -> list[Tag]:
        return tag_repository.list_all(db)

    def get_tag(
        self,
        db: Session,
        tag_id: int,
    ) -> Tag:
        tag = tag_repository.get_by_id(
            db,
            tag_id,
        )

        if tag is None:
            raise ApplicationError(
                "The requested tag was not found.",
                code="tag_not_found",
                status_code=404,
            )

        return tag

    def update_tag(
        self,
        db: Session,
        tag_id: int,
        data: TagUpdate,
    ) -> Tag:
        tag = self.get_tag(
            db,
            tag_id,
        )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        if "name" in update_data:
            name = update_data["name"]

            if name is None:
                raise ApplicationError(
                    "Tag name cannot be empty.",
                    code="invalid_tag_name",
                    status_code=400,
                )

            name = name.strip()

            if not name:
                raise ApplicationError(
                    "Tag name cannot be empty.",
                    code="invalid_tag_name",
                    status_code=400,
                )

            existing_tag = tag_repository.get_by_name(
                db,
                name,
            )

            if existing_tag is not None and existing_tag.id != tag.id:
                raise ApplicationError(
                    "A tag with this name already exists.",
                    code="tag_name_exists",
                    status_code=409,
                )

            tag.name = name

        return tag_repository.update(
            db,
            tag,
        )

    def delete_tag(
        self,
        db: Session,
        tag_id: int,
    ) -> None:
        tag = self.get_tag(
            db,
            tag_id,
        )

        tag_repository.delete(
            db,
            tag,
        )


tag_service = TagService()
