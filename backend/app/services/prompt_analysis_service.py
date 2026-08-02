"""
Business logic for analyzing saved prompts.
"""

from __future__ import annotations

from collections.abc import Mapping

from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.engine import (
    PromptAnalyzer,
    PromptParser,
    PromptRenderer,
    PromptStatisticsEngine,
)
from app.mappers import PromptMapper
from app.repositories.prompt_repository import prompt_repository
from app.schemas.analysis import PromptAnalysis


class PromptAnalysisService:
    """
    Coordinate saved-prompt analysis.

    This service loads a prompt, converts it into the Prompt Engine's
    domain representation, and runs the analyzer.
    """

    def __init__(self) -> None:
        self._analyzer = PromptAnalyzer(
            parser=PromptParser(),
            renderer=PromptRenderer(),
            statistics=PromptStatisticsEngine(),
        )

    def analyze_prompt(
        self,
        db: Session,
        prompt_id: int,
        variables: Mapping[str, object] | None = None,
    ) -> PromptAnalysis:
        """
        Analyze one saved prompt.

        Args:
            db:
                Active SQLAlchemy database session.

            prompt_id:
                Primary key of the saved prompt.

            variables:
                Optional placeholder values used during rendering.

        Returns:
            Structured prompt-analysis result.

        Raises:
            ApplicationError:
                If the requested prompt does not exist.
        """
        prompt = prompt_repository.get_by_id(
            db=db,
            prompt_id=prompt_id,
        )

        if prompt is None:
            raise ApplicationError(
                "The requested prompt was not found.",
                code="prompt_not_found",
                status_code=404,
            )

        document = PromptMapper.to_document(prompt)

        return self._analyzer.analyze(
            document=document,
            variables=variables or {},
        )


prompt_analysis_service = PromptAnalysisService()