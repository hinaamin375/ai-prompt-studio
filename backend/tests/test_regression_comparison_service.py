from unittest.mock import Mock

from app.domain.regression_comparison import (
    RegressionComparisonOutcome,
)
from app.mappers.regression_comparison_mapper import (
    RegressionComparisonMapper,
)
from app.models.prompt_test_case_result import (
    PromptTestCaseResult,
)
from app.models.prompt_test_suite_run import (
    PromptTestSuiteRun,
)
from app.models.prompt_version import (
    PromptVersion,
)
from app.services.regression_comparison_service import (
    RegressionComparisonService,
)


def make_suite(
    *,
    suite_id: int,
    version_id: int,
    version_number: int,
    passed: bool,
) -> PromptTestSuiteRun:
    prompt_version = PromptVersion(
        id=version_id,
        prompt_id=1,
        version=version_number,
        title="Travel planner",
        description=None,
        system_prompt=None,
        user_prompt="Create a travel plan.",
        favorite=False,
        collection_id=None,
    )

    suite_run = PromptTestSuiteRun(
        id=suite_id,
        prompt_id=1,
        prompt_version_id=version_id,
        provider="gemini",
        model="gemini-3.1-flash-lite",
        temperature=0.2,
        max_output_tokens=2000,
        total_tests=1,
        passed_tests=(
            1 if passed else 0
        ),
        failed_tests=(
            0 if passed else 1
        ),
        total_assertions=1,
        passed_assertions=(
            1 if passed else 0
        ),
        failed_assertions=(
            0 if passed else 1
        ),
    )

    suite_run.prompt_version = (
        prompt_version
    )

    suite_run.results = [
        PromptTestCaseResult(
            id=suite_id * 10,
            suite_run_id=suite_id,
            test_case_id=10,
            prompt_run_id=None,
            test_case_name="Travel plan",
            passed=passed,
            passed_count=(
                1 if passed else 0
            ),
            failed_count=(
                0 if passed else 1
            ),
            assertions=[
                {
                    "expected": "Day 1",
                    "passed": passed,
                }
            ],
        )
    ]

    return suite_run


def test_compare_suite_runs_uses_persisted_history() -> None:
    before = make_suite(
        suite_id=5,
        version_id=100,
        version_number=1,
        passed=False,
    )

    after = make_suite(
        suite_id=6,
        version_id=101,
        version_number=2,
        passed=True,
    )

    suite_run_service = Mock()

    suite_run_service.get_suite_run.side_effect = [
        before,
        after,
    ]

    service = RegressionComparisonService(
        suite_run_service=(
            suite_run_service
        ),
        mapper=(
            RegressionComparisonMapper()
        ),
    )

    db = Mock()

    result = service.compare_suite_runs(
        db=db,
        prompt_id=1,
        before_suite_run_id=5,
        after_suite_run_id=6,
    )

    assert (
        result.outcome
        == RegressionComparisonOutcome.IMPROVED
    )

    assert (
        result.before.suite_run_id
        == 5
    )

    assert (
        result.before.prompt_version_number
        == 1
    )

    assert (
        result.after.suite_run_id
        == 6
    )

    assert (
        result.after.prompt_version_number
        == 2
    )

    assert (
        result.test_pass_rate_delta
        == 100.0
    )

    assert (
        result.assertion_pass_rate_delta
        == 100.0
    )

    assert (
        suite_run_service
        .get_suite_run.call_count
        == 2
    )

    suite_run_service.get_suite_run.assert_any_call(
        db=db,
        prompt_id=1,
        suite_run_id=5,
    )

    suite_run_service.get_suite_run.assert_any_call(
        db=db,
        prompt_id=1,
        suite_run_id=6,
    )