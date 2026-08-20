from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.prompt import Prompt
from app.models.prompt_version import PromptVersion
from app.repositories.prompt_repository import (
    prompt_repository,
)
from app.repositories.prompt_version_repository import (
    prompt_version_repository,
)


class PromptVersionService:
    def _get_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> Prompt:
        prompt = prompt_repository.get_by_id(
            db,
            prompt_id,
        )

        if prompt is None:
            raise ApplicationError(
                "The requested prompt was not found.",
                code="prompt_not_found",
                status_code=404,
            )

        return prompt

    def _get_version(
        self,
        db: Session,
        prompt_id: int,
        version: int,
    ) -> PromptVersion:
        prompt_version = prompt_version_repository.get_by_version(
            db,
            prompt_id,
            version,
        )

        if prompt_version is None:
            raise ApplicationError(
                "The requested prompt version was not found.",
                code="prompt_version_not_found",
                status_code=404,
            )

        return prompt_version

    def create_snapshot(
        self,
        db: Session,
        prompt: Prompt,
    ) -> PromptVersion:
        return prompt_version_repository.create_snapshot(
            db,
            prompt,
        )

    def list_versions(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptVersion]:
        self._get_prompt(
            db,
            prompt_id,
        )

        return prompt_version_repository.list_for_prompt(
            db,
            prompt_id,
        )

    def get_version(
        self,
        db: Session,
        prompt_id: int,
        version: int,
    ) -> PromptVersion:
        self._get_prompt(
            db,
            prompt_id,
        )

        return self._get_version(
            db,
            prompt_id,
            version,
        )

    def restore_version(
        self,
        db: Session,
        prompt_id: int,
        version: int,
    ) -> Prompt:
        prompt = self._get_prompt(
            db,
            prompt_id,
        )

        prompt_version = self._get_version(
            db,
            prompt_id,
            version,
        )

        fields = (
            "title",
            "description",
            "system_prompt",
            "user_prompt",
            "favorite",
            "collection_id",
        )

        has_changes = any(
            getattr(prompt, field)
            != getattr(
                prompt_version,
                field,
            )
            for field in fields
        )

        if not has_changes:
            return prompt

        # Preserve the current state before restoring
        # an older version.
        self.create_snapshot(
            db,
            prompt,
        )

        for field in fields:
            setattr(
                prompt,
                field,
                getattr(
                    prompt_version,
                    field,
                ),
            )

        return prompt_repository.update(
            db,
            prompt,
        )


prompt_version_service = PromptVersionService()
