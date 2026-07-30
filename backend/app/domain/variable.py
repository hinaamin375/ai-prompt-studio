"""
Domain model representing a prompt variable.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class PromptVariable:
    """
    Represents one variable inside a prompt.
    """

    name: str

    value: Any | None = None

    description: str | None = None

    required: bool = True

    default: Any | None = None
