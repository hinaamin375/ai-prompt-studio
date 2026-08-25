from sqlalchemy import select
from sqlalchemy.orm import (
    Session,
    selectinload,
)

from app.models.prompt_test_suite_run import (
    PromptTestSuiteRun,
)


class PromptTestSuiteRunRepository:
    def create(
        self,
        db: Session,
        suite_run: PromptTestSuiteRun,
    ) -> PromptTestSuiteRun:
        db.add(suite_run)

        db.commit()

        db.refresh(suite_run)

        return suite_run

    def list_for_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptTestSuiteRun]:
        statement = (
            select(PromptTestSuiteRun)
            .options(
                selectinload(
                    PromptTestSuiteRun.results,
                ),
            )
            .where(
                PromptTestSuiteRun.prompt_id
                == prompt_id,
            )
            .order_by(
                PromptTestSuiteRun.created_at.desc(),
                PromptTestSuiteRun.id.desc(),
            )
        )

        return list(
            db.scalars(
                statement,
            ).all(),
        )

    def get_by_id(
        self,
        db: Session,
        prompt_id: int,
        suite_run_id: int,
    ) -> PromptTestSuiteRun | None:
        statement = (
            select(PromptTestSuiteRun)
            .options(
                selectinload(
                    PromptTestSuiteRun.results,
                ),
            )
            .where(
                PromptTestSuiteRun.id
                == suite_run_id,
                PromptTestSuiteRun.prompt_id
                == prompt_id,
            )
        )

        return db.scalar(statement)


prompt_test_suite_run_repository = (
    PromptTestSuiteRunRepository()
)