from pydantic import BaseModel


class ProviderResponse(BaseModel):
    id: str
    name: str
    default_model: str
    models: list[str]
