"""
Default prompt variable parser.

The implementation will be added in the next engine part.
"""

from __future__ import annotations

from app.domain import PromptDocument
from app.schemas.analysis import PromptVariableOccurrence

from .interfaces import Parser


class PromptParser(Parser):
    """
    Discover template variables inside prompt message content.
    """

    def parse(
        self,
        document: PromptDocument,
    ) -> list[PromptVariableOccurrence]:
        """
        Extract variable occurrences from a prompt document.
        """
        raise NotImplementedError("Prompt variable parsing is not implemented yet.")
