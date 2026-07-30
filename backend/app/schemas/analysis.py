"""
Schemas used by the Prompt Engine.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class PromptVariable(BaseModel):
    """
    Represents a variable discovered inside a prompt.
    """

    name: str = Field(
        ...,
        description="Variable name.",
        examples=["company"],
    )

    start: int = Field(
        ...,
        description="Start index inside the prompt.",
    )

    end: int = Field(
        ...,
        description="End index inside the prompt.",
    )

class PromptStatistics(BaseModel):
    """
    Statistics calculated from a prompt.
    """

    characters: int = Field(
        ...,
        ge=0,
    )

    words: int = Field(
        ...,
        ge=0,
    )

    lines: int = Field(
        ...,
        ge=0,
    )

    estimated_tokens: int = Field(
        ...,
        ge=0,
    )

class PromptAnalysis(BaseModel):
    """
    Complete analysis of a prompt.
    """

    statistics: PromptStatistics

    variables: list[PromptVariable] = Field(
        default_factory=list,
    )

    preview: str = ""

    warnings: list[str] = Field(
        default_factory=list,
    )

    errors: list[str] = Field(
        default_factory=list,
    )