from fastapi import APIRouter

from app.api.dependencies import CurrentSession, DatabaseSession
from app.schemas.provider import ProviderResponse
from app.services.provider_connection_service import provider_connection_service


router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("", response_model=list[ProviderResponse])
def list_providers(
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> list[ProviderResponse]:
    del authenticated
    return [
        ProviderResponse(
            id=connection.provider,
            name=connection.name,
            default_model=connection.default_model,
            models=connection.models,
        )
        for connection in provider_connection_service.list_connected_providers(db)
    ]
