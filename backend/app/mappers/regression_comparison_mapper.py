from __future__ import annotations

from typing import Any

from app.domain.regression_comparison import (
    RegressionAssertionSnapshot,
    RegressionSuiteSnapshot,
    RegressionTestSnapshot,
)
from app.models.prompt_test_case_result import (
    PromptTestCaseResult,
)
from app.models.prompt_test_suite_run import (
    PromptTestSuiteRun,
)


class RegressionComparisonMapper:
    def to_suite_snapshot(
        self,
        suite_run: PromptTestSuiteRun,
    ) -> RegressionSuiteSnapshot:
        return RegressionSuiteSnapshot(
            suite_run_id=suite_run.id,
            prompt_version_id=(
                suite_run.prompt_version_id
            ),
            prompt_version_number=(
                suite_run.prompt_version.version
                if suite_run.prompt_version
                is not None
                else None
            ),
            provider=suite_run.provider,
            model=suite_run.model,
            temperature=suite_run.temperature,
            max_output_tokens=(
                suite_run.max_output_tokens
            ),
            tests=tuple(
                self._to_test_snapshot(
                    result,
                )
                for result in suite_run.results
            ),
        )

    def _to_test_snapshot(
        self,
        result: PromptTestCaseResult,
    ) -> RegressionTestSnapshot:
        return RegressionTestSnapshot(
            test_case_id=result.test_case_id,
            name=result.test_case_name,
            passed=result.passed,
            assertions=tuple(
                self._to_assertion_snapshot(
                    assertion,
                )
                for assertion
                in result.assertions
            ),
        )

    def _to_assertion_snapshot(
        self,
        assertion: dict[str, Any],
    ) -> RegressionAssertionSnapshot:
        expected = assertion.get(
            "expected",
        )

        passed = assertion.get(
            "passed",
        )

        if not isinstance(
            expected,
            str,
        ):
            raise ValueError(
                "Stored regression assertion "
                "is missing a valid 'expected' "
                "value."
            )

        if not isinstance(
            passed,
            bool,
        ):
            raise ValueError(
                "Stored regression assertion "
                "is missing a valid 'passed' "
                "value."
            )

        return RegressionAssertionSnapshot(
            expected=expected,
            passed=passed,
        )


regression_comparison_mapper = (
    RegressionComparisonMapper()
)