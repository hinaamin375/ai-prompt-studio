from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base
from app.models.tag import prompt_tags

if TYPE_CHECKING:
    from app.models.collection import Collection
    from app.models.prompt_run import PromptRun
    from app.models.prompt_version import PromptVersion
    from app.models.tag import Tag


class Prompt(Base):
    __tablename__ = "prompts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    system_prompt: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    user_prompt: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    favorite: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )

    collection_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "collections.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    collection: Mapped["Collection | None"] = relationship(
        back_populates="prompts",
    )

    versions: Mapped[list["PromptVersion"]] = relationship(
        back_populates="prompt",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    runs: Mapped[list["PromptRun"]] = relationship(
        back_populates="prompt",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    tags: Mapped[list["Tag"]] = relationship(
        secondary=prompt_tags,
        back_populates="prompts",
    )
