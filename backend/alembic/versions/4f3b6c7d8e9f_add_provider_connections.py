"""add provider connections

Revision ID: 4f3b6c7d8e9f
Revises: 2d99de670c5f
Create Date: 2026-09-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4f3b6c7d8e9f"
down_revision: Union[str, Sequence[str], None] = "2d99de670c5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "provider_connections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("encrypted_api_key", sa.Text(), nullable=False),
        sa.Column("key_last_four", sa.String(length=4), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider"),
    )
    op.create_index(
        op.f("ix_provider_connections_id"),
        "provider_connections",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_provider_connections_provider"),
        "provider_connections",
        ["provider"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_provider_connections_provider"),
        table_name="provider_connections",
    )
    op.drop_index(
        op.f("ix_provider_connections_id"),
        table_name="provider_connections",
    )
    op.drop_table("provider_connections")
