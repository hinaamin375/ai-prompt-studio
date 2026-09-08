from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.provider import ProviderResponse
from app.services.provider_connection_service import (
    provider_connection_service,
)


router = APIRouter(
    prefix="/providers",
    tags=["Providers"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.get(
    "",
    response_model=list[ProviderResponse],
)
def list_providers(
    db: DatabaseSession,
) -> list[ProviderResponse]:
    return [
        ProviderResponse(
            id=connection.provider,
            name=connection.name,
            default_model=connection.default_model,
            models=connection.models,
        )
        for connection in provider_connection_service.list_connected_providers(db)
    ]
