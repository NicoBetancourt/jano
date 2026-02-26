"""add_is_official_to_documents

Revision ID: 79f4d9a1c5d4
Revises: 6bcde5592820
Create Date: 2026-02-22 20:25:53.945331

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '79f4d9a1c5d4'
down_revision: Union[str, Sequence[str], None] = '6bcde5592820'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Only add the new column and modify user_id
    op.add_column('documents', sa.Column('is_official', sa.Boolean(), server_default='false', nullable=False))
    
    op.alter_column('documents', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=True)


def downgrade() -> None:
    op.alter_column('documents', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.drop_column('documents', 'is_official')
