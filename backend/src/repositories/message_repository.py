from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.models.message import Message


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, message: Message) -> Message:
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def get_by_session(
        self, user_id: int, session_id: str, limit: int = 50
    ) -> list[Message]:
        """Get messages for a specific user session."""
        stmt = (
            select(Message)
            .where(Message.user_id == user_id, Message.session_id == session_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        # Return in chronological order
        return list(reversed(result.scalars().all()))

    async def get_sessions_by_user(self, user_id: int) -> list[dict]:
        """Get all sessions for a user with metadata (last message, timestamp)."""
        from sqlalchemy import desc, func

        # Subquery to get the last message for each session
        subquery = (
            select(
                Message.session_id,
                func.max(Message.created_at).label("last_message_time"),
            )
            .where(Message.user_id == user_id)
            .group_by(Message.session_id)
            .subquery()
        )

        # Join to get the actual last message content
        stmt = (
            select(Message)
            .join(
                subquery,
                (Message.session_id == subquery.c.session_id)
                & (Message.created_at == subquery.c.last_message_time),
            )
            .where(Message.user_id == user_id)
            .order_by(desc(subquery.c.last_message_time))
        )

        result = await self.session.execute(stmt)
        messages = result.scalars().all()

        # Format the response
        sessions = []
        for msg in messages:
            sessions.append(
                {
                    "session_id": msg.session_id,
                    "last_message": msg.content[:100],  # First 100 chars
                    "timestamp": msg.created_at.isoformat(),
                    "role": msg.role.value,
                }
            )

        return sessions

    async def delete_by_session(self, user_id: int, session_id: str) -> bool:
        """Delete all messages for a specific user session."""
        from sqlalchemy import delete

        stmt = delete(Message).where(
            Message.user_id == user_id, Message.session_id == session_id
        )
        await self.session.execute(stmt)
        await self.session.commit()
        return True
