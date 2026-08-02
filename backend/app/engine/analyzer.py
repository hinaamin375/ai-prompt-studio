"""
Prompt Analyzer.
"""

from __future__ import annotations

from collections.abc import Mapping

from app.domain import PromptDocument
from app.schemas.analysis import PromptAnalysis

from .interfaces import (
    Parser,
    Renderer,
    StatisticsProvider,
)


class PromptAnalyzer:
    """
    Coordinates the Prompt Engine.
    """

    def __init__(
        self,
        parser: Parser,
        renderer: Renderer,
        statistics: StatisticsProvider,
    ):
        self._parser = parser
        self._renderer = renderer
        self._statistics = statistics

    def analyze(
        self,
        document: PromptDocument,
        variables: Mapping[str, object] | None = None,
    ) -> PromptAnalysis:

        variables = variables or {}

        occurrences = self._parser.parse(document)

        rendered_document = self._renderer.render(
            document,
            variables,
        )

        stats = self._statistics.analyze(rendered_document)

        missing = sorted(
            {
                variable.name
                for variable in occurrences
                if variable.name not in variables
            }
        )

        rendered_text = "\n\n".join(
            message.content for message in rendered_document.messages
        )

        warnings: list[str] = []

        if stats.estimated_tokens > 8000:
            warnings.append("Prompt exceeds approximately 8000 tokens.")

        return PromptAnalysis(
            statistics=stats,
            variables=occurrences,
            rendered_document=rendered_document,
            missing_variables=missing,
            warnings=warnings,
            errors=[],
        )
