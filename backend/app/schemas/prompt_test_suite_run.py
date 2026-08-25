from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from app.schemas.prompt_run import (
    PromptRunResponse,
)
from app.schemas.prompt_test_case_run import (
    PromptTestAssertionResult,
)


class PromptTestSuiteRunRequest(BaseModel):
    provider: str = Field(
        default="qwen",
        min_length=1,
        max_length=50,
    )

    model: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    temperature: float | None = Field(
        default=None,
        ge=0.0,
        le=2.0,
    )

    max_output_tokens: int | None = Field(
        default=None,
        ge=1,
        le=32768,
    )


class PromptTestCaseResultResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    test_case_id: int | None
    prompt_run_id: int | None

    test_case_name: str

    passed: bool
    passed_count: int
    failed_count: int

    assertions: list[
        PromptTestAssertionResult
    ]


class PromptTestSuiteRunResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    prompt_id: int

    provider: str
    model: str

    temperature: float | None
    max_output_tokens: int | None

    total_tests: int
    passed_tests: int
    failed_tests: int

    total_assertions: int
    passed_assertions: int
    failed_assertions: int

    created_at: datetime

    results: list[
        PromptTestCaseResultResponse
    ]