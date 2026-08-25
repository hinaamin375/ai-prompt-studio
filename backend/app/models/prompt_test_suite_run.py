from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base


if TYPE_CHECKING:
    from app.models.prompt import Prompt
    from app.models.prompt_test_case_result import (
        PromptTestCaseResult,
    )


class PromptTestSuiteRun(Base):
    __tablename__ = "prompt_test_suite_runs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    prompt_id: Mapped[int] = mapped_column(
        ForeignKey(
            "prompts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    temperature: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    max_output_tokens: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    total_tests: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    passed_tests: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    failed_tests: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    total_assertions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    passed_assertions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    failed_assertions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    prompt: Mapped["Prompt"] = relationship(
        back_populates="test_suite_runs",
    )

    results: Mapped[
        list["PromptTestCaseResult"]
    ] = relationship(
        back_populates="suite_run",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )