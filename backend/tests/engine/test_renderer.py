"""
Unit tests for the Prompt Renderer.
"""

import pytest

from app.domain import (
    PromptDocument,
    PromptMessage,
    PromptRole,
    PromptVariable,
)
from app.engine.renderer import PromptRenderer


@pytest.fixture
def renderer() -> PromptRenderer:
    """
    Create a renderer for each test.
    """
    return PromptRenderer()


def test_render_single_variable(
    renderer: PromptRenderer,
) -> None:
    """
    A supplied value should replace its matching placeholder.
    """
    document = PromptDocument(
        title="Greeting",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Hello {{name}}",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={"name": "Hina"},
    )

    assert result.messages[0].content == "Hello Hina"


def test_render_multiple_variables(
    renderer: PromptRenderer,
) -> None:
    """
    Every supplied variable should be rendered.
    """
    document = PromptDocument(
        title="Company report",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content=("Summarize {{company}} earnings for {{quarter}}."),
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={
            "company": "BP",
            "quarter": "Q2",
        },
    )

    assert result.messages[0].content == "Summarize BP earnings for Q2."


def test_render_variables_across_multiple_messages(
    renderer: PromptRenderer,
) -> None:
    """
    Rendering should process all messages while preserving their roles.
    """
    document = PromptDocument(
        title="Analysis",
        messages=[
            PromptMessage(
                role=PromptRole.SYSTEM,
                content="You analyze {{industry}} companies.",
            ),
            PromptMessage(
                role=PromptRole.USER,
                content="Review {{company}}.",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={
            "industry": "energy",
            "company": "BP",
        },
    )

    assert result.messages[0].content == "You analyze energy companies."
    assert result.messages[0].role is PromptRole.SYSTEM

    assert result.messages[1].content == "Review BP."
    assert result.messages[1].role is PromptRole.USER


def test_render_duplicate_variable_occurrences(
    renderer: PromptRenderer,
) -> None:
    """
    Every occurrence of the same variable should be replaced.
    """
    document = PromptDocument(
        title="Repeated variable",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="{{name}} greeted {{name}}.",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={"name": "Hina"},
    )

    assert result.messages[0].content == "Hina greeted Hina."


def test_render_preserves_missing_variables(
    renderer: PromptRenderer,
) -> None:
    """
    Placeholders without supplied values should remain unchanged.
    """
    document = PromptDocument(
        title="Missing variable",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Hello {{name}} from {{company}}",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={"name": "Hina"},
    )

    assert result.messages[0].content == "Hello Hina from {{company}}"


def test_render_with_empty_variable_mapping(
    renderer: PromptRenderer,
) -> None:
    """
    An empty mapping should preserve all prompt content.
    """
    document = PromptDocument(
        title="No values",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Hello {{name}}",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={},
    )

    assert result.messages[0].content == "Hello {{name}}"


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (42, "Value: 42"),
        (3.14, "Value: 3.14"),
        (True, "Value: True"),
        (False, "Value: False"),
        (None, "Value: None"),
    ],
)
def test_render_converts_non_string_values(
    renderer: PromptRenderer,
    value: object,
    expected: str,
) -> None:
    """
    Non-string values should be converted using str().
    """
    document = PromptDocument(
        title="Typed value",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Value: {{value}}",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={"value": value},
    )

    assert result.messages[0].content == expected


def test_render_leaves_invalid_placeholders_unchanged(
    renderer: PromptRenderer,
) -> None:
    """
    Text that does not match the supported syntax should not be rendered.
    """
    content = "{{}} {{123}} {{ company }} {{first-name}} {{company.name}}"

    document = PromptDocument(
        title="Invalid syntax",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content=content,
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={
            "123": "number",
            "company": "BP",
            "first-name": "Hina",
            "company.name": "BP",
        },
    )

    assert result.messages[0].content == content


def test_render_does_not_modify_original_document(
    renderer: PromptRenderer,
) -> None:
    """
    Rendering must return a new document without mutating the original.
    """
    document = PromptDocument(
        title="Immutable rendering",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Hello {{name}}",
            ),
        ],
        tags=["greeting"],
        metadata={"provider": "openai"},
    )

    result = renderer.render(
        document=document,
        variables={"name": "Hina"},
    )

    assert document.messages[0].content == "Hello {{name}}"
    assert result.messages[0].content == "Hello Hina"

    assert result is not document
    assert result.messages is not document.messages
    assert result.messages[0] is not document.messages[0]
    assert result.tags is not document.tags
    assert result.metadata is not document.metadata


def test_render_preserves_document_properties(
    renderer: PromptRenderer,
) -> None:
    """
    Rendering should preserve all non-content document information.
    """
    prompt_variable = PromptVariable(
        name="company",
        description="Company to analyze",
    )

    document = PromptDocument(
        title="Company analysis",
        description="Analyzes one company",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Analyze {{company}}",
            ),
        ],
        variables=[prompt_variable],
        tags=["finance", "analysis"],
        metadata={
            "provider": "openai",
            "model": "gpt",
        },
    )

    result = renderer.render(
        document=document,
        variables={"company": "BP"},
    )

    assert result.title == document.title
    assert result.description == document.description
    assert result.variables == document.variables
    assert result.tags == document.tags
    assert result.metadata == document.metadata


def test_render_empty_document(
    renderer: PromptRenderer,
) -> None:
    """
    A document without messages should remain valid.
    """
    document = PromptDocument(
        title="Empty",
        messages=[],
    )

    result = renderer.render(
        document=document,
        variables={"name": "Hina"},
    )

    assert result.messages == []
    assert result is not document


def test_render_replacement_with_special_characters(
    renderer: PromptRenderer,
) -> None:
    """
    Replacement values containing regex-sensitive characters should remain
    literal.
    """
    document = PromptDocument(
        title="Special characters",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Path: {{path}}",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={
            "path": r"C:\users\hina\$project",
        },
    )

    assert result.messages[0].content == r"Path: C:\users\hina\$project"


def test_render_similar_variable_names(
    renderer: PromptRenderer,
) -> None:
    """
    Variables with overlapping names should be rendered independently.
    """
    document = PromptDocument(
        title="Similar names",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="{{user}} and {{username}}",
            ),
        ],
    )

    result = renderer.render(
        document=document,
        variables={
            "user": "Hina",
            "username": "hinaamin375",
        },
    )

    assert result.messages[0].content == "Hina and hinaamin375"
