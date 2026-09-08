from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class RegressionComparisonOutcome(StrEnum):
    IMPROVED = "improved"
    REGRESSED = "regressed"
    UNCHANGED = "unchanged"
    MIXED = "mixed"


class RegressionChange(StrEnum):
    IMPROVED = "improved"
    REGRESSED = "regressed"
    UNCHANGED = "unchanged"
    ADDED = "added"
    REMOVED = "removed"


@dataclass(
    frozen=True,
    slots=True,
)
class RegressionAssertionSnapshot:
    expected: str
    passed: bool


@dataclass(
    frozen=True,
    slots=True,
)
class RegressionTestSnapshot:
    test_case_id: int | None
    name: str
    passed: bool

    assertions: tuple[
        RegressionAssertionSnapshot,
        ...,
    ] = ()


@dataclass(
    frozen=True,
    slots=True,
)
class RegressionSuiteSnapshot:
    suite_run_id: int

    prompt_version_id: int | None
    prompt_version_number: int | None

    provider: str
    model: str

    temperature: float | None
    max_output_tokens: int | None

    tests: tuple[
        RegressionTestSnapshot,
        ...,
    ] = ()

    @property
    def total_tests(self) -> int:
        return len(
            self.tests,
        )

    @property
    def passed_tests(self) -> int:
        return sum(
            1
            for test in self.tests
            if test.passed
        )

    @property
    def failed_tests(self) -> int:
        return (
            self.total_tests
            - self.passed_tests
        )

    @property
    def total_assertions(self) -> int:
        return sum(
            len(test.assertions)
            for test in self.tests
        )

    @property
    def passed_assertions(self) -> int:
        return sum(
            1
            for test in self.tests
            for assertion in test.assertions
            if assertion.passed
        )

    @property
    def failed_assertions(self) -> int:
        return (
            self.total_assertions
            - self.passed_assertions
        )

    @property
    def test_pass_rate(self) -> float:
        if self.total_tests == 0:
            return 0.0

        return (
            self.passed_tests
            / self.total_tests
        ) * 100.0

    @property
    def assertion_pass_rate(self) -> float:
        if self.total_assertions == 0:
            return 0.0

        return (
            self.passed_assertions
            / self.total_assertions
        ) * 100.0


@dataclass(
    frozen=True,
    slots=True,
)
class RegressionSuiteSummary:
    suite_run_id: int

    prompt_version_id: int | None
    prompt_version_number: int | None

    provider: str
    model: str

    temperature: float | None
    max_output_tokens: int | None

    total_tests: int
    passed_tests: int
    failed_tests: int
    test_pass_rate: float

    total_assertions: int
    passed_assertions: int
    failed_assertions: int
    assertion_pass_rate: float


@dataclass(
    frozen=True,
    slots=True,
)
class RegressionAssertionComparison:
    expected: str

    passed_before: bool | None
    passed_after: bool | None

    change: RegressionChange


@dataclass(
    frozen=True,
    slots=True,
)
class RegressionTestComparison:
    test_case_id_before: int | None
    test_case_id_after: int | None

    name_before: str | None
    name_after: str | None

    passed_before: bool | None
    passed_after: bool | None

    change: RegressionChange

    assertions: tuple[
        RegressionAssertionComparison,
        ...,
    ] = ()


@dataclass(
    frozen=True,
    slots=True,
)
class RegressionComparison:
    outcome: RegressionComparisonOutcome

    before: RegressionSuiteSummary
    after: RegressionSuiteSummary

    test_pass_rate_delta: float
    assertion_pass_rate_delta: float

    settings_changed: bool

    tests: tuple[
        RegressionTestComparison,
        ...,
    ]


