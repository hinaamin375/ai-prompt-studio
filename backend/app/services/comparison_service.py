"""
Business logic for comparing two saved prompts.
"""

from __future__ import annotations

from difflib import SequenceMatcher

from sqlalchemy.orm import Session

from app.schemas.comparison import (
    PromptComparisonRequest,
    PromptComparisonResponse,
    PromptComparisonSummary,
)
from app.services.prompt_analysis_service import (
    prompt_analysis_service,
)


class PromptComparisonService:
    """
    Compare two saved prompts.

    This service analyzes both prompts and
    computes comparison metrics.
    """

    def calculate_similarity(
        self,
        left_text: str,
        right_text: str,
    ) -> float:
        """
        Calculate similarity percentage between
        two rendered prompts.
        """

        return round(
            SequenceMatcher(
                None,
                left_text,
                right_text,
            ).ratio()
            * 100,
            1,
        )

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

        left_text = "\n".join(
            message.content
            for message in left.rendered_document.messages
        )

        right_text = "\n".join(
            message.content
            for message in right.rendered_document.messages
        )

        similarity = self.calculate_similarity(
            left_text,
            right_text,
        )

        summary = PromptComparisonSummary(
            character_difference=(
                right.statistics.characters
                - left.statistics.characters
            ),
            word_difference=(
                right.statistics.words
                - left.statistics.words
            ),
            line_difference=(
                right.statistics.lines
                - left.statistics.lines
            ),
            token_difference=(
                right.statistics.estimated_tokens
                - left.statistics.estimated_tokens
            ),
            variable_difference=(
                len(right.variables)
                - len(left.variables)
            ),
            similarity=similarity,
        )

        return PromptComparisonResponse(
            left=left,
            right=right,
            summary=summary,
        )


prompt_comparison_service = PromptComparisonService()