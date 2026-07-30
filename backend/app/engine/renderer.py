"""
Default prompt renderer.

The implementation will be added after the variable parser.
"""

from __future__ import annotations

from collections.abc import Mapping

from app.domain import PromptDocument

from .interfaces import Renderer


class PromptRenderer(Renderer):
    """
    Substitute variable values into prompt message content.
    """

    def render(
        self,
        document: PromptDocument,
        variables: Mapping[str, object],
    ) -> PromptDocument:
        """
        Return a rendered copy of a prompt document.
        """
        raise NotImplementedError("Prompt rendering is not implemented yet.")
