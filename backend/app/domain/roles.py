"""
Prompt roles used throughout AI Prompt Studio.
"""

from enum import Enum


class PromptRole(str, Enum):
    """
    Supported prompt message roles.
    """

    SYSTEM = "system"

    USER = "user"

    ASSISTANT = "assistant"

    TOOL = "tool"
