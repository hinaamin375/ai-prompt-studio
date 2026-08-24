from datetime import datetime
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class PromptTestCaseCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    variables: dict[str, Any] = Field(
        default_factory=dict,
    )

    expected_contains: list[str] = Field(
        default_factory=list,
    )


class PromptTestCaseUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    variables: dict[str, Any] | None = None

    expected_contains: list[str] | None = None


class PromptTestCaseResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    prompt_id: int

    name: str
    description: str | None

    variables: dict[str, Any]
    expected_contains: list[str]

    created_at: datetime
    updated_at: datetime