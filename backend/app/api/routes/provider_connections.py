from fastapi import APIRouter, Response, status

from app.api.dependencies import CurrentSession, DatabaseSession
from app.schemas.provider_connection import (
    ProviderConnectionResponse,
    ProviderConnectionTestResponse,
    ProviderConnectionUpsert,
)
from app.services.provider_connection_service import provider_connection_service


router = APIRouter(
    prefix="/provider-connections",
    tags=["Provider Connections"],
)


@router.get("", response_model=list[ProviderConnectionResponse])
def list_provider_connections(
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> list[ProviderConnectionResponse]:
    del authenticated
    return provider_connection_service.list_connections(db)


@router.put("/{provider_id}", response_model=ProviderConnectionResponse)
def connect_provider(
    provider_id: str,
    data: ProviderConnectionUpsert,
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> ProviderConnectionResponse:
    del authenticated
    return provider_connection_service.upsert_connection(db, provider_id, data)


@router.delete("/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
def disconnect_provider(
    provider_id: str,
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> Response:
    del authenticated
    provider_connection_service.remove_connection(db, provider_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{provider_id}/test",
    response_model=ProviderConnectionTestResponse,
)
def test_provider_connection(
    provider_id: str,
    authenticated: CurrentSession,
    db: DatabaseSession,
) -> ProviderConnectionTestResponse:
    del authenticated
    return provider_connection_service.test_connection(db, provider_id)
