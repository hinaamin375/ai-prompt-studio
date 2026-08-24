from pydantic import (
    BaseModel,
    Field,
)

from app.schemas.prompt_run import (
    PromptRunResponse,
)


class PromptTestCaseRunRequest(BaseModel):
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


class PromptTestAssertionResult(BaseModel):
    expected: str
    passed: bool


class PromptTestCaseRunResponse(BaseModel):
    test_case_id: int
    test_case_name: str

    passed: bool
    passed_count: int
    failed_count: int

    assertions: list[
        PromptTestAssertionResult
    ]

    run: PromptRunResponse