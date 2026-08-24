from sqlalchemy.orm import Session

from app.core.exceptions import (
    ApplicationError,
)
from app.models.prompt import Prompt
from app.models.prompt_test_case import (
    PromptTestCase,
)
from app.repositories.prompt_repository import (
    prompt_repository,
)
from app.repositories.prompt_test_case_repository import (
    prompt_test_case_repository,
)
from app.schemas.prompt_test_case import (
    PromptTestCaseCreate,
    PromptTestCaseUpdate,
)


class PromptTestCaseService:
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

    def _get_test_case(
        self,
        db: Session,
        prompt_id: int,
        test_case_id: int,
    ) -> PromptTestCase:
        test_case = (
            prompt_test_case_repository.get_by_id(
                db,
                prompt_id,
                test_case_id,
            )
        )

        if test_case is None:
            raise ApplicationError(
                "The requested prompt test case "
                "was not found.",
                code="prompt_test_case_not_found",
                status_code=404,
            )

        return test_case

    def create_test_case(
        self,
        db: Session,
        prompt_id: int,
        data: PromptTestCaseCreate,
    ) -> PromptTestCase:
        self._get_prompt(
            db,
            prompt_id,
        )

        test_case = PromptTestCase(
            prompt_id=prompt_id,
            name=data.name.strip(),
            description=data.description,
            variables=dict(
                data.variables,
            ),
            expected_contains=list(
                data.expected_contains,
            ),
        )

        return (
            prompt_test_case_repository.create(
                db,
                test_case,
            )
        )

    def list_test_cases(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptTestCase]:
        self._get_prompt(
            db,
            prompt_id,
        )

        return (
            prompt_test_case_repository
            .list_for_prompt(
                db,
                prompt_id,
            )
        )

    def get_test_case(
        self,
        db: Session,
        prompt_id: int,
        test_case_id: int,
    ) -> PromptTestCase:
        self._get_prompt(
            db,
            prompt_id,
        )

        return self._get_test_case(
            db,
            prompt_id,
            test_case_id,
        )

    def update_test_case(
        self,
        db: Session,
        prompt_id: int,
        test_case_id: int,
        data: PromptTestCaseUpdate,
    ) -> PromptTestCase:
        self._get_prompt(
            db,
            prompt_id,
        )

        test_case = self._get_test_case(
            db,
            prompt_id,
            test_case_id,
        )

        updates = data.model_dump(
            exclude_unset=True,
        )

        if "name" in updates:
            name = updates["name"]

            if name is not None:
                updates["name"] = (
                    name.strip()
                )

        if "variables" in updates:
            variables = updates[
                "variables"
            ]

            if variables is not None:
                updates["variables"] = dict(
                    variables,
                )

        if "expected_contains" in updates:
            expected_contains = updates[
                "expected_contains"
            ]

            if expected_contains is not None:
                updates[
                    "expected_contains"
                ] = list(
                    expected_contains,
                )

        for field, value in updates.items():
            setattr(
                test_case,
                field,
                value,
            )

        return (
            prompt_test_case_repository.update(
                db,
                test_case,
            )
        )

    def delete_test_case(
        self,
        db: Session,
        prompt_id: int,
        test_case_id: int,
    ) -> None:
        self._get_prompt(
            db,
            prompt_id,
        )

        test_case = self._get_test_case(
            db,
            prompt_id,
            test_case_id,
        )

        prompt_test_case_repository.delete(
            db,
            test_case,
        )


prompt_test_case_service = (
    PromptTestCaseService()
)