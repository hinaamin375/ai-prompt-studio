"""
Prompt Parser.

Responsible for understanding prompt syntax.
"""

from __future__ import annotations

from .interfaces import Parser


class PromptParser(Parser):
    """
    Default parser implementation.

    This class will eventually extract:

    - variables
    - placeholders
    - prompt metadata
    """

    def parse(self, text: str):
        raise NotImplementedError(
            "Prompt parsing is not implemented yet."
        )