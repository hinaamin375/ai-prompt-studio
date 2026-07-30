"""
Interfaces for the Prompt Engine.

These abstract classes define the contract that every
engine implementation must follow.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain import PromptDocument
from app.schemas.analysis import (
    PromptStatistics,
    PromptVariable,
)


class Parser(ABC):
    """Base interface for prompt parsers."""

    @abstractmethod
    def parse(
        self,
        document: PromptDocument,
    ) -> list[PromptVariable]:
        """
        Parse a prompt.

        Parameters
        ----------
        document:
            Prompt document to parse.

        Returns
        -------
        list[PromptVariable]
            List of parsed variables.
        """
        raise NotImplementedError


class Renderer(ABC):
    """Base interface for prompt renderers."""

    @abstractmethod
    def render(
        self,
        document: PromptDocument,
        variables: dict[str, str],
    ) -> PromptDocument:
        """
        Render a prompt.

        Parameters
        ----------
        document:
            Prompt document to render.

        variables:
            Values to substitute.

        Returns
        -------
        str
            Rendered prompt.
        """
        raise NotImplementedError


class StatisticsProvider(ABC):
    """Base interface for statistics engines."""

    @abstractmethod
    def analyze(self, document: PromptDocument) -> PromptStatistics:
        """
        Calculate statistics for a prompt.
        """
        raise NotImplementedError