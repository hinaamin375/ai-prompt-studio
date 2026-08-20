from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class CollectionBase(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )


class CollectionResponse(CollectionBase):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    created_at: datetime
    updated_at: datetime
