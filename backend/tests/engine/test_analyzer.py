"""
Unit tests for the Prompt Analyzer.
"""

from unittest import result

from app.domain import PromptDocument, PromptMessage, PromptRole
from app.engine.analyzer import PromptAnalyzer
from app.engine.parser import PromptParser
from app.engine.renderer import PromptRenderer
from app.engine.statistics import PromptStatisticsEngine


def test_analyzer_renders_prompt_and_collects_missing_variables() -> None:
    """
    The analyzer should render the document, expose parsed variables, and
    report any missing placeholders.
    """
    document = PromptDocument(
        title="Greeting",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Hello {{name}}",
            ),
            PromptMessage(
                role=PromptRole.USER,
                content="Review {{company}}.",
            ),
        ],
    )

    analyzer = PromptAnalyzer(
        parser=PromptParser(),
        renderer=PromptRenderer(),
        statistics=PromptStatisticsEngine(),
    )

    result = analyzer.analyze(
        document=document,
        variables={"name": "Hina"},
    )

    assert len(result.rendered_document.messages) == 2
    assert result.rendered_document.messages[0].content == "Hello Hina"

    assert result.rendered_document.messages[1].content == "Review {{company}}."

    assert [item.name for item in result.variables] == ["name", "company"]
    assert [item.message_index for item in result.variables] == [0, 1]
    assert result.missing_variables == ["company"]
    assert result.warnings == []
    assert result.errors == []
    assert result.statistics.characters == 29


def test_analyzer_adds_warning_for_large_prompts() -> None:
    """
    Prompts that exceed the token warning threshold should produce a warning.
    """
    document = PromptDocument(
        title="Large prompt",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="A" * 32001,
            ),
        ],
    )

    analyzer = PromptAnalyzer(
        parser=PromptParser(),
        renderer=PromptRenderer(),
        statistics=PromptStatisticsEngine(),
    )

    result = analyzer.analyze(document=document)

    assert len(result.rendered_document.messages) == 1

    assert result.rendered_document.messages[0].content == "A" * 32001
    assert result.missing_variables == []
    assert result.warnings == ["Prompt exceeds approximately 8000 tokens."]
