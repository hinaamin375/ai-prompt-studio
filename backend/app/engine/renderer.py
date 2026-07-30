"""
Prompt Renderer.
"""

from __future__ import annotations

from .interfaces import Renderer


class PromptRenderer(Renderer):
    """
    Default renderer implementation.
    """

    def render(
        self,
        text: str,
        variables: dict[str, str],
    ) -> str:
        raise NotImplementedError(
            "Prompt rendering is not implemented yet."
        )