class RegressionComparator:
    def compare(
        self,
        before: RegressionSuiteSnapshot,
        after: RegressionSuiteSnapshot,
    ) -> RegressionComparison:
        test_comparisons = (
            self._compare_tests(
                before.tests,
                after.tests,
            )
        )

        outcome = (
            self._determine_outcome(
                test_comparisons,
            )
        )

        before_summary = (
            self._build_summary(
                before,
            )
        )

        after_summary = (
            self._build_summary(
                after,
            )
        )

        return RegressionComparison(
            outcome=outcome,
            before=before_summary,
            after=after_summary,
            test_pass_rate_delta=(
                after.test_pass_rate
                - before.test_pass_rate
            ),
            assertion_pass_rate_delta=(
                after.assertion_pass_rate
                - before.assertion_pass_rate
            ),
            settings_changed=(
                self._settings_changed(
                    before,
                    after,
                )
            ),
            tests=tuple(
                test_comparisons,
            ),
        )

    def _build_summary(
        self,
        suite: RegressionSuiteSnapshot,
    ) -> RegressionSuiteSummary:
        return RegressionSuiteSummary(
            suite_run_id=(
                suite.suite_run_id
            ),
            prompt_version_id=(
                suite.prompt_version_id
            ),
            prompt_version_number=(
                suite.prompt_version_number
            ),
            provider=suite.provider,
            model=suite.model,
            temperature=suite.temperature,
            max_output_tokens=(
                suite.max_output_tokens
            ),
            total_tests=(
                suite.total_tests
            ),
            passed_tests=(
                suite.passed_tests
            ),
            failed_tests=(
                suite.failed_tests
            ),
            test_pass_rate=(
                suite.test_pass_rate
            ),
            total_assertions=(
                suite.total_assertions
            ),
            passed_assertions=(
                suite.passed_assertions
            ),
            failed_assertions=(
                suite.failed_assertions
            ),
            assertion_pass_rate=(
                suite.assertion_pass_rate
            ),
        )

    def _settings_changed(
        self,
        before: RegressionSuiteSnapshot,
        after: RegressionSuiteSnapshot,
    ) -> bool:
        return any(
            (
                before.provider
                != after.provider,
                before.model
                != after.model,
                before.temperature
                != after.temperature,
                before.max_output_tokens
                != after.max_output_tokens,
            )
        )

    def _compare_tests(
        self,
        before_tests: tuple[
            RegressionTestSnapshot,
            ...,
        ],
        after_tests: tuple[
            RegressionTestSnapshot,
            ...,
        ],
    ) -> list[
        RegressionTestComparison
    ]:
        pairs = self._pair_tests(
            before_tests,
            after_tests,
        )

        comparisons: list[
            RegressionTestComparison
        ] = []

        for before_test, after_test in pairs:
            comparisons.append(
                self._compare_test_pair(
                    before_test,
                    after_test,
                )
            )

        return comparisons

    def _pair_tests(
        self,
        before_tests: tuple[
            RegressionTestSnapshot,
            ...,
        ],
        after_tests: tuple[
            RegressionTestSnapshot,
            ...,
        ],
    ) -> list[
        tuple[
            RegressionTestSnapshot | None,
            RegressionTestSnapshot | None,
        ]
    ]:
        unmatched_after = list(
            after_tests,
        )

        pairs: list[
            tuple[
                RegressionTestSnapshot | None,
                RegressionTestSnapshot | None,
            ]
        ] = []

        for before_test in before_tests:
            match_index = (
                self._find_test_match(
                    before_test,
                    unmatched_after,
                )
            )

            if match_index is None:
                pairs.append(
                    (
                        before_test,
                        None,
                    )
                )
                continue

            after_test = (
                unmatched_after.pop(
                    match_index,
                )
            )

            pairs.append(
                (
                    before_test,
                    after_test,
                )
            )

        for after_test in unmatched_after:
            pairs.append(
                (
                    None,
                    after_test,
                )
            )

        return pairs

    def _find_test_match(
        self,
        before_test: RegressionTestSnapshot,
        candidates: list[
            RegressionTestSnapshot
        ],
    ) -> int | None:
        if before_test.test_case_id is not None:
            for index, candidate in enumerate(
                candidates,
            ):
                if (
                    candidate.test_case_id
                    == before_test.test_case_id
                ):
                    return index

        for index, candidate in enumerate(
            candidates,
        ):
            if (
                candidate.name
                == before_test.name
            ):
                return index

        return None

    def _compare_test_pair(
        self,
        before: RegressionTestSnapshot | None,
        after: RegressionTestSnapshot | None,
    ) -> RegressionTestComparison:
        if before is None:
            assert after is not None

            return RegressionTestComparison(
                test_case_id_before=None,
                test_case_id_after=(
                    after.test_case_id
                ),
                name_before=None,
                name_after=after.name,
                passed_before=None,
                passed_after=after.passed,
                change=RegressionChange.ADDED,
                assertions=tuple(
                    RegressionAssertionComparison(
                        expected=(
                            assertion.expected
                        ),
                        passed_before=None,
                        passed_after=(
                            assertion.passed
                        ),
                        change=(
                            RegressionChange.ADDED
                        ),
                    )
                    for assertion
                    in after.assertions
                ),
            )

        if after is None:
            return RegressionTestComparison(
                test_case_id_before=(
                    before.test_case_id
                ),
                test_case_id_after=None,
                name_before=before.name,
                name_after=None,
                passed_before=before.passed,
                passed_after=None,
                change=(
                    RegressionChange.REMOVED
                ),
                assertions=tuple(
                    RegressionAssertionComparison(
                        expected=(
                            assertion.expected
                        ),
                        passed_before=(
                            assertion.passed
                        ),
                        passed_after=None,
                        change=(
                            RegressionChange.REMOVED
                        ),
                    )
                    for assertion
                    in before.assertions
                ),
            )

        return RegressionTestComparison(
            test_case_id_before=(
                before.test_case_id
            ),
            test_case_id_after=(
                after.test_case_id
            ),
            name_before=before.name,
            name_after=after.name,
            passed_before=before.passed,
            passed_after=after.passed,
            change=(
                self._status_change(
                    before.passed,
                    after.passed,
                )
            ),
            assertions=tuple(
                self._compare_assertions(
                    before.assertions,
                    after.assertions,
                )
            ),
        )

    def _compare_assertions(
        self,
        before_assertions: tuple[
            RegressionAssertionSnapshot,
            ...,
        ],
        after_assertions: tuple[
            RegressionAssertionSnapshot,
            ...,
        ],
    ) -> list[
        RegressionAssertionComparison
    ]:
        unmatched_after = list(
            after_assertions,
        )

        comparisons: list[
            RegressionAssertionComparison
        ] = []

        for before in before_assertions:
            match_index = None

            for index, candidate in enumerate(
                unmatched_after,
            ):
                if (
                    candidate.expected
                    == before.expected
                ):
                    match_index = index
                    break

            if match_index is None:
                comparisons.append(
                    RegressionAssertionComparison(
                        expected=before.expected,
                        passed_before=(
                            before.passed
                        ),
                        passed_after=None,
                        change=(
                            RegressionChange.REMOVED
                        ),
                    )
                )
                continue

            after = unmatched_after.pop(
                match_index,
            )

            comparisons.append(
                RegressionAssertionComparison(
                    expected=before.expected,
                    passed_before=(
                        before.passed
                    ),
                    passed_after=(
                        after.passed
                    ),
                    change=(
                        self._status_change(
                            before.passed,
                            after.passed,
                        )
                    ),
                )
            )

        for after in unmatched_after:
            comparisons.append(
                RegressionAssertionComparison(
                    expected=after.expected,
                    passed_before=None,
                    passed_after=(
                        after.passed
                    ),
                    change=(
                        RegressionChange.ADDED
                    ),
                )
            )

        return comparisons

    def _status_change(
        self,
        before: bool,
        after: bool,
    ) -> RegressionChange:
        if before == after:
            return (
                RegressionChange.UNCHANGED
            )

        if not before and after:
            return (
                RegressionChange.IMPROVED
            )

        return RegressionChange.REGRESSED

    def _determine_outcome(
        self,
        tests: list[
            RegressionTestComparison
        ],
    ) -> RegressionComparisonOutcome:
        has_improvement = False
        has_regression = False

        for test in tests:
            if (
                test.change
                == RegressionChange.IMPROVED
            ):
                has_improvement = True

            elif (
                test.change
                == RegressionChange.REGRESSED
            ):
                has_regression = True

            for assertion in test.assertions:
                if (
                    assertion.change
                    == RegressionChange.IMPROVED
                ):
                    has_improvement = True

                elif (
                    assertion.change
                    == RegressionChange.REGRESSED
                ):
                    has_regression = True

        if (
            has_improvement
            and has_regression
        ):
            return (
                RegressionComparisonOutcome.MIXED
            )

        if has_regression:
            return (
                RegressionComparisonOutcome.REGRESSED
            )

        if has_improvement:
            return (
                RegressionComparisonOutcome.IMPROVED
            )

        return (
            RegressionComparisonOutcome.UNCHANGED
        )


regression_comparator = (
    RegressionComparator()
)