from pydantic import BaseModel, Field


class ProviderConnectionUpsert(BaseModel):
    api_key: str = Field(
        min_length=8,
        max_length=4096,
    )


class ProviderConnectionResponse(BaseModel):
    provider: str
    name: str
    connected: bool
    key_last_four: str | None
    default_model: str
    models: list[str]
    status: str


class ProviderConnectionTestResponse(BaseModel):
    ok: bool
    message: str
