from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Table,
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


prompt_tags = Table(
    "prompt_tags",
    Base.metadata,
    Column(
        "prompt_id",
        ForeignKey(
            "prompts.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
    Column(
        "tag_id",
        ForeignKey(
            "tags.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


class Tag(Base):
    __tablename__ = "tags"

    __table_args__ = (
        Index(
            "ux_tags_workspace_name",
            "workspace_id",
            "name",
            unique=True,
        ),
        Index("ix_tags_workspace_id", "workspace_id"),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    workspace_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "workspaces.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
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

    prompts: Mapped[list["Prompt"]] = relationship(
        secondary=prompt_tags,
        back_populates="tags",
    )
