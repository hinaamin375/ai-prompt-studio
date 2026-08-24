from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.prompt_test_case import (
    PromptTestCase,
)


class PromptTestCaseRepository:
    def create(
        self,
        db: Session,
        test_case: PromptTestCase,
    ) -> PromptTestCase:
        db.add(test_case)

        db.commit()

        db.refresh(test_case)

        return test_case

    def list_for_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptTestCase]:
        statement = (
            select(PromptTestCase)
            .where(
                PromptTestCase.prompt_id
                == prompt_id,
            )
            .order_by(
                PromptTestCase.created_at.desc(),
                PromptTestCase.id.desc(),
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
        test_case_id: int,
    ) -> PromptTestCase | None:
        statement = select(
            PromptTestCase,
        ).where(
            PromptTestCase.id
            == test_case_id,
            PromptTestCase.prompt_id
            == prompt_id,
        )

        return db.scalar(statement)

    def update(
        self,
        db: Session,
        test_case: PromptTestCase,
    ) -> PromptTestCase:
        db.add(test_case)

        db.commit()

        db.refresh(test_case)

        return test_case

    def delete(
        self,
        db: Session,
        test_case: PromptTestCase,
    ) -> None:
        db.delete(test_case)

        db.commit()


prompt_test_case_repository = (
    PromptTestCaseRepository()
)