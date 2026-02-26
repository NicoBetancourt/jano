import json

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.models.message import ConversationSession


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert_session(
        self, user_id: int, session_id: str, messages_json: bytes
    ) -> ConversationSession:
        """Insert or update the full message JSON for a session."""
        stmt = select(ConversationSession).where(
            ConversationSession.user_id == user_id,
            ConversationSession.session_id == session_id,
        )
        result = await self.session.execute(stmt)
        row = result.scalar_one_or_none()

        if row is None:
            row = ConversationSession(
                user_id=user_id,
                session_id=session_id,
                messages_json=messages_json.decode("utf-8"),
            )
            self.session.add(row)
        else:
            row.messages_json = messages_json.decode("utf-8")

        await self.session.commit()
        await self.session.refresh(row)
        return row

    async def get_session_messages(self, user_id: int, session_id: str) -> bytes | None:
        """Return the raw JSON bytes for a session, or None if not found."""
        stmt = select(ConversationSession).where(
            ConversationSession.user_id == user_id,
            ConversationSession.session_id == session_id,
        )
        result = await self.session.execute(stmt)
        row = result.scalar_one_or_none()
        if row is None:
            return None
        return row.messages_json.encode("utf-8")

    async def get_sessions_by_user(self, user_id: int) -> list[dict]:
        """List all sessions for a user with basic metadata."""
        stmt = (
            select(ConversationSession)
            .where(ConversationSession.user_id == user_id)
            .order_by(desc(ConversationSession.updated_at))
        )
        result = await self.session.execute(stmt)
        rows = result.scalars().all()

        sessions = []
        for row in rows:
            # Extract a brief preview from the JSON: last user message content
            try:
                msgs = json.loads(row.messages_json)
                last_user_text = ""
                for msg in reversed(msgs):
                    if msg.get("kind") == "request":
                        for part in msg.get("parts", []):
                            if part.get("part_kind") == "user-prompt":
                                last_user_text = part.get("content", "")[:100]
                                break
                    if last_user_text:
                        break
            except Exception:
                last_user_text = ""

            sessions.append(
                {
                    "session_id": row.session_id,
                    "last_message": last_user_text,
                    "timestamp": row.updated_at.isoformat(),
                }
            )

        return sessions

    async def delete_by_session(self, user_id: int, session_id: str) -> bool:
        """Delete the session row for a specific user session."""
        from sqlalchemy import delete

        stmt = delete(ConversationSession).where(
            ConversationSession.user_id == user_id,
            ConversationSession.session_id == session_id,
        )
        await self.session.execute(stmt)
        await self.session.commit()
        return True
