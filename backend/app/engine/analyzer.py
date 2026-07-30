"""
Prompt Analyzer.

Coordinates all Prompt Engine components.
"""

from __future__ import annotations

from app.domain import PromptDocument
from app.schemas.analysis import PromptAnalysis

from .parser import PromptParser
from .renderer import PromptRenderer
from .statistics import PromptStatistics


class PromptAnalyzer:
    """
    Main entry point into the Prompt Engine.
    """

    def __init__(
        self,
        parser: PromptParser,
        renderer: PromptRenderer,
        statistics: PromptStatistics,
    ):
        self.parser = parser
        self.renderer = renderer
        self.statistics = statistics

    def analyze(
        self,
        document: PromptDocument,
        variables: dict[str, str] | None = None,
    ) -> PromptAnalysis:
        """
        Analyze a prompt document.
        """
        raise NotImplementedError