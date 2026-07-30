"""
Unit tests for the Prompt Statistics Engine.
"""

import pytest

from app.domain import (
    PromptDocument,
    PromptMessage,
    PromptRole,
)
from app.engine.statistics import PromptStatisticsEngine


@pytest.fixture
def statistics_engine() -> PromptStatisticsEngine:
    """
    Create a fresh statistics engine for each test.
    """
    return PromptStatisticsEngine()


def test_count_characters(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    Character count should include whitespace and punctuation.
    """
    text = "Hello, world!"

    result = statistics_engine.count_characters(text)

    assert result == 13


def test_count_characters_for_empty_text(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    Empty text should contain zero characters.
    """
    result = statistics_engine.count_characters("")

    assert result == 0


def test_count_characters_includes_newlines(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    A newline is part of the prompt and should count as one character.
    """
    result = statistics_engine.count_characters("Hello\nWorld")

    assert result == 11


def test_count_words(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    Words should be detected using whitespace boundaries.
    """
    result = statistics_engine.count_words("Build a useful prompt studio.")

    assert result == 5


def test_count_words_ignores_repeated_whitespace(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    Repeated spaces, tabs, and newlines should not create empty words.
    """
    result = statistics_engine.count_words("Hello   world\nfrom\tPrompt Studio")

    assert result == 5


def test_count_words_for_blank_text(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    Whitespace-only text should contain zero words.
    """
    result = statistics_engine.count_words("   \n\t  ")

    assert result == 0


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("", 0),
        ("Hello", 1),
        ("Hello\nWorld", 2),
        ("Hello\nWorld\n", 3),
        ("\n", 2),
    ],
)
def test_count_lines(
    statistics_engine: PromptStatisticsEngine,
    text: str,
    expected: int,
) -> None:
    """
    Line counting should include blank and trailing editor lines.
    """
    result = statistics_engine.count_lines(text)

    assert result == expected


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("", 0),
        ("a", 1),
        ("abcd", 1),
        ("abcde", 2),
        ("abcdefgh", 2),
        ("abcdefghi", 3),
    ],
)
def test_estimate_tokens(
    statistics_engine: PromptStatisticsEngine,
    text: str,
    expected: int,
) -> None:
    """
    Token estimates should use four characters and round upward.
    """
    result = statistics_engine.estimate_tokens(text)

    assert result == expected


def test_analyze_single_message(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    The engine should analyze a document containing one message.
    """
    document = PromptDocument(
        title="Greeting",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Hello world",
            ),
        ],
    )

    result = statistics_engine.analyze(document)

    assert result.characters == 11
    assert result.words == 2
    assert result.lines == 1
    assert result.estimated_tokens == 3


def test_analyze_multiple_messages(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    Statistics should be summed across every document message.
    """
    document = PromptDocument(
        title="Company summary",
        messages=[
            PromptMessage(
                role=PromptRole.SYSTEM,
                content="You are an analyst.",
            ),
            PromptMessage(
                role=PromptRole.USER,
                content="Summarize {{company}}.",
            ),
        ],
    )

    result = statistics_engine.analyze(document)

    assert result.characters == 41
    assert result.words == 6
    assert result.lines == 2
    assert result.estimated_tokens == 11


def test_analyze_empty_document(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    A document without messages should return zero for every statistic.
    """
    document = PromptDocument(
        title="Empty prompt",
        messages=[],
    )

    result = statistics_engine.analyze(document)

    assert result.characters == 0
    assert result.words == 0
    assert result.lines == 0
    assert result.estimated_tokens == 0


def test_analyze_messages_with_empty_content(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    Empty message contents should not increase any statistics.
    """
    document = PromptDocument(
        title="Blank messages",
        messages=[
            PromptMessage(
                role=PromptRole.SYSTEM,
                content="",
            ),
            PromptMessage(
                role=PromptRole.USER,
                content="",
            ),
        ],
    )

    result = statistics_engine.analyze(document)

    assert result.characters == 0
    assert result.words == 0
    assert result.lines == 0
    assert result.estimated_tokens == 0


def test_analyze_unicode_content(
    statistics_engine: PromptStatisticsEngine,
) -> None:
    """
    The statistics engine should support Unicode text.
    """
    document = PromptDocument(
        title="Unicode prompt",
        messages=[
            PromptMessage(
                role=PromptRole.USER,
                content="Hello دنیا",
            ),
        ],
    )

    result = statistics_engine.analyze(document)

    assert result.characters == 10
    assert result.words == 2
    assert result.lines == 1
    assert result.estimated_tokens == 3
