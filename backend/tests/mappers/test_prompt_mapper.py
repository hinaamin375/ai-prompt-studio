"""
Unit tests for the Prompt mapper.
"""

from app.domain import PromptRole
from app.mappers import PromptMapper
from app.models.prompt import Prompt


def test_to_document_maps_prompt_with_system_message() -> None:
    """
    A database prompt containing both system and user prompts should become
    a PromptDocument with two messages in the correct order.
    """
    prompt = Prompt(
        title="Financial Summary",
        description="Summarizes company earnings.",
        system_prompt="You are a financial analyst.",
        user_prompt="Summarize {{company}} earnings.",
    )

    document = PromptMapper.to_document(prompt)

    assert document.title == "Financial Summary"
    assert document.description == "Summarizes company earnings."

    assert len(document.messages) == 2

    assert document.messages[0].role is PromptRole.SYSTEM
    assert document.messages[0].content == "You are a financial analyst."

    assert document.messages[1].role is PromptRole.USER
    assert document.messages[1].content == "Summarize {{company}} earnings."


def test_to_document_maps_prompt_without_system_message() -> None:
    """
    When no system prompt exists, the document should contain only the user
    message.
    """
    prompt = Prompt(
        title="Simple Translation",
        description=None,
        system_prompt=None,
        user_prompt="Translate {{text}} into French.",
    )

    document = PromptMapper.to_document(prompt)

    assert document.title == "Simple Translation"
    assert document.description == ""

    assert len(document.messages) == 1

    assert document.messages[0].role is PromptRole.USER
    assert document.messages[0].content == "Translate {{text}} into French."


def test_to_document_ignores_empty_system_prompt() -> None:
    """
    An empty system-prompt string should not create an empty system message.
    """
    prompt = Prompt(
        title="Empty System Prompt",
        description="Tests empty system-prompt handling.",
        system_prompt="",
        user_prompt="Hello {{name}}",
    )

    document = PromptMapper.to_document(prompt)

    assert len(document.messages) == 1
    assert document.messages[0].role is PromptRole.USER
    assert document.messages[0].content == "Hello {{name}}"


def test_to_document_preserves_message_order() -> None:
    """
    The system message must appear before the user message.
    """
    prompt = Prompt(
        title="Ordered Prompt",
        description=None,
        system_prompt="Follow the supplied instructions.",
        user_prompt="Process {{input}}.",
    )

    document = PromptMapper.to_document(prompt)

    roles = [message.role for message in document.messages]

    assert roles == [
        PromptRole.SYSTEM,
        PromptRole.USER,
    ]


def test_to_document_creates_new_domain_object_each_time() -> None:
    """
    Each mapping operation should create a new PromptDocument and new message
    objects.
    """
    prompt = Prompt(
        title="Reusable Prompt",
        description=None,
        system_prompt="You are helpful.",
        user_prompt="Answer {{question}}.",
    )

    first_document = PromptMapper.to_document(prompt)
    second_document = PromptMapper.to_document(prompt)

    assert first_document is not second_document
    assert first_document.messages is not second_document.messages

    assert first_document.messages[0] is not second_document.messages[0]


def test_to_document_starts_with_empty_domain_collections() -> None:
    """
    Database prompts do not currently store domain variables, tags, or
    metadata, so their mapped collections should initially be empty.
    """
    prompt = Prompt(
        title="Collection Test",
        description=None,
        system_prompt=None,
        user_prompt="Summarize {{document}}.",
    )

    document = PromptMapper.to_document(prompt)

    assert document.variables == []
    assert document.tags == []
    assert document.metadata == {}
