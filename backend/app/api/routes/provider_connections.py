from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.provider_connection import (
    ProviderConnectionResponse,
    ProviderConnectionTestResponse,
    ProviderConnectionUpsert,
)
from app.services.provider_connection_service import (
    provider_connection_service,
)


router = APIRouter(
    prefix="/provider-connections",
    tags=["Provider Connections"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.get(
    "",
    response_model=list[ProviderConnectionResponse],
)
def list_provider_connections(
    db: DatabaseSession,
) -> list[ProviderConnectionResponse]:
    return provider_connection_service.list_connections(db)


@router.put(
    "/{provider_id}",
    response_model=ProviderConnectionResponse,
)
def connect_provider(
    provider_id: str,
    data: ProviderConnectionUpsert,
    db: DatabaseSession,
) -> ProviderConnectionResponse:
    return provider_connection_service.upsert_connection(
        db,
        provider_id,
        data,
    )


@router.delete(
    "/{provider_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def disconnect_provider(
    provider_id: str,
    db: DatabaseSession,
) -> Response:
    provider_connection_service.remove_connection(
        db,
        provider_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{provider_id}/test",
    response_model=ProviderConnectionTestResponse,
)
def test_provider_connection(
    provider_id: str,
    db: DatabaseSession,
) -> ProviderConnectionTestResponse:
    return provider_connection_service.test_connection(
        db,
        provider_id,
    )
