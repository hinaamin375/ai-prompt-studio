"""
Mapping functions between database models and Prompt Engine domain objects.
"""

from __future__ import annotations

from app.domain import (
    PromptDocument,
    PromptMessage,
    PromptRole,
)
from app.models.prompt import Prompt


class PromptMapper:
    """
    Converts Prompt objects between application layers.

    Responsibilities:
        - SQLAlchemy Prompt -> PromptDocument

    """

    @staticmethod
    def to_document(
        prompt: Prompt,
    ) -> PromptDocument:
        """
        Convert a SQLAlchemy Prompt model into a PromptDocument
        understood by the Prompt Engine.

        Args:
            prompt:
                SQLAlchemy Prompt model loaded from the database.

        Returns:
            PromptDocument ready to be processed by the Prompt Engine.
        """

        messages: list[PromptMessage] = []

        # Add the system message only if it exists.
        if prompt.system_prompt:
            messages.append(
                PromptMessage(
                    role=PromptRole.SYSTEM,
                    content=prompt.system_prompt,
                )
            )

        # Every prompt must contain a user message.
        messages.append(
            PromptMessage(
                role=PromptRole.USER,
                content=prompt.user_prompt,
            )
        )

        return PromptDocument(
            title=prompt.title,
            description=prompt.description or "",
            messages=messages,
        )
