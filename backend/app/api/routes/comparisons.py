"""
Prompt comparison endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.comparison import (
    PromptComparisonRequest,
    PromptComparisonResponse,
)
from app.services.comparison_service import (
    prompt_comparison_service,
)

router = APIRouter(
    prefix="/comparisons",
    tags=["comparisons"],
)


@router.post(
    "",
    response_model=PromptComparisonResponse,
)
def compare_prompts(
    request: PromptComparisonRequest,
    db: Session = Depends(get_db),
) -> PromptComparisonResponse:
    return prompt_comparison_service.compare(
        db=db,
        request=request,
    )
