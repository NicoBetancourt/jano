from typing import AsyncGenerator

from pydantic_ai.messages import ModelMessagesTypeAdapter
from src.agents.chat_agent.agent import ChatAgent
from src.agents.chat_agent.deps import ChatDeps
from src.domain.models.user import User
from src.repositories.document_chunk_repository import DocumentChunkRepository
from src.repositories.document_repository import DocumentRepository
from src.repositories.message_repository import MessageRepository
from src.services.embedding_service import EmbeddingService


class ChatService:
    def __init__(
        self,
        message_repo: MessageRepository,
        chunk_repo: DocumentChunkRepository,
        embedding_service: EmbeddingService,
        agent: ChatAgent,
        doc_repo: DocumentRepository,
    ):
        self.message_repo = message_repo
        self.chunk_repo = chunk_repo
        self.embedding_service = embedding_service
        self.agent = agent
        self.doc_repo = doc_repo

    async def get_chat_response(self, user: User, content: str, session_id: str) -> str:
        # 1. Load stored JSON history from DB (bytes or None)
        raw_json = await self.message_repo.get_session_messages(user.id, session_id)

        # 2. Deserialize with pydantic-ai's type adapter
        ai_history = (
            ModelMessagesTypeAdapter.validate_json(raw_json) if raw_json else []
        )

        # 3. Prepare agent dependencies
        deps = ChatDeps(
            user=user,
            chunk_repo=self.chunk_repo,
            doc_repo=self.doc_repo,
            embedding_service=self.embedding_service,
        )

        # 4. Run the agent — history_processor strips old SystemPromptParts automatically
        result = await self.agent.run(content, deps=deps, message_history=ai_history)

        # 5. Persist the full conversation JSON (upsert — replaces previous state)
        await self.message_repo.upsert_session(
            user.id, session_id, result.all_messages_json()
        )

        return str(result.output)

    async def stream_chat_response(
        self, user: User, content: str, session_id: str
    ) -> AsyncGenerator[str, None]:
        """Stream the agent response token by token and persist history afterwards."""
        # 1. Load stored history
        raw_json = await self.message_repo.get_session_messages(user.id, session_id)
        ai_history = (
            ModelMessagesTypeAdapter.validate_json(raw_json) if raw_json else []
        )

        # 2. Prepare deps
        deps = ChatDeps(
            user=user,
            chunk_repo=self.chunk_repo,
            doc_repo=self.doc_repo,
            embedding_service=self.embedding_service,
        )

        # 3. Stream the agent response
        async with self.agent.run_stream(
            content, deps=deps, message_history=ai_history
        ) as result:
            async for chunk in result.stream_text(delta=True):
                yield chunk

            # 4. Persist full conversation AFTER streaming is done
            await self.message_repo.upsert_session(
                user.id, session_id, result.all_messages_json()
            )
