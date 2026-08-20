from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.collection import (
    CollectionCreate,
    CollectionResponse,
    CollectionUpdate,
)
from app.services.collection_service import (
    collection_service,
)


router = APIRouter(
    prefix="/collections",
    tags=["Collections"],
)


DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "",
    response_model=CollectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_collection(
    data: CollectionCreate,
    db: DatabaseSession,
) -> CollectionResponse:
    return collection_service.create_collection(
        db,
        data,
    )


@router.get(
    "",
    response_model=list[CollectionResponse],
)
def list_collections(
    db: DatabaseSession,
) -> list[CollectionResponse]:
    return collection_service.list_collections(
        db,
    )


@router.get(
    "/{collection_id}",
    response_model=CollectionResponse,
)
def get_collection(
    collection_id: int,
    db: DatabaseSession,
) -> CollectionResponse:
    return collection_service.get_collection(
        db,
        collection_id,
    )


@router.patch(
    "/{collection_id}",
    response_model=CollectionResponse,
)
def update_collection(
    collection_id: int,
    data: CollectionUpdate,
    db: DatabaseSession,
) -> CollectionResponse:
    return collection_service.update_collection(
        db,
        collection_id,
        data,
    )


@router.delete(
    "/{collection_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_collection(
    collection_id: int,
    db: DatabaseSession,
) -> Response:
    collection_service.delete_collection(
        db,
        collection_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
