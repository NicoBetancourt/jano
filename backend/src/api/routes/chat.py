from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from src.api.dependencies import (
    get_chat_service,
    get_current_active_user,
    get_message_repository,
)
from src.domain.models.user import User
from src.repositories.message_repository import MessageRepository
from src.services.chat_service import ChatService

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class SessionResponse(BaseModel):
    session_id: str
    last_message: str
    timestamp: str
    role: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: str


@router.post("/message", response_model=ChatResponse)
async def chat_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    service: ChatService = Depends(get_chat_service),
):
    # Generate session_id if not provided
    session_id = request.session_id or str(uuid4())

    response = await service.get_chat_response(
        current_user, request.message, session_id
    )
    return ChatResponse(response=response, session_id=session_id)


@router.get("/sessions", response_model=list[SessionResponse])
async def get_sessions(
    current_user: User = Depends(get_current_active_user),
    message_repo: MessageRepository = Depends(get_message_repository),
):
    """Get all chat sessions for the current user."""
    sessions = await message_repo.get_sessions_by_user(current_user.id)
    return sessions


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    message_repo: MessageRepository = Depends(get_message_repository),
):
    """Get all messages for a specific session."""
    messages = await message_repo.get_by_session(current_user.id, session_id)
    return [
        MessageResponse(
            id=msg.id,
            role=msg.role.value,
            content=msg.content,
            created_at=msg.created_at.isoformat(),
        )
        for msg in messages
    ]


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    message_repo: MessageRepository = Depends(get_message_repository),
):
    """Delete a specific chat session."""
    await message_repo.delete_by_session(current_user.id, session_id)
    return {"status": "success"}
