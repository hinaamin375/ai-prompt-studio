from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)
from sqlalchemy.orm import Session
from app.schemas.prompt_run import (
    PromptRunRequest,
    PromptRunResponse,
)
from app.services.prompt_run_service import (
    prompt_run_service,
)
from app.db.session import get_db
from app.schemas.analysis import (
    PromptAnalysis,
    PromptAnalyzeRequest,
)
from app.schemas.prompt import (
    PromptCreate,
    PromptResponse,
    PromptUpdate,
)
from app.schemas.prompt_version import (
    PromptVersionResponse,
)
from app.services.prompt_analysis_service import (
    prompt_analysis_service,
)
from app.services.prompt_service import (
    prompt_service,
)
from app.services.prompt_version_service import (
    prompt_version_service,
)
from app.schemas.prompt_run_history import (
    PromptRunHistoryResponse,
)
from app.services.prompt_run_history_service import (
    prompt_run_history_service,
)
from app.services.prompt_test_case_service import (
    prompt_test_case_service,
)
from app.schemas.prompt_test_case import (
    PromptTestCaseCreate,
    PromptTestCaseResponse,
    PromptTestCaseUpdate,
)
from app.schemas.prompt_test_case_run import (
    PromptTestCaseRunRequest,
    PromptTestCaseRunResponse,
)
from app.services.prompt_test_case_run_service import (
    prompt_test_case_run_service,
)
from app.schemas.prompt_test_suite_run import (
    PromptTestSuiteRunRequest,
    PromptTestSuiteRunResponse,
)
from app.services.prompt_test_suite_run_service import (
    prompt_test_suite_run_service,
)

router = APIRouter(
    prefix="/prompts",
    tags=["Prompts"],
)


DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "",
    response_model=PromptResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_prompt(
    data: PromptCreate,
    db: DatabaseSession,
) -> PromptResponse:
    return prompt_service.create_prompt(
        db,
        data,
    )


@router.get(
    "/{prompt_id}/runs",
    response_model=list[PromptRunHistoryResponse],
)
def list_prompt_runs(
    prompt_id: int,
    db: DatabaseSession,
) -> list[PromptRunHistoryResponse]:
    return prompt_run_history_service.list_runs(
        db,
        prompt_id,
    )


@router.get(
    "/{prompt_id}/runs/{run_id}",
    response_model=PromptRunHistoryResponse,
)
def get_prompt_run(
    prompt_id: int,
    run_id: int,
    db: DatabaseSession,
) -> PromptRunHistoryResponse:
    return prompt_run_history_service.get_run(
        db,
        prompt_id,
        run_id,
    )


@router.post(
    "/{prompt_id}/duplicate",
    response_model=PromptResponse,
    status_code=status.HTTP_201_CREATED,
)
def duplicate_prompt(
    prompt_id: int,
    db: DatabaseSession,
) -> PromptResponse:
    """
    Create an independent copy of a saved prompt.
    """
    return prompt_service.duplicate_prompt(
        db,
        prompt_id,
    )


@router.get(
    "",
    response_model=list[PromptResponse],
)
def list_prompts(
    db: DatabaseSession,
) -> list[PromptResponse]:
    return prompt_service.list_prompts(
        db,
    )


@router.get(
    "/{prompt_id}/versions",
    response_model=list[PromptVersionResponse],
)
def list_prompt_versions(
    prompt_id: int,
    db: DatabaseSession,
) -> list[PromptVersionResponse]:
    return prompt_version_service.list_versions(
        db,
        prompt_id,
    )


@router.get(
    "/{prompt_id}/versions/{version}",
    response_model=PromptVersionResponse,
)
def get_prompt_version(
    prompt_id: int,
    version: int,
    db: DatabaseSession,
) -> PromptVersionResponse:
    return prompt_version_service.get_version(
        db,
        prompt_id,
        version,
    )


@router.post(
    "/{prompt_id}/versions/{version}/restore",
    response_model=PromptResponse,
)
def restore_prompt_version(
    prompt_id: int,
    version: int,
    db: DatabaseSession,
) -> PromptResponse:
    return prompt_version_service.restore_version(
        db,
        prompt_id,
        version,
    )


@router.post(
    "/{prompt_id}/analyze",
    response_model=PromptAnalysis,
)
def analyze_prompt(
    prompt_id: int,
    data: PromptAnalyzeRequest,
    db: DatabaseSession,
) -> PromptAnalysis:
    """
    Analyze a saved prompt using optional variable values.
    """
    return prompt_analysis_service.analyze_prompt(
        db=db,
        prompt_id=prompt_id,
        variables=data.variables,
    )


@router.post(
    "/{prompt_id}/run",
    response_model=PromptRunResponse,
)
def run_prompt(
    prompt_id: int,
    data: PromptRunRequest,
    db: DatabaseSession,
) -> PromptRunResponse:
    """
    Render and execute a saved prompt using
    a configured AI provider.
    """
    return prompt_run_service.run_prompt(
        db=db,
        prompt_id=prompt_id,
        data=data,
    )
