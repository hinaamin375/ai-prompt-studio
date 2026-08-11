"""add collections

Revision ID: cd692ae9f314
Revises: 9ef94b62dbd1
Create Date: 2026-08-07 16:34:20.027259
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "cd692ae9f314"
down_revision: Union[str, Sequence[str], None] = "9ef94b62dbd1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add collections and allow prompts to belong to a collection."""

    op.create_table(
        "collections",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_collections_id"),
        "collections",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_collections_name"),
        "collections",
        ["name"],
        unique=True,
    )

    with op.batch_alter_table(
        "prompts",
        schema=None,
    ) as batch_op:
        batch_op.add_column(
            sa.Column(
                "collection_id",
                sa.Integer(),
                nullable=True,
            )
        )

        batch_op.create_index(
            op.f("ix_prompts_collection_id"),
            ["collection_id"],
            unique=False,
        )

        batch_op.create_foreign_key(
            "fk_prompts_collection_id_collections",
            "collections",
            ["collection_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    """Remove collections and prompt collection membership."""

    with op.batch_alter_table(
        "prompts",
        schema=None,
    ) as batch_op:
        batch_op.drop_constraint(
            "fk_prompts_collection_id_collections",
            type_="foreignkey",
        )

        batch_op.drop_index(
            op.f("ix_prompts_collection_id"),
        )

        batch_op.drop_column(
            "collection_id",
        )

    op.drop_index(
        op.f("ix_collections_name"),
        table_name="collections",
    )

    op.drop_index(
        op.f("ix_collections_id"),
        table_name="collections",
    )

    op.drop_table("collections")