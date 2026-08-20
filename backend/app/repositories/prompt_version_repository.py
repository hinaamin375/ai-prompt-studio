from sqlalchemy import (
    func,
    select,
)
from sqlalchemy.orm import Session

from app.models.prompt import Prompt
from app.models.prompt_version import PromptVersion


class PromptVersionRepository:
    def get_next_version_number(
        self,
        db: Session,
        prompt_id: int,
    ) -> int:
        statement = select(
            func.max(
                PromptVersion.version,
            ),
        ).where(
            PromptVersion.prompt_id == prompt_id,
        )

        latest_version = db.scalar(
            statement,
        )

        if latest_version is None:
            return 1

        return latest_version + 1

    def create_snapshot(
        self,
        db: Session,
        prompt: Prompt,
    ) -> PromptVersion:
        version_number = self.get_next_version_number(
            db,
            prompt.id,
        )

        version = PromptVersion(
            prompt_id=prompt.id,
            version=version_number,
            title=prompt.title,
            description=prompt.description,
            system_prompt=prompt.system_prompt,
            user_prompt=prompt.user_prompt,
            favorite=prompt.favorite,
            collection_id=prompt.collection_id,
        )

        db.add(version)

        return version

    def list_for_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptVersion]:
        statement = (
            select(PromptVersion)
            .where(
                PromptVersion.prompt_id == prompt_id,
            )
            .order_by(
                PromptVersion.version.desc(),
            )
        )

        return list(
            db.scalars(
                statement,
            ).all(),
        )

    def get_by_version(
        self,
        db: Session,
        prompt_id: int,
        version: int,
    ) -> PromptVersion | None:
        statement = select(
            PromptVersion,
        ).where(
            PromptVersion.prompt_id == prompt_id,
            PromptVersion.version == version,
        )

        return db.scalar(statement)


prompt_version_repository = PromptVersionRepository()
