from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.api.dependencies import get_chat_service, get_current_active_user
from src.domain.models.user import User
from src.services.chat_service import ChatService

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("/message", response_model=ChatResponse)
async def chat_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    service: ChatService = Depends(get_chat_service),
):
    response = await service.get_chat_response(current_user, request.message)
    return ChatResponse(response=response)
