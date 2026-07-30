"""
Abstract interfaces used by the Prompt Engine.

Concrete engine components implement these contracts. The analyzer depends
on the interfaces rather than depending directly on particular
implementations.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Mapping

from app.domain import PromptDocument
from app.schemas.analysis import (
    PromptStatistics,
    PromptVariableOccurrence,
)


class Parser(ABC):
    """
    Contract for components that discover variables in prompt documents.
    """

    @abstractmethod
    def parse(
        self,
        document: PromptDocument,
    ) -> list[PromptVariableOccurrence]:
        """
        Extract variable occurrences from a prompt document.

        Args:
            document:
                Prompt document whose message contents should be parsed.

        Returns:
            A list containing every discovered variable occurrence.
        """
        raise NotImplementedError


class Renderer(ABC):
    """
    Contract for components that substitute prompt variables.
    """

    @abstractmethod
    def render(
        self,
        document: PromptDocument,
        variables: Mapping[str, object],
    ) -> PromptDocument:
        """
        Return a rendered copy of a prompt document.

        Args:
            document:
                Original prompt document.

            variables:
                Variable names mapped to replacement values.

        Returns:
            A new prompt document containing rendered message contents.
        """
        raise NotImplementedError


class StatisticsProvider(ABC):
    """
    Contract for components that calculate prompt statistics.
    """

    @abstractmethod
    def analyze(
        self,
        document: PromptDocument,
    ) -> PromptStatistics:
        """
        Calculate statistics for a prompt document.

        Args:
            document:
                Prompt document whose message contents should be measured.

        Returns:
            Structured statistics for the complete document.
        """
        raise NotImplementedError
