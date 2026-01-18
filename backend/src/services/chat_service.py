from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, UserPromptPart

from src.agents.chat_agent.agent import ChatAgent
from src.agents.chat_agent.deps import ChatDeps
from src.domain.models.message import Message, MessageRole
from src.domain.models.user import User
from src.repositories.document_chunk_repository import DocumentChunkRepository
from src.repositories.message_repository import MessageRepository
from src.services.embedding_service import EmbeddingService


class ChatService:
    def __init__(
        self,
        message_repo: MessageRepository,
        chunk_repo: DocumentChunkRepository,
        embedding_service: EmbeddingService,
        agent: ChatAgent,
    ):
        self.message_repo = message_repo
        self.chunk_repo = chunk_repo
        self.embedding_service = embedding_service
        self.agent = agent

    async def get_chat_response(self, user: User, content: str) -> str:
        # 1. Get history from DB
        history = await self.message_repo.get_by_user(user.id)

        # 2. Convert to Pydantic AI message history format
        # Note: This is a simplified conversion. Pydantic AI expects specific types.
        ai_history = []
        for msg in history:
            if msg.role == MessageRole.USER:
                ai_history.append(
                    ModelRequest(parts=[UserPromptPart(content=msg.content)])
                )
            else:
                ai_history.append(ModelResponse(parts=[TextPart(content=msg.content)]))

        # 3. Prepare Deps
        deps = ChatDeps(
            user=user,
            chunk_repo=self.chunk_repo,
            embedding_service=self.embedding_service,
        )

        # 4. Run Agent
        result = await self.agent.run(content, deps=deps, message_history=ai_history)

        # 5. Save messages to DB
        user_msg = Message(user_id=user.id, role=MessageRole.USER, content=content)
        model_msg = Message(
            user_id=user.id, role=MessageRole.MODEL, content=result.response
        )

        await self.message_repo.create(user_msg)
        await self.message_repo.create(model_msg)

        return str(result.response)
