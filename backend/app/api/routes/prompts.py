from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.prompt import (
    PromptCreate,
    PromptResponse,
    PromptUpdate,
)
from app.services.prompt_service import prompt_service

router = APIRouter(
    prefix="/prompts",
    tags=["Prompts"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "",
    response_model=PromptResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_prompt(
    data: PromptCreate,
    db: DatabaseSession,
) -> PromptResponse:
    return prompt_service.create_prompt(db, data)


@router.get(
    "",
    response_model=list[PromptResponse],
)
def list_prompts(
    db: DatabaseSession,
) -> list[PromptResponse]:
    return prompt_service.list_prompts(db)


@router.get(
    "/{prompt_id}",
    response_model=PromptResponse,
)
def get_prompt(
    prompt_id: int,
    db: DatabaseSession,
) -> PromptResponse:
    return prompt_service.get_prompt(
        db,
        prompt_id,
    )


@router.patch(
    "/{prompt_id}",
    response_model=PromptResponse,
)
def update_prompt(
    prompt_id: int,
    data: PromptUpdate,
    db: DatabaseSession,
) -> PromptResponse:
    return prompt_service.update_prompt(
        db,
        prompt_id,
        data,
    )


@router.delete(
    "/{prompt_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_prompt(
    prompt_id: int,
    db: DatabaseSession,
) -> Response:
    prompt_service.delete_prompt(
        db,
        prompt_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )