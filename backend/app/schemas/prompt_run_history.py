from datetime import datetime
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
)


class PromptRunHistoryResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    prompt_id: int

    provider: str
    model: str

    variables: dict[str, Any]

    temperature: float | None
    max_output_tokens: int | None

    output_text: str
    duration_ms: int

    input_tokens: int | None
    output_tokens: int | None
    total_tokens: int | None

    created_at: datetime