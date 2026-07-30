from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.models.prompt import Prompt
from app.repositories.prompt_repository import prompt_repository
from app.schemas.prompt import PromptCreate, PromptUpdate


class PromptService:
    def create_prompt(
        self,
        db: Session,
        data: PromptCreate,
    ) -> Prompt:
        prompt = Prompt(
            title=data.title.strip(),
            description=data.description,
            system_prompt=data.system_prompt,
            user_prompt=data.user_prompt,
        )

        return prompt_repository.create(db, prompt)

    def list_prompts(
        self,
        db: Session,
    ) -> list[Prompt]:
        return prompt_repository.list_all(db)

    def get_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> Prompt:
        prompt = prompt_repository.get_by_id(
            db,
            prompt_id,
        )

        if prompt is None:
            raise ApplicationError(
                "The requested prompt was not found.",
                code="prompt_not_found",
                status_code=404,
            )

        return prompt

    def update_prompt(
        self,
        db: Session,
        prompt_id: int,
        data: PromptUpdate,
    ) -> Prompt:
        prompt = self.get_prompt(db, prompt_id)

        update_data = data.model_dump(
            exclude_unset=True,
        )

        if "title" in update_data:
            update_data["title"] = update_data["title"].strip()

        for field, value in update_data.items():
            setattr(prompt, field, value)

        return prompt_repository.update(db, prompt)

    def delete_prompt(
        self,
        db: Session,
        prompt_id: int,
    ) -> None:
        prompt = self.get_prompt(db, prompt_id)

        prompt_repository.delete(db, prompt)


prompt_service = PromptService()
