"""
Default prompt-template renderer.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import replace
from re import Match

from app.domain import PromptDocument

from .interfaces import Renderer
from .syntax import VARIABLE_PATTERN


class PromptRenderer(Renderer):
    """
    Substitute supplied values into prompt message placeholders.

    Rendering creates and returns a new PromptDocument. The original
    document and its messages are not modified.
    """

    def render(
        self,
        document: PromptDocument,
        variables: Mapping[str, object],
    ) -> PromptDocument:
        """
        Render every message in a prompt document.

        Missing variable values leave their placeholders unchanged. Supplied
        non-string values are converted using str().

        Args:
            document:
                Original prompt document.

            variables:
                Variable names mapped to replacement values.

        Returns:
            A new PromptDocument containing rendered messages.
        """
        rendered_messages = [
            replace(
                message,
                content=self._render_text(
                    text=message.content,
                    variables=variables,
                ),
            )
            for message in document.messages
        ]

        return replace(
            document,
            messages=rendered_messages,
            variables=list(document.variables),
            tags=list(document.tags),
            metadata=dict(document.metadata),
        )

    @staticmethod
    def _render_text(
        text: str,
        variables: Mapping[str, object],
    ) -> str:
        """
        Replace valid placeholders in one text value.
        """

        def replace_match(match: Match[str]) -> str:
            variable_name = match.group("name")

            if variable_name not in variables:
                return match.group(0)

            return str(variables[variable_name])

        return VARIABLE_PATTERN.sub(replace_match, text)
