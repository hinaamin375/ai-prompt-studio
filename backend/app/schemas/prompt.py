from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    PositiveInt,
)

from app.schemas.tag import TagResponse


class PromptBase(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = None
    system_prompt: str | None = None

    user_prompt: str = Field(
        min_length=1,
    )

    favorite: bool = False

    collection_id: int | None = Field(
        default=None,
        gt=0,
    )


class PromptCreate(PromptBase):
    tag_ids: list[PositiveInt] = Field(
        default_factory=list,
    )


class PromptUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = None
    system_prompt: str | None = None

    user_prompt: str | None = Field(
        default=None,
        min_length=1,
    )

    favorite: bool | None = None

    collection_id: int | None = Field(
        default=None,
        gt=0,
    )

    tag_ids: list[PositiveInt] = Field(
        default_factory=list,
    )


class PromptResponse(PromptBase):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    created_at: datetime
    updated_at: datetime

    tags: list[TagResponse] = Field(
        default_factory=list,
    )