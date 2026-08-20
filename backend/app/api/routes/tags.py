from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tag import (
    TagCreate,
    TagResponse,
    TagUpdate,
)
from app.services.tag_service import (
    tag_service,
)


router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
)


DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "",
    response_model=TagResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_tag(
    data: TagCreate,
    db: DatabaseSession,
) -> TagResponse:
    return tag_service.create_tag(
        db,
        data,
    )


@router.get(
    "",
    response_model=list[TagResponse],
)
def list_tags(
    db: DatabaseSession,
) -> list[TagResponse]:
    return tag_service.list_tags(db)


@router.get(
    "/{tag_id}",
    response_model=TagResponse,
)
def get_tag(
    tag_id: int,
    db: DatabaseSession,
) -> TagResponse:
    return tag_service.get_tag(
        db,
        tag_id,
    )


@router.patch(
    "/{tag_id}",
    response_model=TagResponse,
)
def update_tag(
    tag_id: int,
    data: TagUpdate,
    db: DatabaseSession,
) -> TagResponse:
    return tag_service.update_tag(
        db,
        tag_id,
        data,
    )


@router.delete(
    "/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_tag(
    tag_id: int,
    db: DatabaseSession,
) -> Response:
    tag_service.delete_tag(
        db,
        tag_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
