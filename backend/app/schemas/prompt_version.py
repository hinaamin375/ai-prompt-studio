from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PromptVersionResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    prompt_id: int
    version: int

    title: str
    description: str | None
    system_prompt: str | None
    user_prompt: str

    favorite: bool
    collection_id: int | None

    created_at: datetime
