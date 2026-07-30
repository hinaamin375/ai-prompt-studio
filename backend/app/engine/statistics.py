"""
Prompt Statistics.
"""

from __future__ import annotations

from .interfaces import StatisticsProvider


class PromptStatistics(StatisticsProvider):
    """
    Calculates prompt statistics.
    """

    def analyze(self, text: str):
        raise NotImplementedError(
            "Statistics engine is not implemented yet."
        )