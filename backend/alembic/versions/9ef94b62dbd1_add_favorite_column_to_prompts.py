"""add favorite column to prompts

Revision ID: 9ef94b62dbd1
Revises: 273120283845
Create Date: 2026-08-04 16:35:09.129360

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9ef94b62dbd1'
down_revision: Union[str, Sequence[str], None] = '273120283845'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "prompts",
        sa.Column(
            "favorite",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade():
    op.drop_column("prompts", "favorite")