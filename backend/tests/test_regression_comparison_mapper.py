import pytest

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


def make_suite_run() -> PromptTestSuiteRun:
    prompt_version = PromptVersion(
        id=101,
        prompt_id=1,
        version=2,
        title="Travel planner",
        description=None,
        system_prompt=None,
        user_prompt="Create a travel plan.",
        favorite=False,
        collection_id=None,
    )

    suite_run = PromptTestSuiteRun(
        id=6,
        prompt_id=1,
        prompt_version_id=101,
        provider="gemini",
        model="gemini-3.1-flash-lite",
        temperature=0.2,
        max_output_tokens=13400,
        total_tests=1,
        passed_tests=1,
        failed_tests=0,
        total_assertions=2,
        passed_assertions=2,
        failed_assertions=0,
    )

    suite_run.prompt_version = (
        prompt_version
    )

    suite_run.results = [
        PromptTestCaseResult(
            id=20,
            suite_run_id=6,
            test_case_id=10,
            prompt_run_id=30,
            test_case_name=(
                "Skardu 7 days trip"
            ),
            passed=True,
            passed_count=2,
            failed_count=0,
            assertions=[
                {
                    "expected": "Day 7",
                    "passed": True,
                },
                {
                    "expected": "$600",
                    "passed": True,
                },
            ],
        )
    ]

    return suite_run


def test_maps_persisted_suite_to_snapshot() -> None:
    mapper = RegressionComparisonMapper()

    suite_run = make_suite_run()

    snapshot = (
        mapper.to_suite_snapshot(
            suite_run,
        )
    )

    assert snapshot.suite_run_id == 6

    assert (
        snapshot.prompt_version_id
        == 101
    )

    assert (
        snapshot.prompt_version_number
        == 2
    )

    assert snapshot.provider == "gemini"

    assert (
        snapshot.model
        == "gemini-3.1-flash-lite"
    )

    assert snapshot.temperature == 0.2

    assert (
        snapshot.max_output_tokens
        == 13400
    )

    assert len(snapshot.tests) == 1

    test = snapshot.tests[0]

    assert test.test_case_id == 10

    assert (
        test.name
        == "Skardu 7 days trip"
    )

    assert test.passed is True

    assert len(test.assertions) == 2

    assert (
        test.assertions[0].expected
        == "Day 7"
    )

    assert (
        test.assertions[0].passed
        is True
    )


def test_maps_suite_without_version() -> None:
    mapper = RegressionComparisonMapper()

    suite_run = make_suite_run()

    suite_run.prompt_version_id = None
    suite_run.prompt_version = None

    snapshot = (
        mapper.to_suite_snapshot(
            suite_run,
        )
    )

    assert (
        snapshot.prompt_version_id
        is None
    )

    assert (
        snapshot.prompt_version_number
        is None
    )


def test_invalid_stored_assertion_fails() -> None:
    mapper = RegressionComparisonMapper()

    suite_run = make_suite_run()

    suite_run.results[0].assertions = [
        {
            "expected": "Day 7",
            "passed": "true",
        }
    ]

    with pytest.raises(
        ValueError,
        match="valid 'passed'",
    ):
        mapper.to_suite_snapshot(
            suite_run,
        )