"""add_session_id_to_messages

Revision ID: 6bcde5592820
Revises: f939657a62d0
Create Date: 2026-01-25 22:40:35.397188

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6bcde5592820"
down_revision: Union[str, Sequence[str], None] = "f939657a62d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Delete all existing messages (they don't have session_id)
    op.execute("DELETE FROM messages")

    # Add session_id column
    op.add_column("messages", sa.Column("session_id", sa.String(), nullable=False))

    # Create index on session_id
    op.create_index(
        op.f("ix_messages_session_id"), "messages", ["session_id"], unique=False
    )

    # Create composite index on (user_id, session_id) for efficient querying
    op.create_index(
        "ix_messages_user_session", "messages", ["user_id", "session_id"], unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index("ix_messages_user_session", table_name="messages")
    op.drop_index(op.f("ix_messages_session_id"), table_name="messages")

    # Drop session_id column
    op.drop_column("messages", "session_id")
