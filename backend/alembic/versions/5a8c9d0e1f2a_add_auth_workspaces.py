"""add authentication and workspace ownership

Revision ID: 5a8c9d0e1f2a
Revises: 4f3b6c7d8e9f
Create Date: 2026-09-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5a8c9d0e1f2a"
down_revision: Union[str, Sequence[str], None] = "4f3b6c7d8e9f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=512), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="1", nullable=False),
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
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "workspaces",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
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
        sa.UniqueConstraint("slug"),
    )
    op.create_index(
        op.f("ix_workspaces_id"), "workspaces", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_workspaces_slug"), "workspaces", ["slug"], unique=True
    )

    op.create_table(
        "workspace_memberships",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=30), server_default="owner", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "workspace_id",
            name="uq_workspace_memberships_user_workspace",
        ),
    )
    op.create_index(
        op.f("ix_workspace_memberships_id"),
        "workspace_memberships",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workspace_memberships_user_id"),
        "workspace_memberships",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workspace_memberships_workspace_id"),
        "workspace_memberships",
        ["workspace_id"],
        unique=False,
    )

    op.create_table(
        "auth_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        op.f("ix_auth_sessions_id"), "auth_sessions", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_auth_sessions_token_hash"),
        "auth_sessions",
        ["token_hash"],
        unique=True,
    )
    op.create_index(
        op.f("ix_auth_sessions_user_id"),
        "auth_sessions",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_auth_sessions_workspace_id"),
        "auth_sessions",
        ["workspace_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_auth_sessions_expires_at"),
        "auth_sessions",
        ["expires_at"],
        unique=False,
    )

    # Rebuild instead of altering the unnamed SQLite UNIQUE(provider)
    # constraint. Existing encrypted keys are preserved with workspace_id NULL
    # and are claimed by the first account created after migration.
    op.create_table(
        "provider_connections_scoped",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "workspace_id",
            "provider",
            name="uq_provider_connections_workspace_provider",
        ),
    )
    op.execute(
        """
        INSERT INTO provider_connections_scoped
            (id, workspace_id, provider, encrypted_api_key, key_last_four,
             created_at, updated_at)
        SELECT id, NULL, provider, encrypted_api_key, key_last_four,
               created_at, updated_at
        FROM provider_connections
        """
    )
    op.drop_index(
        op.f("ix_provider_connections_provider"),
        table_name="provider_connections",
    )
    op.drop_index(
        op.f("ix_provider_connections_id"),
        table_name="provider_connections",
    )
    op.drop_table("provider_connections")
    op.rename_table("provider_connections_scoped", "provider_connections")
    op.create_index(
        op.f("ix_provider_connections_id"),
        "provider_connections",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_provider_connections_workspace_id"),
        "provider_connections",
        ["workspace_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_provider_connections_provider"),
        "provider_connections",
        ["provider"],
        unique=False,
    )


def downgrade() -> None:
    # Downgrade is safe only while each provider exists at most once globally.
    # This is expected for the current single-user development phase.
    connection = op.get_bind()
    duplicates = connection.execute(
        sa.text(
            """
            SELECT provider
            FROM provider_connections
            GROUP BY provider
            HAVING COUNT(*) > 1
            LIMIT 1
            """
        )
    ).first()
    if duplicates is not None:
        raise RuntimeError(
            "Cannot downgrade: multiple workspaces have the same provider."
        )

    op.create_table(
        "provider_connections_legacy",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("encrypted_api_key", sa.Text(), nullable=False),
        sa.Column("key_last_four", sa.String(length=4), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider"),
    )
    op.execute(
        """
        INSERT INTO provider_connections_legacy
            (id, provider, encrypted_api_key, key_last_four,
             created_at, updated_at)
        SELECT id, provider, encrypted_api_key, key_last_four,
               created_at, updated_at
        FROM provider_connections
        """
    )
    op.drop_index(
        op.f("ix_provider_connections_provider"),
        table_name="provider_connections",
    )
    op.drop_index(
        op.f("ix_provider_connections_workspace_id"),
        table_name="provider_connections",
    )
    op.drop_index(
        op.f("ix_provider_connections_id"),
        table_name="provider_connections",
    )
    op.drop_table("provider_connections")
    op.rename_table("provider_connections_legacy", "provider_connections")
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

    op.drop_table("auth_sessions")
    op.drop_table("workspace_memberships")
    op.drop_table("workspaces")
    op.drop_table("users")
