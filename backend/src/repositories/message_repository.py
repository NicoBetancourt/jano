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

    async def get_by_user(self, user_id: int, limit: int = 50) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.user_id == user_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        # Return in chronological order
        return list(reversed(result.scalars().all()))
