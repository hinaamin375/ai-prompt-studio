from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.prompt import Prompt
from app.models.tag import Tag
from app.repositories.collection_repository import (
    collection_repository,
)
from app.repositories.prompt_repository import (
    prompt_repository,
)
from app.repositories.tag_repository import (
    tag_repository,
)
from app.schemas.prompt import (
    PromptCreate,
    PromptUpdate,
)
from app.services.prompt_version_service import (
    prompt_version_service,
)


VERSIONED_FIELDS = {
    "title",
    "description",
    "system_prompt",
    "user_prompt",
}


class PromptService:
    def _validate_collection(
        self,
        db: Session,
        collection_id: int | None,
    ) -> None:
        """
        Validate that a collection exists when a collection ID
        is supplied.

        None means the prompt does not belong to a collection.
        """
        if collection_id is None:
            return

        collection = (
            collection_repository.get_by_id(
                db,
                collection_id,
            )
        )

        if collection is None:
            raise ApplicationError(
                "The requested collection was not found.",
                code="collection_not_found",
                status_code=404,
            )

    def _get_tags(
        self,
        db: Session,
        tag_ids: list[int],
    ) -> list[Tag]:
        """
        Resolve tag IDs into Tag objects.

        Duplicate IDs are ignored while preserving the order
        supplied by the client.
        """
        if not tag_ids:
            return []

        unique_tag_ids = list(
            dict.fromkeys(tag_ids),
        )

        tags = tag_repository.get_by_ids(
            db,
            unique_tag_ids,
        )

        tags_by_id = {
            tag.id: tag
            for tag in tags
        }

        missing_tag_ids = [
            tag_id
            for tag_id in unique_tag_ids
            if tag_id not in tags_by_id
        ]

        if missing_tag_ids:
            raise ApplicationError(
                "One or more requested tags were not found.",
                code="tag_not_found",
                status_code=404,
            )

        return [
            tags_by_id[tag_id]
            for tag_id in unique_tag_ids
        ]

    def _has_versioned_changes(
        self,
        prompt: Prompt,
        update_data: dict[str, object],
    ) -> bool:
        """
        Determine whether this update changes prompt content.

        Favorite, collection, and tag-only changes deliberately
        do not create history entries.
        """
        for field in VERSIONED_FIELDS:
            if field not in update_data:
                continue

            if (
                getattr(prompt, field)
                != update_data[field]
            ):
                return True

        return False

    def create_prompt(
        self,
        db: Session,
        data: PromptCreate,
    ) -> Prompt:
        self._validate_collection(
            db,
            data.collection_id,
        )

        tags = self._get_tags(
            db,
            list(data.tag_ids),
        )

        prompt = Prompt(
            title=data.title.strip(),
            description=data.description,
            system_prompt=data.system_prompt,
            user_prompt=data.user_prompt,
            favorite=data.favorite,
            collection_id=data.collection_id,
            tags=tags,
        )

        return prompt_repository.create(
            db,
            prompt,
        )

    def duplicate_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> Prompt:
        """
        Create an independent copy of an existing prompt.

        The duplicate keeps the prompt content, collection,
        and tags, but starts unfavorited with its own
        version history.
        """
        source_prompt = self.get_prompt(
            db,
            prompt_id,
        )

        copy_suffix = " (Copy)"
        max_base_length = (
            200 - len(copy_suffix)
        )

        duplicate = Prompt(
            title=(
                source_prompt.title[
                    :max_base_length
                ]
                + copy_suffix
            ),
            description=(
                source_prompt.description
            ),
            system_prompt=(
                source_prompt.system_prompt
            ),
            user_prompt=(
                source_prompt.user_prompt
            ),
            favorite=False,
            collection_id=(
                source_prompt.collection_id
            ),
            tags=list(
                source_prompt.tags,
            ),
        )

        return prompt_repository.create(
            db,
            duplicate,
        )
    
    def list_prompts(
        self,
        db: Session,
    ) -> list[Prompt]:
        return prompt_repository.list_all(
            db,
        )

    def get_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> Prompt:
        prompt = (
            prompt_repository.get_by_id(
                db,
                prompt_id,
            )
        )

        if prompt is None:
            raise ApplicationError(
                "The requested prompt was not found.",
                code="prompt_not_found",
                status_code=404,
            )

        return prompt

    def update_prompt(
        self,
        db: Session,
        prompt_id: int,
        data: PromptUpdate,
    ) -> Prompt:
        prompt = self.get_prompt(
            db,
            prompt_id,
        )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        tag_ids = update_data.pop(
            "tag_ids",
            None,
        )

        tags: list[Tag] | None = None

        if tag_ids is not None:
            tags = self._get_tags(
                db,
                tag_ids,
            )

        if "title" in update_data:
            title = update_data["title"]

            if title is not None:
                update_data["title"] = (
                    title.strip()
                )

        if "collection_id" in update_data:
            self._validate_collection(
                db,
                update_data[
                    "collection_id"
                ],
            )

        has_versioned_changes = (
            self._has_versioned_changes(
                prompt,
                update_data,
            )
        )

        if has_versioned_changes:
            prompt_version_service.create_snapshot(
                db,
                prompt,
            )

        for field, value in update_data.items():
            setattr(
                prompt,
                field,
                value,
            )

        if tags is not None:
            prompt.tags = tags

        return prompt_repository.update(
            db,
            prompt,
        )

    def delete_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> None:
        prompt = self.get_prompt(
            db,
            prompt_id,
        )

        prompt_repository.delete(
            db,
            prompt,
        )


prompt_service = PromptService()