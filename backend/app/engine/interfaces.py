"""
Interfaces for the Prompt Engine.

These abstract classes define the contract that every
engine implementation must follow.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class Parser(ABC):
    """Base interface for prompt parsers."""

    @abstractmethod
    def parse(self, text: str) -> Any:
        """
        Parse a prompt.

        Parameters
        ----------
        text:
            Raw prompt text.

        Returns
        -------
        Any
            Parsed representation.
        """
        raise NotImplementedError


class Renderer(ABC):
    """Base interface for prompt renderers."""

    @abstractmethod
    def render(
        self,
        text: str,
        variables: dict[str, str],
    ) -> str:
        """
        Render a prompt.

        Parameters
        ----------
        text:
            Prompt template.

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
    def analyze(self, text: str) -> Any:
        """
        Calculate statistics for a prompt.
        """
        raise NotImplementedError