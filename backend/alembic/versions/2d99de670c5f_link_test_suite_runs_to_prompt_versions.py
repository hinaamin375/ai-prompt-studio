"""link test suite runs to prompt versions

Revision ID: 2d99de670c5f
Revises: d3ade7d285d5
Create Date: 2026-09-08 13:06:29.263656
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2d99de670c5f"
down_revision: Union[str, Sequence[str], None] = (
    "d3ade7d285d5"
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


FK_NAME = (
    "fk_prompt_test_suite_runs_"
    "prompt_version_id_prompt_versions"
)

INDEX_NAME = (
    "ix_prompt_test_suite_runs_prompt_version_id"
)


def upgrade() -> None:
    """Link regression suite runs to prompt versions."""
    with op.batch_alter_table(
        "prompt_test_suite_runs",
        schema=None,
    ) as batch_op:
        batch_op.add_column(
            sa.Column(
                "prompt_version_id",
                sa.Integer(),
                nullable=True,
            )
        )

        batch_op.create_index(
            INDEX_NAME,
            ["prompt_version_id"],
            unique=False,
        )

        batch_op.create_foreign_key(
            FK_NAME,
            "prompt_versions",
            ["prompt_version_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    """Remove prompt-version linkage from suite runs."""
    with op.batch_alter_table(
        "prompt_test_suite_runs",
        schema=None,
    ) as batch_op:
        batch_op.drop_constraint(
            FK_NAME,
            type_="foreignkey",
        )

        batch_op.drop_index(
            INDEX_NAME,
        )

        batch_op.drop_column(
            "prompt_version_id",
        )