@router.post(
    "/{prompt_id}/test-cases",
    response_model=PromptTestCaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_prompt_test_case(
    prompt_id: int,
    data: PromptTestCaseCreate,
    db: DatabaseSession,
) -> PromptTestCaseResponse:
    return (
        prompt_test_case_service.create_test_case(
            db,
            prompt_id,
            data,
        )
    )


@router.get(
    "/{prompt_id}/test-cases",
    response_model=list[
        PromptTestCaseResponse
    ],
)
def list_prompt_test_cases(
    prompt_id: int,
    db: DatabaseSession,
) -> list[PromptTestCaseResponse]:
    return (
        prompt_test_case_service.list_test_cases(
            db,
            prompt_id,
        )
    )


@router.get(
    "/{prompt_id}/test-cases/{test_case_id}",
    response_model=PromptTestCaseResponse,
)
def get_prompt_test_case(
    prompt_id: int,
    test_case_id: int,
    db: DatabaseSession,
) -> PromptTestCaseResponse:
    return (
        prompt_test_case_service.get_test_case(
            db,
            prompt_id,
            test_case_id,
        )
    )


@router.patch(
    "/{prompt_id}/test-cases/{test_case_id}",
    response_model=PromptTestCaseResponse,
)
def update_prompt_test_case(
    prompt_id: int,
    test_case_id: int,
    data: PromptTestCaseUpdate,
    db: DatabaseSession,
) -> PromptTestCaseResponse:
    return (
        prompt_test_case_service.update_test_case(
            db,
            prompt_id,
            test_case_id,
            data,
        )
    )


@router.delete(
    "/{prompt_id}/test-cases/{test_case_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_prompt_test_case(
    prompt_id: int,
    test_case_id: int,
    db: DatabaseSession,
) -> Response:
    prompt_test_case_service.delete_test_case(
        db,
        prompt_id,
        test_case_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
@router.post(
    "/{prompt_id}/test-cases/{test_case_id}/run",
    response_model=PromptTestCaseRunResponse,
)
def run_prompt_test_case(
    prompt_id: int,
    test_case_id: int,
    data: PromptTestCaseRunRequest,
    db: DatabaseSession,
) -> PromptTestCaseRunResponse:
    return (
        prompt_test_case_run_service.run_test_case(
            db,
            prompt_id,
            test_case_id,
            data,
        )
    )
@router.get(
    "/{prompt_id}",
    response_model=PromptResponse,
)
def get_prompt(
    prompt_id: int,
    db: DatabaseSession,
) -> PromptResponse:
    return prompt_service.get_prompt(
        db,
        prompt_id,
    )


@router.patch(
    "/{prompt_id}",
    response_model=PromptResponse,
)
def update_prompt(
    prompt_id: int,
    data: PromptUpdate,
    db: DatabaseSession,
) -> PromptResponse:
    return prompt_service.update_prompt(
        db,
        prompt_id,
        data,
    )


@router.delete(
    "/{prompt_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_prompt(
    prompt_id: int,
    db: DatabaseSession,
) -> Response:
    prompt_service.delete_prompt(
        db,
        prompt_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
@router.post(
    "/{prompt_id}/test-suite-runs",
    response_model=PromptTestSuiteRunResponse,
    status_code=status.HTTP_201_CREATED,
)
def run_prompt_test_suite(
    prompt_id: int,
    data: PromptTestSuiteRunRequest,
    db: DatabaseSession,
) -> PromptTestSuiteRunResponse:
    """
    Run all saved test cases for a prompt and
    persist the regression test suite result.
    """
    return (
        prompt_test_suite_run_service.run_suite(
            db=db,
            prompt_id=prompt_id,
            data=data,
        )
    )

@router.get(
    "/{prompt_id}/test-suite-runs",
    response_model=list[
        PromptTestSuiteRunResponse
    ],
)
def list_prompt_test_suite_runs(
    prompt_id: int,
    db: DatabaseSession,
) -> list[PromptTestSuiteRunResponse]:
    """
    Return persisted regression test suite
    history for a prompt.
    """
    return (
        prompt_test_suite_run_service
        .list_suite_runs(
            db=db,
            prompt_id=prompt_id,
        )
    )

@router.get(
    "/{prompt_id}/test-suite-runs/{suite_run_id}",
    response_model=PromptTestSuiteRunResponse,
)
def get_prompt_test_suite_run(
    prompt_id: int,
    suite_run_id: int,
    db: DatabaseSession,
) -> PromptTestSuiteRunResponse:
    """
    Return one persisted regression test suite
    run including its individual test results.
    """
    return (
        prompt_test_suite_run_service
        .get_suite_run(
            db=db,
            prompt_id=prompt_id,
            suite_run_id=suite_run_id,
        )
    )