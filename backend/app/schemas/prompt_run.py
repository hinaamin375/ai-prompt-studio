from typing import Any

from pydantic import (
    BaseModel,
    Field,
)


class PromptRunRequest(BaseModel):
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

    variables: dict[str, Any] = Field(
        default_factory=dict,
    )


class PromptRunUsage(BaseModel):
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None


class PromptRunResponse(BaseModel):
    provider: str
    model: str

    output_text: str

    duration_ms: int

    usage: PromptRunUsage
