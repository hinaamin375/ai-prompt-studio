import pytest

from app.domain.regression_comparison import (
    RegressionAssertionSnapshot,
    RegressionChange,
    RegressionComparator,
    RegressionComparisonOutcome,
    RegressionSuiteSnapshot,
    RegressionTestSnapshot,
)


def assertion(
    expected: str,
    passed: bool,
) -> RegressionAssertionSnapshot:
    return RegressionAssertionSnapshot(
        expected=expected,
        passed=passed,
    )


def make_make_test_case(
    *,
    test_case_id: int | None,
    name: str,
    passed: bool,
    assertions: tuple[
        RegressionAssertionSnapshot,
        ...,
    ],
) -> RegressionTestSnapshot:
    return RegressionTestSnapshot(
        test_case_id=test_case_id,
        name=name,
        passed=passed,
        assertions=assertions,
    )


def suite(
    *,
    suite_run_id: int,
    version: int,
    tests: tuple[
        RegressionTestSnapshot,
        ...,
    ],
    provider: str = "gemini",
    model: str = (
        "gemini-3.1-flash-lite"
    ),
    temperature: float | None = 0.2,
    max_output_tokens: int | None = 2000,
) -> RegressionSuiteSnapshot:
    return RegressionSuiteSnapshot(
        suite_run_id=suite_run_id,
        prompt_version_id=version,
        prompt_version_number=version,
        provider=provider,
        model=model,
        temperature=temperature,
        max_output_tokens=(
            max_output_tokens
        ),
        tests=tests,
    )


def test_unchanged_regression_suite() -> None:
    comparator = RegressionComparator()

    before = suite(
        suite_run_id=5,
        version=1,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Travel plan",
                passed=True,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                    assertion(
                        "$600",
                        True,
                    ),
                ),
            ),
        ),
    )

    after = suite(
        suite_run_id=6,
        version=2,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Travel plan",
                passed=True,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                    assertion(
                        "$600",
                        True,
                    ),
                ),
            ),
        ),
    )

    result = comparator.compare(
        before,
        after,
    )

    assert (
        result.outcome
        == RegressionComparisonOutcome.UNCHANGED
    )

    assert (
        result.test_pass_rate_delta
        == pytest.approx(0.0)
    )

    assert (
        result.assertion_pass_rate_delta
        == pytest.approx(0.0)
    )

    assert len(result.tests) == 1

    assert (
        result.tests[0].change
        == RegressionChange.UNCHANGED
    )


def test_regression_suite_improves() -> None:
    comparator = RegressionComparator()

    before = suite(
        suite_run_id=5,
        version=1,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Travel plan",
                passed=False,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                    assertion(
                        "$600",
                        False,
                    ),
                ),
            ),
        ),
    )

    after = suite(
        suite_run_id=6,
        version=2,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Travel plan",
                passed=True,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                    assertion(
                        "$600",
                        True,
                    ),
                ),
            ),
        ),
    )

    result = comparator.compare(
        before,
        after,
    )

    assert (
        result.outcome
        == RegressionComparisonOutcome.IMPROVED
    )

    assert (
        result.test_pass_rate_delta
        == pytest.approx(100.0)
    )

    assert (
        result.assertion_pass_rate_delta
        == pytest.approx(50.0)
    )

    comparison = result.tests[0]

    assert (
        comparison.change
        == RegressionChange.IMPROVED
    )

    assert (
        comparison.assertions[1].change
        == RegressionChange.IMPROVED
    )


def test_regression_suite_regresses() -> None:
    comparator = RegressionComparator()

    before = suite(
        suite_run_id=5,
        version=1,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Travel plan",
                passed=True,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                    assertion(
                        "$600",
                        True,
                    ),
                ),
            ),
        ),
    )

    after = suite(
        suite_run_id=6,
        version=2,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Travel plan",
                passed=False,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                    assertion(
                        "$600",
                        False,
                    ),
                ),
            ),
        ),
    )

    result = comparator.compare(
        before,
        after,
    )

    assert (
        result.outcome
        == RegressionComparisonOutcome.REGRESSED
    )

    assert (
        result.test_pass_rate_delta
        == pytest.approx(-100.0)
    )

    assert (
        result.assertion_pass_rate_delta
        == pytest.approx(-50.0)
    )

    assert (
        result.tests[0].change
        == RegressionChange.REGRESSED
    )


