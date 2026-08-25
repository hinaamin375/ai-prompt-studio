from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.prompt_test_case_result import (
    PromptTestCaseResult,
)
from app.models.prompt_test_suite_run import (
    PromptTestSuiteRun,
)
from app.repositories.prompt_test_suite_run_repository import (
    prompt_test_suite_run_repository,
)
from app.schemas.prompt_test_case_run import (
    PromptTestCaseRunRequest,
)
from app.schemas.prompt_test_suite_run import (
    PromptTestSuiteRunRequest,
)
from app.services.prompt_test_case_run_service import (
    PromptTestCaseRunService,
    prompt_test_case_run_service,
)
from app.services.prompt_test_case_service import (
    prompt_test_case_service,
)


class PromptTestSuiteRunService:
    def __init__(
        self,
        *,
        test_case_run_service: (
            PromptTestCaseRunService | None
        ) = None,
    ) -> None:
        self._test_case_run_service = (
            test_case_run_service
            or prompt_test_case_run_service
        )

    def run_suite(
        self,
        db: Session,
        prompt_id: int,
        data: PromptTestSuiteRunRequest,
    ) -> PromptTestSuiteRun:
        test_cases = (
            prompt_test_case_service.list_test_cases(
                db,
                prompt_id,
            )
        )

        if not test_cases:
            raise ApplicationError(
                "The prompt has no test cases to run.",
                code="prompt_test_suite_empty",
                status_code=400,
            )

        case_results = []

        for test_case in test_cases:
            result = (
                self._test_case_run_service.run_test_case(
                    db=db,
                    prompt_id=prompt_id,
                    test_case_id=test_case.id,
                    data=PromptTestCaseRunRequest(
                        provider=data.provider,
                        model=data.model,
                        temperature=data.temperature,
                        max_output_tokens=(
                            data.max_output_tokens
                        ),
                    ),
                )
            )

            case_results.append(result)

        passed_tests = sum(
            1
            for result in case_results
            if result.passed
        )

        total_tests = len(case_results)

        failed_tests = (
            total_tests - passed_tests
        )

        passed_assertions = sum(
            result.passed_count
            for result in case_results
        )

        failed_assertions = sum(
            result.failed_count
            for result in case_results
        )

        total_assertions = (
            passed_assertions
            + failed_assertions
        )

        first_run = case_results[0].run

        suite_run = PromptTestSuiteRun(
            prompt_id=prompt_id,
            provider=first_run.provider,
            model=first_run.model,
            temperature=data.temperature,
            max_output_tokens=(
                data.max_output_tokens
            ),
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            total_assertions=total_assertions,
            passed_assertions=passed_assertions,
            failed_assertions=failed_assertions,
        )

        suite_run.results = [
            PromptTestCaseResult(
                test_case_id=(
                    result.test_case_id
                ),
                prompt_run_id=(
                    result.run.id
                ),
                test_case_name=(
                    result.test_case_name
                ),
                passed=result.passed,
                passed_count=(
                    result.passed_count
                ),
                failed_count=(
                    result.failed_count
                ),
                assertions=[
                    assertion.model_dump()
                    for assertion
                    in result.assertions
                ],
            )
            for result in case_results
        ]

        return (
            prompt_test_suite_run_repository.create(
                db,
                suite_run,
            )
        )

    def list_suite_runs(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptTestSuiteRun]:
        # Also verifies that the prompt exists.
        prompt_test_case_service.list_test_cases(
            db,
            prompt_id,
        )

        return (
            prompt_test_suite_run_repository
            .list_for_prompt(
                db,
                prompt_id,
            )
        )

    def get_suite_run(
        self,
        db: Session,
        prompt_id: int,
        suite_run_id: int,
    ) -> PromptTestSuiteRun:
        # Also verifies that the prompt exists.
        prompt_test_case_service.list_test_cases(
            db,
            prompt_id,
        )

        suite_run = (
            prompt_test_suite_run_repository.get_by_id(
                db,
                prompt_id,
                suite_run_id,
            )
        )

        if suite_run is None:
            raise ApplicationError(
                "The requested prompt test suite run "
                "was not found.",
                code="prompt_test_suite_run_not_found",
                status_code=404,
            )

        return suite_run


prompt_test_suite_run_service = (
    PromptTestSuiteRunService()
)