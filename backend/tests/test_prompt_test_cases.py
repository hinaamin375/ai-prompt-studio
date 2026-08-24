from fastapi.testclient import TestClient

from app.main import app
from app.providers import (
    ModelProvider,
    ProviderExecutionSettings,
    ProviderMessage,
    ProviderRegistry,
    ProviderResult,
    ProviderUsage,
)
from app.schemas.prompt_test_case_run import (
    PromptTestCaseRunRequest,
)
from app.services.prompt_run_service import (
    PromptRunService,
)
from app.services.prompt_test_case_run_service import (
    PromptTestCaseRunService,
)


client = TestClient(app)


def create_prompt() -> dict:
    response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Prompt test case prompt",
            "description": None,
            "system_prompt": (
                "You are evaluating {{technology}}."
            ),
            "user_prompt": (
                "Explain {{technology}} for "
                "{{job_title}}."
            ),
        },
    )

    assert response.status_code == 201

    return response.json()


def create_test_case(
    prompt_id: int,
    *,
    name: str = "Python test",
    expected_contains: list[str] | None = None,
) -> dict:
    response = client.post(
        f"/api/v1/prompts/{prompt_id}/test-cases",
        json={
            "name": name,
            "description": "Test description",
            "variables": {
                "technology": "Python",
                "job_title": "Backend Engineer",
            },
            "expected_contains": (
                expected_contains
                if expected_contains is not None
                else [
                    "Python",
                    "Backend",
                ]
            ),
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_prompt_test_case() -> None:
    prompt = create_prompt()

    response = client.post(
        f"/api/v1/prompts/{prompt['id']}/test-cases",
        json={
            "name": "Backend Python test",
            "description": (
                "Checks Python backend output"
            ),
            "variables": {
                "technology": "Python",
                "job_title": "Backend Engineer",
            },
            "expected_contains": [
                "Python",
                "Backend",
            ],
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["prompt_id"] == prompt["id"]
    assert data["name"] == "Backend Python test"

    assert data["variables"] == {
        "technology": "Python",
        "job_title": "Backend Engineer",
    }

    assert data["expected_contains"] == [
        "Python",
        "Backend",
    ]

    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_list_prompt_test_cases() -> None:
    prompt = create_prompt()

    create_test_case(
        prompt["id"],
        name="First test",
    )

    create_test_case(
        prompt["id"],
        name="Second test",
    )

    response = client.get(
        f"/api/v1/prompts/{prompt['id']}/test-cases",
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    names = {
        test_case["name"]
        for test_case in data
    }

    assert names == {
        "First test",
        "Second test",
    }


def test_get_prompt_test_case() -> None:
    prompt = create_prompt()

    test_case = create_test_case(
        prompt["id"],
    )

    response = client.get(
        (
            f"/api/v1/prompts/{prompt['id']}"
            f"/test-cases/{test_case['id']}"
        ),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == test_case["id"]
    assert data["name"] == test_case["name"]


def test_update_prompt_test_case() -> None:
    prompt = create_prompt()

    test_case = create_test_case(
        prompt["id"],
    )

    response = client.patch(
        (
            f"/api/v1/prompts/{prompt['id']}"
            f"/test-cases/{test_case['id']}"
        ),
        json={
            "name": "Updated Python test",
            "expected_contains": [
                "Python",
                "FastAPI",
                "Backend",
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == (
        "Updated Python test"
    )

    assert data["expected_contains"] == [
        "Python",
        "FastAPI",
        "Backend",
    ]

    assert data["variables"] == (
        test_case["variables"]
    )


def test_delete_prompt_test_case() -> None:
    prompt = create_prompt()

    test_case = create_test_case(
        prompt["id"],
    )

    response = client.delete(
        (
            f"/api/v1/prompts/{prompt['id']}"
            f"/test-cases/{test_case['id']}"
        ),
    )

    assert response.status_code == 204

    get_response = client.get(
        (
            f"/api/v1/prompts/{prompt['id']}"
            f"/test-cases/{test_case['id']}"
        ),
    )

    assert get_response.status_code == 404

    assert (
        get_response.json()["error"]["code"]
        == "prompt_test_case_not_found"
    )


def test_missing_prompt_test_case_returns_404() -> None:
    prompt = create_prompt()

    response = client.get(
        (
            f"/api/v1/prompts/{prompt['id']}"
            "/test-cases/999999"
        ),
    )

    assert response.status_code == 404

    assert (
        response.json()["error"]["code"]
        == "prompt_test_case_not_found"
    )


def test_test_case_cannot_be_read_through_other_prompt() -> None:
    first_prompt = create_prompt()

    second_response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Second prompt",
            "description": None,
            "system_prompt": None,
            "user_prompt": "Hello",
        },
    )

    assert second_response.status_code == 201

    second_prompt = second_response.json()

    test_case = create_test_case(
        first_prompt["id"],
    )

    response = client.get(
        (
            f"/api/v1/prompts/{second_prompt['id']}"
            f"/test-cases/{test_case['id']}"
        ),
    )

    assert response.status_code == 404

    assert (
        response.json()["error"]["code"]
        == "prompt_test_case_not_found"
    )


class FakeTestProvider(ModelProvider):
    provider_id = "fake"
    display_name = "Fake"

    def __init__(
        self,
        output_text: str,
    ) -> None:
        self.output_text = output_text

        self.received_messages: list[
            ProviderMessage
        ] = []

        self.received_settings: (
            ProviderExecutionSettings | None
        ) = None

    @property
    def default_model(self) -> str:
        return "fake-model"

    def run(
        self,
        *,
        messages: list[ProviderMessage],
        model: str | None = None,
        settings: (
            ProviderExecutionSettings | None
        ) = None,
    ) -> ProviderResult:
        self.received_messages = messages
        self.received_settings = settings

        return ProviderResult(
            provider="fake",
            model=model or self.default_model,
            output_text=self.output_text,
            usage=ProviderUsage(
                input_tokens=20,
                output_tokens=10,
                total_tokens=30,
            ),
        )


def build_test_runner(
    output_text: str,
) -> tuple[
    PromptTestCaseRunService,
    FakeTestProvider,
]:
    provider = FakeTestProvider(
        output_text=output_text,
    )

    registry = ProviderRegistry(
        known_provider_ids={"fake"},
    )

    registry.register(provider)

    run_service = PromptRunService(
        registry=registry,
    )

    test_runner = PromptTestCaseRunService(
    prompt_run_service_instance=run_service,
)

    return (
        test_runner,
        provider,
    )


def test_run_test_case_all_assertions_pass() -> None:
    prompt = create_prompt()

    test_case = create_test_case(
        prompt["id"],
        expected_contains=[
            "Python",
            "Backend",
        ],
    )

    test_runner, provider = build_test_runner(
        (
            "Python is widely used for "
            "Backend development."
        )
    )

    from tests.conftest import (
        TestingSessionLocal,
    )

    db = TestingSessionLocal()

    try:
        result = test_runner.run_test_case(
            db=db,
            prompt_id=prompt["id"],
            test_case_id=test_case["id"],
            data=PromptTestCaseRunRequest(
                provider="fake",
                temperature=0.4,
                max_output_tokens=600,
            ),
        )
    finally:
        db.close()

    assert result.passed is True
    assert result.passed_count == 2
    assert result.failed_count == 0

    assert len(result.assertions) == 2

    assert all(
        assertion.passed
        for assertion in result.assertions
    )

    assert result.run.provider == "fake"
    assert result.run.model == "fake-model"

    assert provider.received_settings == (
        ProviderExecutionSettings(
            temperature=0.4,
            max_output_tokens=600,
        )
    )


def test_run_test_case_reports_failed_assertion() -> None:
    prompt = create_prompt()

    test_case = create_test_case(
        prompt["id"],
        expected_contains=[
            "Python",
            "FastAPI",
        ],
    )

    test_runner, _ = build_test_runner(
        "Python is useful for backend work."
    )

    from tests.conftest import (
        TestingSessionLocal,
    )

    db = TestingSessionLocal()

    try:
        result = test_runner.run_test_case(
            db=db,
            prompt_id=prompt["id"],
            test_case_id=test_case["id"],
            data=PromptTestCaseRunRequest(
                provider="fake",
            ),
        )
    finally:
        db.close()

    assert result.passed is False
    assert result.passed_count == 1
    assert result.failed_count == 1

    assertions = {
        assertion.expected:
            assertion.passed
        for assertion in result.assertions
    }

    assert assertions == {
        "Python": True,
        "FastAPI": False,
    }


def test_test_case_runner_uses_saved_variables() -> None:
    prompt = create_prompt()

    test_case = create_test_case(
        prompt["id"],
        expected_contains=[],
    )

    test_runner, provider = build_test_runner(
        "Response"
    )

    from tests.conftest import (
        TestingSessionLocal,
    )

    db = TestingSessionLocal()

    try:
        test_runner.run_test_case(
            db=db,
            prompt_id=prompt["id"],
            test_case_id=test_case["id"],
            data=PromptTestCaseRunRequest(
                provider="fake",
            ),
        )
    finally:
        db.close()

    assert provider.received_messages == [
        ProviderMessage(
            role="system",
            content=(
                "You are evaluating Python."
            ),
        ),
        ProviderMessage(
            role="user",
            content=(
                "Explain Python for "
                "Backend Engineer."
            ),
        ),
    ]