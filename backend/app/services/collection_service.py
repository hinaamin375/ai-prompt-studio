from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.collection import Collection
from app.repositories.collection_repository import (
    collection_repository,
)
from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
)


class CollectionService:
    def create_collection(
        self,
        db: Session,
        data: CollectionCreate,
    ) -> Collection:
        name = data.name.strip()

        if not name:
            raise ApplicationError(
                "Collection name cannot be empty.",
                code="invalid_collection_name",
                status_code=400,
            )

        existing_collection = collection_repository.get_by_name(
            db,
            name,
        )

        if existing_collection is not None:
            raise ApplicationError(
                "A collection with this name already exists.",
                code="collection_name_exists",
                status_code=409,
            )

        collection = Collection(
            name=name,
        )

        return collection_repository.create(
            db,
            collection,
        )

    def list_collections(
        self,
        db: Session,
    ) -> list[Collection]:
        return collection_repository.list_all(db)

    def get_collection(
        self,
        db: Session,
        collection_id: int,
    ) -> Collection:
        collection = collection_repository.get_by_id(
            db,
            collection_id,
        )

        if collection is None:
            raise ApplicationError(
                "The requested collection was not found.",
                code="collection_not_found",
                status_code=404,
            )

        return collection

    def update_collection(
        self,
        db: Session,
        collection_id: int,
        data: CollectionUpdate,
    ) -> Collection:
        collection = self.get_collection(
            db,
            collection_id,
        )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        if "name" in update_data:
            name = update_data["name"]

            if name is None:
                raise ApplicationError(
                    "Collection name cannot be null.",
                    code="invalid_collection_name",
                    status_code=400,
                )

            name = name.strip()

            if not name:
                raise ApplicationError(
                    "Collection name cannot be empty.",
                    code="invalid_collection_name",
                    status_code=400,
                )

            existing_collection = collection_repository.get_by_name(
                db,
                name,
            )

            if (
                existing_collection is not None
                and existing_collection.id != collection.id
            ):
                raise ApplicationError(
                    "A collection with this name already exists.",
                    code="collection_name_exists",
                    status_code=409,
                )

            collection.name = name

        return collection_repository.update(
            db,
            collection,
        )

    def delete_collection(
        self,
        db: Session,
        collection_id: int,
    ) -> None:
        collection = self.get_collection(
            db,
            collection_id,
        )

        collection_repository.delete(
            db,
            collection,
        )


collection_service = CollectionService()
