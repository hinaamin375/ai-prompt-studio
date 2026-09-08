from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProviderConnection(Base):
    __tablename__ = "provider_connections"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    encrypted_api_key: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    key_last_four: Mapped[str] = mapped_column(
        String(4),
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
