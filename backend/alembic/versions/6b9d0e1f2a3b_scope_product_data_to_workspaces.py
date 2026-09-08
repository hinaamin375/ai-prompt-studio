"""scope product data to workspaces

Revision ID: 6b9d0e1f2a3b
Revises: 5a8c9d0e1f2a
Create Date: 2026-09-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6b9d0e1f2a3b"
down_revision: Union[str, Sequence[str], None] = "5a8c9d0e1f2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _assign_legacy_rows(table_name: str) -> None:
    op.execute(
        sa.text(
            f"""
            UPDATE {table_name}
            SET workspace_id = (SELECT MIN(id) FROM workspaces)
            WHERE workspace_id IS NULL
              AND EXISTS (SELECT 1 FROM workspaces)
            """
        )
    )


def upgrade() -> None:
    # Root product records own the workspace boundary. Child records such as
    # versions, runs, test cases, and suite results remain owned transitively
    # through their prompt foreign key.
    with op.batch_alter_table("collections", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("workspace_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_collections_workspace_id_workspaces",
            "workspaces",
            ["workspace_id"],
            ["id"],
            ondelete="CASCADE",
        )

    with op.batch_alter_table("tags", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("workspace_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_tags_workspace_id_workspaces",
            "workspaces",
            ["workspace_id"],
            ["id"],
            ondelete="CASCADE",
        )

    with op.batch_alter_table("prompts", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("workspace_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_prompts_workspace_id_workspaces",
            "workspaces",
            ["workspace_id"],
            ["id"],
            ondelete="CASCADE",
        )

    # If accounts already exist, all data from the old single-workspace app
    # belongs to the earliest workspace (the first account created). If no
    # account exists yet, rows stay NULL and AuthService claims them for the
    # first workspace created later.
    _assign_legacy_rows("collections")
    _assign_legacy_rows("tags")
    _assign_legacy_rows("prompts")

    # Names were globally unique before workspaces existed. Replace those
    # indexes with workspace-local uniqueness so two customers may both have
    # a collection/tag called e.g. "Research" or "writing".
    op.drop_index("ix_collections_name", table_name="collections")
    op.create_index("ix_collections_name", "collections", ["name"], unique=False)
    op.create_index(
        "ix_collections_workspace_id",
        "collections",
        ["workspace_id"],
        unique=False,
    )
    op.create_index(
        "ux_collections_workspace_name",
        "collections",
        ["workspace_id", "name"],
        unique=True,
    )

    op.drop_index("ix_tags_name", table_name="tags")
    op.create_index("ix_tags_name", "tags", ["name"], unique=False)
    op.create_index(
        "ix_tags_workspace_id",
        "tags",
        ["workspace_id"],
        unique=False,
    )
    op.create_index(
        "ux_tags_workspace_name",
        "tags",
        ["workspace_id", "name"],
        unique=True,
    )

    op.create_index(
        "ix_prompts_workspace_id",
        "prompts",
        ["workspace_id"],
        unique=False,
    )


def downgrade() -> None:
    connection = op.get_bind()

    for table_name in ("collections", "tags"):
        duplicate = connection.execute(
            sa.text(
                f"""
                SELECT name
                FROM {table_name}
                GROUP BY name
                HAVING COUNT(*) > 1
                LIMIT 1
                """
            )
        ).first()
        if duplicate is not None:
            raise RuntimeError(
                f"Cannot downgrade: {table_name} contains duplicate names "
                "across workspaces."
            )

    op.drop_index("ix_prompts_workspace_id", table_name="prompts")

    op.drop_index("ux_tags_workspace_name", table_name="tags")
    op.drop_index("ix_tags_workspace_id", table_name="tags")
    op.drop_index("ix_tags_name", table_name="tags")
    op.create_index("ix_tags_name", "tags", ["name"], unique=True)

    op.drop_index("ux_collections_workspace_name", table_name="collections")
    op.drop_index("ix_collections_workspace_id", table_name="collections")
    op.drop_index("ix_collections_name", table_name="collections")
    op.create_index(
        "ix_collections_name", "collections", ["name"], unique=True
    )

    with op.batch_alter_table("prompts", recreate="always") as batch_op:
        batch_op.drop_constraint(
            "fk_prompts_workspace_id_workspaces", type_="foreignkey"
        )
        batch_op.drop_column("workspace_id")

    with op.batch_alter_table("tags", recreate="always") as batch_op:
        batch_op.drop_constraint(
            "fk_tags_workspace_id_workspaces", type_="foreignkey"
        )
        batch_op.drop_column("workspace_id")

    with op.batch_alter_table("collections", recreate="always") as batch_op:
        batch_op.drop_constraint(
            "fk_collections_workspace_id_workspaces", type_="foreignkey"
        )
        batch_op.drop_column("workspace_id")
