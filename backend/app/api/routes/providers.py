from fastapi import APIRouter

from app.providers import (
    build_provider_registry,
)
from app.schemas.provider import (
    ProviderResponse,
)


router = APIRouter(
    prefix="/providers",
    tags=["Providers"],
)


@router.get(
    "",
    response_model=list[ProviderResponse],
)
def list_providers() -> list[ProviderResponse]:
    registry = build_provider_registry()

    return [
        ProviderResponse(
            id=provider.provider_id,
            name=provider.display_name,
            default_model=provider.default_model,
            models=[
                provider.default_model,
            ],
        )
        for provider in registry.configured_providers()
    ]
