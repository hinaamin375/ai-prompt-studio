from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.prompt_run import PromptRun


class PromptRunRepository:
    def create(
        self,
        db: Session,
        prompt_run: PromptRun,
    ) -> PromptRun:
        db.add(prompt_run)
        db.commit()
        db.refresh(prompt_run)

        return prompt_run

    def list_for_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptRun]:
        statement = (
            select(PromptRun)
            .where(
                PromptRun.prompt_id == prompt_id,
            )
            .order_by(
                PromptRun.created_at.desc(),
                PromptRun.id.desc(),
            )
        )

        return list(
            db.scalars(statement).all(),
        )

    def get_by_id(
        self,
        db: Session,
        prompt_id: int,
        run_id: int,
    ) -> PromptRun | None:
        statement = select(
            PromptRun,
        ).where(
            PromptRun.id == run_id,
            PromptRun.prompt_id == prompt_id,
        )

        return db.scalar(statement)


prompt_run_repository = PromptRunRepository()
