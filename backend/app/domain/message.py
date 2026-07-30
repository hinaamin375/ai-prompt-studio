"""
Prompt message domain model.
"""

from __future__ import annotations

from dataclasses import dataclass

from .roles import PromptRole


@dataclass(slots=True)
class PromptMessage:
    """
    Represents a single message inside a prompt.
    """

    role: PromptRole

    content: str
