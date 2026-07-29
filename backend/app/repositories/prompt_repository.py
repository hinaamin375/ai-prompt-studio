from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.prompt import Prompt


class PromptRepository:
    def create(
        self,
        db: Session,
        prompt: Prompt,
    ) -> Prompt:
        db.add(prompt)
        db.commit()
        db.refresh(prompt)

        return prompt

    def list_all(
        self,
        db: Session,
    ) -> list[Prompt]:
        statement = select(Prompt).order_by(
            Prompt.updated_at.desc(),
        )

        return list(
            db.scalars(statement).all(),
        )

    def get_by_id(
        self,
        db: Session,
        prompt_id: int,
    ) -> Prompt | None:
        return db.get(Prompt, prompt_id)

    def update(
        self,
        db: Session,
        prompt: Prompt,
    ) -> Prompt:
        db.commit()
        db.refresh(prompt)

        return prompt

    def delete(
        self,
        db: Session,
        prompt: Prompt,
    ) -> None:
        db.delete(prompt)
        db.commit()


prompt_repository = PromptRepository()