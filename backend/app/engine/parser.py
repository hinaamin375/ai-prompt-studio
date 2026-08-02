"""
Prompt variable parser.
"""

from __future__ import annotations

from app.domain import PromptDocument
from app.schemas.analysis import PromptVariableOccurrence

from .interfaces import Parser
from .syntax import VARIABLE_PATTERN


class PromptParser(Parser):
    """
    Discover template-variable occurrences inside prompt messages.

    The parser reports every occurrence in document order. It does not
    deduplicate variables, replace values, or modify the document.
    """

    def parse(
        self,
        document: PromptDocument,
    ) -> list[PromptVariableOccurrence]:
        """
        Parse every message in a prompt document.

        Args:
            document:
                Prompt document whose message contents should be scanned.

        Returns:
            Every valid variable occurrence in message and character order.
        """
        occurrences: list[PromptVariableOccurrence] = []

        for message_index, message in enumerate(document.messages):
            for match in VARIABLE_PATTERN.finditer(message.content):
                occurrences.append(
                    PromptVariableOccurrence(
                        name=match.group("name"),
                        message_index=message_index,
                        start=match.start(),
                        end=match.end(),
                    )
                )

        return occurrences
