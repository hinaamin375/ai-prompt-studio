"""
Business logic for comparing two saved prompts.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.schemas.comparison import (
    PromptComparisonRequest,
    PromptComparisonResponse,
)
from app.services.prompt_analysis_service import (
    prompt_analysis_service,
)


class PromptComparisonService:
    """
    Compare two saved prompts.

    This service simply orchestrates two prompt analyses.
    """

    def compare(
        self,
        db: Session,
        request: PromptComparisonRequest,
    ) -> PromptComparisonResponse:

        left = prompt_analysis_service.analyze_prompt(
            db=db,
            prompt_id=request.left_prompt_id,
            variables=request.left_variables,
        )

        right = prompt_analysis_service.analyze_prompt(
            db=db,
            prompt_id=request.right_prompt_id,
            variables=request.right_variables,
        )

        return PromptComparisonResponse(
            left=left,
            right=right,
        )


prompt_comparison_service = PromptComparisonService()