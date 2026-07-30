"""
Statistics implementation for the Prompt Engine.

The statistics engine measures the textual content of every message in a
PromptDocument. It does not modify the document and does not communicate
with the database, API layer, or an AI provider.
"""

from __future__ import annotations

import math
import re

from app.domain import PromptDocument
from app.schemas.analysis import PromptStatistics

from .interfaces import StatisticsProvider


class PromptStatisticsEngine(StatisticsProvider):
    """
    Calculate deterministic statistics for prompt documents.

    Token counting is currently an estimate based on character count.
    Provider-specific tokenizers will be introduced later because OpenAI,
    Anthropic, Gemini, and local models may tokenize the same prompt
    differently.
    """

    _WORD_PATTERN = re.compile(r"\S+")
    _CHARACTERS_PER_TOKEN = 4

    def analyze(
        self,
        document: PromptDocument,
    ) -> PromptStatistics:
        """
        Calculate statistics across all messages in a prompt document.

        Args:
            document:
                Prompt document to analyze.

        Returns:
            PromptStatistics containing character, word, line, and estimated
            token counts.
        """
        characters = sum(
            self.count_characters(message.content) for message in document.messages
        )

        words = sum(self.count_words(message.content) for message in document.messages)

        lines = sum(self.count_lines(message.content) for message in document.messages)

        estimated_tokens = sum(
            self.estimate_tokens(message.content) for message in document.messages
        )

        return PromptStatistics(
            characters=characters,
            words=words,
            lines=lines,
            estimated_tokens=estimated_tokens,
        )

    @staticmethod
    def count_characters(text: str) -> int:
        """
        Count every character in a string.

        Spaces, tabs, line breaks, punctuation, and Unicode characters are
        included because they are all part of the prompt sent to a model.
        """
        return len(text)

    @classmethod
    def count_words(cls, text: str) -> int:
        """
        Count non-whitespace groups as words.

        Examples:
            "Hello world" returns 2.
            "Hello\\nworld" returns 2.
            "   " returns 0.

        This is intentionally language-independent and deterministic. It is
        not intended to perform linguistic word segmentation.
        """
        return len(cls._WORD_PATTERN.findall(text))

    @staticmethod
    def count_lines(text: str) -> int:
        """
        Count the number of logical text lines.

        An empty string contains zero lines.

        Examples:
            "" returns 0.
            "Hello" returns 1.
            "Hello\\nWorld" returns 2.
            "Hello\\n" returns 2.
        """
        if text == "":
            return 0

        return len(text.split("\n"))

    @classmethod
    def estimate_tokens(cls, text: str) -> int:
        """
        Estimate tokens using approximately four characters per token.

        The result is rounded upward so that any non-empty prompt has at
        least one estimated token.

        This is an approximation, not provider billing information.
        """
        character_count = cls.count_characters(text)

        if character_count == 0:
            return 0

        return math.ceil(character_count / cls._CHARACTERS_PER_TOKEN)
