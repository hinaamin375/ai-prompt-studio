"""
Schemas returned by the Prompt Engine.

These Pydantic models define the structured output produced by prompt
analysis components. They can also be returned directly from FastAPI
endpoints.
"""

from typing import Any

from pydantic import BaseModel, Field

from app.domain.prompt import PromptDocument

class PromptVariableOccurrence(BaseModel):
    """
    Represents one variable occurrence discovered inside a prompt.
    """

    name: str = Field(
        ...,
        min_length=1,
        description="Name of the discovered prompt variable.",
        examples=["company"],
    )

    message_index: int = Field(
        ...,
        ge=0,
        description="Zero-based index of the message containing the variable.",
    )

    start: int = Field(
        ...,
        ge=0,
        description="Zero-based start position of the variable.",
    )

    end: int = Field(
        ...,
        ge=0,
        description="Zero-based end position of the variable.",
    )

class PromptStatistics(BaseModel):
    """
    Measurements calculated from all messages in a prompt document.
    """

    characters: int = Field(
        ...,
        ge=0,
        description="Total number of characters across all message contents.",
    )

    words: int = Field(
        ...,
        ge=0,
        description="Total number of words across all message contents.",
    )

    lines: int = Field(
        ...,
        ge=0,
        description="Total number of text lines across all message contents.",
    )

    estimated_tokens: int = Field(
        ...,
        ge=0,
        description="Approximate number of language-model tokens.",
    )


class PromptAnalysis(BaseModel):
    """
    Complete result returned by the Prompt Analyzer.
    """

    statistics: PromptStatistics

    variables: list[PromptVariableOccurrence] = Field(
        default_factory=list,
    )

    rendered_document: PromptDocument | None = None

    missing_variables: list[str] = Field(
        default_factory=list,
    )

    warnings: list[str] = Field(
        default_factory=list,
    )

    errors: list[str] = Field(
        default_factory=list,
    )
class PromptAnalyzeRequest(BaseModel):
    """
    Variable values supplied when analyzing a saved prompt.
    """

    variables: dict[str, Any] = Field(
        default_factory=dict,
        description="Placeholder names mapped to rendering values.",
        examples=[
            {
                "company": "BP",
                "quarter": "Q2",
            }
        ],
    )