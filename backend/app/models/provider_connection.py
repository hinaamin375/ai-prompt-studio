from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProviderConnection(Base):
    __tablename__ = "provider_connections"
    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "provider",
            name="uq_provider_connections_workspace_provider",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Nullable only so the migration can preserve the existing single-user
    # BYOK rows. The first registered account claims those legacy rows.
    workspace_id: Mapped[int | None] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )
    encrypted_api_key: Mapped[str] = mapped_column(Text, nullable=False)
    key_last_four: Mapped[str] = mapped_column(String(4), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
