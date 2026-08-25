from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
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
    from app.models.prompt_test_suite_run import (
        PromptTestSuiteRun,
    )


class PromptTestCaseResult(Base):
    __tablename__ = "prompt_test_case_results"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    suite_run_id: Mapped[int] = mapped_column(
        ForeignKey(
            "prompt_test_suite_runs.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    test_case_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "prompt_test_cases.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    prompt_run_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "prompt_runs.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    test_case_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    passed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    passed_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    failed_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    assertions: Mapped[
        list[dict[str, Any]]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    suite_run: Mapped[
        "PromptTestSuiteRun"
    ] = relationship(
        back_populates="results",
    )