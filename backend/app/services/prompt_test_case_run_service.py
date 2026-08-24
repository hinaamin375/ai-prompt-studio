from sqlalchemy.orm import Session

from app.schemas.prompt_run import (
    PromptRunRequest,
)
from app.schemas.prompt_test_case_run import (
    PromptTestAssertionResult,
    PromptTestCaseRunRequest,
    PromptTestCaseRunResponse,
)
from app.services.prompt_run_service import (
    PromptRunService,
    prompt_run_service,
)
from app.services.prompt_test_case_service import (
    prompt_test_case_service,
)


class PromptTestCaseRunService:
    def __init__(
        self,
        *,
        prompt_run_service_instance: (
            PromptRunService | None
        ) = None,
    ) -> None:
        self._prompt_run_service = (
            prompt_run_service_instance
            or prompt_run_service
        )

    def run_test_case(
        self,
        db: Session,
        prompt_id: int,
        test_case_id: int,
        data: PromptTestCaseRunRequest,
    ) -> PromptTestCaseRunResponse:
        test_case = (
            prompt_test_case_service.get_test_case(
                db,
                prompt_id,
                test_case_id,
            )
        )

        run_result = (
            self._prompt_run_service.run_prompt(
                db=db,
                prompt_id=prompt_id,
                data=PromptRunRequest(
                    provider=data.provider,
                    model=data.model,
                    variables=dict(
                        test_case.variables,
                    ),
                    temperature=(
                        data.temperature
                    ),
                    max_output_tokens=(
                        data.max_output_tokens
                    ),
                ),
            )
        )

        output_lower = (
            run_result.output_text.lower()
        )

        assertions = [
            PromptTestAssertionResult(
                expected=expected,
                passed=(
                    expected.lower()
                    in output_lower
                ),
            )
            for expected
            in test_case.expected_contains
        ]

        passed_count = sum(
            1
            for assertion in assertions
            if assertion.passed
        )

        failed_count = (
            len(assertions)
            - passed_count
        )

        return PromptTestCaseRunResponse(
            test_case_id=test_case.id,
            test_case_name=test_case.name,
            passed=failed_count == 0,
            passed_count=passed_count,
            failed_count=failed_count,
            assertions=assertions,
            run=run_result,
        )


prompt_test_case_run_service = (
    PromptTestCaseRunService()
)