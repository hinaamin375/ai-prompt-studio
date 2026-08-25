from app.providers import (
    ModelProvider,
    ProviderExecutionSettings,
    ProviderMessage,
    ProviderRegistry,
    ProviderResult,
    ProviderUsage,
)
from app.schemas.prompt_test_suite_run import (
    PromptTestSuiteRunRequest,
)
from app.services.prompt_run_service import (
    PromptRunService,
)
from app.services.prompt_test_case_run_service import (
    PromptTestCaseRunService,
)
from app.services.prompt_test_suite_run_service import (
    PromptTestSuiteRunService,
)

from tests.conftest import TestingSessionLocal
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

class FakeProvider(ModelProvider):
    provider_id = "fake"
    display_name = "Fake"

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
        return ProviderResult(
            provider="fake",
            model=model or self.default_model,
            output_text=(
                "Python FastAPI backend response"
            ),
            usage=ProviderUsage(
                input_tokens=10,
                output_tokens=5,
                total_tokens=15,
            ),
        )


def test_prompt_test_suite_run_is_persisted(
):
    prompt_response = client.post(
        "/api/v1/prompts",
        json={
            "title": "Regression prompt",
            "description": None,
            "system_prompt": (
                "You are a developer."
            ),
            "user_prompt": (
                "Discuss {{technology}}."
            ),
        },
    )

    assert prompt_response.status_code == 201

    prompt_id = prompt_response.json()["id"]

    first_test = client.post(
        f"/api/v1/prompts/{prompt_id}/test-cases",
        json={
            "name": "Python test",
            "description": None,
            "variables": {
                "technology": "Python",
            },
            "expected_contains": [
                "Python",
                "FastAPI",
            ],
        },
    )

    assert first_test.status_code == 201

    second_test = client.post(
        f"/api/v1/prompts/{prompt_id}/test-cases",
        json={
            "name": "Intentional failure",
            "description": None,
            "variables": {
                "technology": "Python",
            },
            "expected_contains": [
                "Python",
                "Django",
            ],
        },
    )

    assert second_test.status_code == 201

    registry = ProviderRegistry(
        known_provider_ids={"fake"},
    )

    registry.register(
        FakeProvider(),
    )

    prompt_run_service = PromptRunService(
        registry=registry,
    )

    test_case_run_service = (
        PromptTestCaseRunService(
            prompt_run_service_instance=(
                prompt_run_service
            ),
        )
    )

    suite_service = PromptTestSuiteRunService(
        test_case_run_service=(
            test_case_run_service
        ),
    )

    db = TestingSessionLocal()

    try:
        result = suite_service.run_suite(
            db=db,
            prompt_id=prompt_id,
            data=PromptTestSuiteRunRequest(
                provider="fake",
            ),
        )

        assert result.id is not None

        assert result.provider == "fake"
        assert result.model == "fake-model"

        assert result.total_tests == 2
        assert result.passed_tests == 1
        assert result.failed_tests == 1

        assert result.total_assertions == 4
        assert result.passed_assertions == 3
        assert result.failed_assertions == 1

        assert len(result.results) == 2

        for case_result in result.results:
            assert case_result.id is not None
            assert (
                case_result.prompt_run_id
                is not None
            )

        history = (
            suite_service.list_suite_runs(
                db,
                prompt_id,
            )
        )

        assert len(history) == 1
        assert history[0].id == result.id
        assert len(history[0].results) == 2

    finally:
        db.close()