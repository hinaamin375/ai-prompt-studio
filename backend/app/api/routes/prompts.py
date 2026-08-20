from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analysis import (
    PromptAnalysis,
    PromptAnalyzeRequest,
)
from app.schemas.prompt import (
    PromptCreate,
    PromptResponse,
    PromptUpdate,
)
from app.schemas.prompt_version import (
    PromptVersionResponse,
)
from app.services.prompt_analysis_service import (
    prompt_analysis_service,
)
from app.services.prompt_service import (
    prompt_service,
)
from app.services.prompt_version_service import (
    prompt_version_service,
)


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
    return prompt_service.create_prompt(
        db,
        data,
    )
@router.post(
    "/{prompt_id}/duplicate",
    response_model=PromptResponse,
    status_code=status.HTTP_201_CREATED,
)
def duplicate_prompt(
    prompt_id: int,
    db: DatabaseSession,
) -> PromptResponse:
    """
    Create an independent copy of a saved prompt.
    """
    return prompt_service.duplicate_prompt(
        db,
        prompt_id,
    )

@router.get(
    "",
    response_model=list[PromptResponse],
)
def list_prompts(
    db: DatabaseSession,
) -> list[PromptResponse]:
    return prompt_service.list_prompts(
        db,
    )


@router.get(
    "/{prompt_id}/versions",
    response_model=list[
        PromptVersionResponse
    ],
)
def list_prompt_versions(
    prompt_id: int,
    db: DatabaseSession,
) -> list[PromptVersionResponse]:
    return (
        prompt_version_service.list_versions(
            db,
            prompt_id,
        )
    )


@router.get(
    "/{prompt_id}/versions/{version}",
    response_model=PromptVersionResponse,
)
def get_prompt_version(
    prompt_id: int,
    version: int,
    db: DatabaseSession,
) -> PromptVersionResponse:
    return (
        prompt_version_service.get_version(
            db,
            prompt_id,
            version,
        )
    )


@router.post(
    "/{prompt_id}/versions/{version}/restore",
    response_model=PromptResponse,
)
def restore_prompt_version(
    prompt_id: int,
    version: int,
    db: DatabaseSession,
) -> PromptResponse:
    return (
        prompt_version_service.restore_version(
            db,
            prompt_id,
            version,
        )
    )


@router.post(
    "/{prompt_id}/analyze",
    response_model=PromptAnalysis,
)
def analyze_prompt(
    prompt_id: int,
    data: PromptAnalyzeRequest,
    db: DatabaseSession,
) -> PromptAnalysis:
    """
    Analyze a saved prompt using optional variable values.
    """
    return (
        prompt_analysis_service.analyze_prompt(
            db=db,
            prompt_id=prompt_id,
            variables=data.variables,
        )
    )


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