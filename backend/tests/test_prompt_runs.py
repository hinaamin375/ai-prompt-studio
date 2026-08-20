from fastapi.testclient import TestClient

from app.main import app
from app.providers import (
    ModelProvider,
    ProviderMessage,
    ProviderRegistry,
    ProviderResult,
    ProviderUsage,
)
from app.schemas.prompt_run import (
    PromptRunRequest,
)
from app.services.prompt_run_service import (
    PromptRunService,
)


client = TestClient(app)


class FakeProvider(ModelProvider):
    provider_id = "fake"
    display_name = "Fake"

    def __init__(self) -> None:
        self.received_messages: list[ProviderMessage] = []

    @property
    def default_model(self) -> str:
        return "fake-model"

    def run(
        self,
        *,
        messages: list[ProviderMessage],
        model: str | None = None,
    ) -> ProviderResult:
        self.received_messages = messages

        return ProviderResult(
            provider="fake",
            model=model or self.default_model,
            output_text="Fake model response",
            usage=ProviderUsage(
                input_tokens=10,
                output_tokens=4,
                total_tokens=14,
            ),
        )


def create_prompt() -> dict:
    response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Run test",
            "description": None,
            "system_prompt": ("You work for {{company}}."),
            "user_prompt": ("Say hello to {{name}}."),
        },
    )

    assert response.status_code == 201

    return response.json()


def test_prompt_run_service_renders_variables():
    prompt = create_prompt()

    fake_provider = FakeProvider()

    registry = ProviderRegistry(
        known_provider_ids={"fake"},
    )

    registry.register(fake_provider)

    from tests.conftest import (
        TestingSessionLocal,
    )

    db = TestingSessionLocal()

    try:
        service = PromptRunService(
            registry=registry,
        )

        result = service.run_prompt(
            db=db,
            prompt_id=prompt["id"],
            data=PromptRunRequest(
                provider="fake",
                variables={
                    "company": "Acme",
                    "name": "Sam",
                },
            ),
        )
    finally:
        db.close()

    assert result.provider == "fake"
    assert result.model == "fake-model"

    assert result.output_text == ("Fake model response")

    assert result.usage.total_tokens == 14

    assert fake_provider.received_messages == [
        ProviderMessage(
            role="system",
            content="You work for Acme.",
        ),
        ProviderMessage(
            role="user",
            content="Say hello to Sam.",
        ),
    ]


def test_prompt_run_rejects_missing_variables():
    prompt = create_prompt()

    fake_provider = FakeProvider()

    registry = ProviderRegistry(
        known_provider_ids={"fake"},
    )

    registry.register(fake_provider)

    from tests.conftest import (
        TestingSessionLocal,
    )

    db = TestingSessionLocal()

    try:
        service = PromptRunService(
            registry=registry,
        )

        try:
            service.run_prompt(
                db=db,
                prompt_id=prompt["id"],
                data=PromptRunRequest(
                    provider="fake",
                    variables={
                        "company": "Acme",
                    },
                ),
            )
        except Exception as exc:
            assert (
                getattr(
                    exc,
                    "code",
                    None,
                )
                == "prompt_variables_missing"
            )
        else:
            raise AssertionError("Expected missing variable error.")
    finally:
        db.close()
