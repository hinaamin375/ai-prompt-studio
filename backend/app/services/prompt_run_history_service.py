from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.prompt_run import PromptRun
from app.repositories.prompt_run_repository import (
    prompt_run_repository,
)
from app.services.prompt_service import (
    prompt_service,
)


class PromptRunHistoryService:
    def list_runs(
        self,
        db: Session,
        prompt_id: int,
    ) -> list[PromptRun]:
        prompt_service.get_prompt(
            db,
            prompt_id,
        )

        return prompt_run_repository.list_for_prompt(
            db,
            prompt_id,
        )

    def get_run(
        self,
        db: Session,
        prompt_id: int,
        run_id: int,
    ) -> PromptRun:
        prompt_service.get_prompt(
            db,
            prompt_id,
        )

        prompt_run = prompt_run_repository.get_by_id(
            db,
            prompt_id,
            run_id,
        )

        if prompt_run is None:
            raise ApplicationError(
                "The requested prompt run was not found.",
                code="prompt_run_not_found",
                status_code=404,
            )

        return prompt_run


prompt_run_history_service = PromptRunHistoryService()
