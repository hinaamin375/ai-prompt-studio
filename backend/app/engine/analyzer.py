"""
Prompt Analyzer.

Coordinates all Prompt Engine components.
"""

from __future__ import annotations

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