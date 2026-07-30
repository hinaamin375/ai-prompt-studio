"""
Prompt document domain model.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .message import PromptMessage
from .variable import PromptVariable


@dataclass(slots=True)
class PromptDocument:
    """
    Business object representing a complete prompt.
    """

    title: str

    messages: list[PromptMessage]

    description: str = ""

    variables: list[PromptVariable] = field(default_factory=list)

    tags: list[str] = field(default_factory=list)

    metadata: dict[str, str] = field(default_factory=dict)
