from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.prompt import Prompt


class Collection(Base):
    __tablename__ = "collections"

    __table_args__ = (
        Index(
            "ux_collections_workspace_name",
            "workspace_id",
            "name",
            unique=True,
        ),
        Index("ix_collections_workspace_id", "workspace_id"),
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
        String(100),
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
        back_populates="collection",
    )
