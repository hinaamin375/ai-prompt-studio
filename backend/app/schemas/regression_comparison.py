from pydantic import (
    BaseModel,
    ConfigDict,
)

from app.domain.regression_comparison import (
    RegressionChange,
    RegressionComparisonOutcome,
)


class RegressionSuiteSummaryResponse(
    BaseModel,
):
    model_config = ConfigDict(
        from_attributes=True,
    )

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


class RegressionAssertionComparisonResponse(
    BaseModel,
):
    model_config = ConfigDict(
        from_attributes=True,
    )

    expected: str

    passed_before: bool | None
    passed_after: bool | None

    change: RegressionChange


class RegressionTestComparisonResponse(
    BaseModel,
):
    model_config = ConfigDict(
        from_attributes=True,
    )

    test_case_id_before: int | None
    test_case_id_after: int | None

    name_before: str | None
    name_after: str | None

    passed_before: bool | None
    passed_after: bool | None

    change: RegressionChange

    assertions: list[
        RegressionAssertionComparisonResponse
    ]


class RegressionComparisonResponse(
    BaseModel,
):
    model_config = ConfigDict(
        from_attributes=True,
    )

    outcome: RegressionComparisonOutcome

    before: RegressionSuiteSummaryResponse
    after: RegressionSuiteSummaryResponse

    test_pass_rate_delta: float
    assertion_pass_rate_delta: float

    settings_changed: bool

    tests: list[
        RegressionTestComparisonResponse
    ]