def test_regression_suite_can_be_mixed() -> None:
    comparator = RegressionComparator()

    before = suite(
        suite_run_id=5,
        version=1,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Skardu",
                passed=False,
                assertions=(
                    assertion(
                        "Day 7",
                        False,
                    ),
                ),
            ),
            make_make_test_case(
                test_case_id=20,
                name="Istanbul",
                passed=True,
                assertions=(
                    assertion(
                        "$600",
                        True,
                    ),
                ),
            ),
        ),
    )

    after = suite(
        suite_run_id=6,
        version=2,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Skardu",
                passed=True,
                assertions=(
                    assertion(
                        "Day 7",
                        True,
                    ),
                ),
            ),
            make_make_test_case(
                test_case_id=20,
                name="Istanbul",
                passed=False,
                assertions=(
                    assertion(
                        "$600",
                        False,
                    ),
                ),
            ),
        ),
    )

    result = comparator.compare(
        before,
        after,
    )

    assert (
        result.outcome
        == RegressionComparisonOutcome.MIXED
    )

    assert (
        result.tests[0].change
        == RegressionChange.IMPROVED
    )

    assert (
        result.tests[1].change
        == RegressionChange.REGRESSED
    )


def test_added_and_removed_tests_are_tracked() -> None:
    comparator = RegressionComparator()

    before = suite(
        suite_run_id=5,
        version=1,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Old test",
                passed=True,
                assertions=(
                    assertion(
                        "old",
                        True,
                    ),
                ),
            ),
        ),
    )

    after = suite(
        suite_run_id=6,
        version=2,
        tests=(
            make_make_test_case(
                test_case_id=20,
                name="New test",
                passed=True,
                assertions=(
                    assertion(
                        "new",
                        True,
                    ),
                ),
            ),
        ),
    )

    result = comparator.compare(
        before,
        after,
    )

    assert (
        result.outcome
        == RegressionComparisonOutcome.UNCHANGED
    )

    assert len(result.tests) == 2

    assert (
        result.tests[0].change
        == RegressionChange.REMOVED
    )

    assert (
        result.tests[1].change
        == RegressionChange.ADDED
    )


def test_test_case_id_survives_rename() -> None:
    comparator = RegressionComparator()

    before = suite(
        suite_run_id=5,
        version=1,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Travel plan",
                passed=True,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                ),
            ),
        ),
    )

    after = suite(
        suite_run_id=6,
        version=2,
        tests=(
            make_make_test_case(
                test_case_id=10,
                name="Budget travel plan",
                passed=True,
                assertions=(
                    assertion(
                        "Day 1",
                        True,
                    ),
                ),
            ),
        ),
    )

    result = comparator.compare(
        before,
        after,
    )

    assert len(result.tests) == 1

    comparison = result.tests[0]

    assert (
        comparison.name_before
        == "Travel plan"
    )

    assert (
        comparison.name_after
        == "Budget travel plan"
    )

    assert (
        comparison.change
        == RegressionChange.UNCHANGED
    )


def test_execution_setting_change_is_detected() -> None:
    comparator = RegressionComparator()

    tests = (
        make_make_test_case(
            test_case_id=10,
            name="Travel plan",
            passed=True,
            assertions=(
                assertion(
                    "Day 1",
                    True,
                ),
            ),
        ),
    )

    before = suite(
        suite_run_id=5,
        version=1,
        tests=tests,
        temperature=0.2,
    )

    after = suite(
        suite_run_id=6,
        version=2,
        tests=tests,
        temperature=0.7,
    )

    result = comparator.compare(
        before,
        after,
    )

    assert result.settings_changed is True

    assert (
        result.outcome
        == RegressionComparisonOutcome.UNCHANGED
    )