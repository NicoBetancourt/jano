from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from src.agents.chat_agent.agent import ChatAgent
from src.core.config import settings
from src.core.database import get_db_session
from src.domain.models.user import User
from src.domain.schemas.token import TokenData
from src.repositories.document_chunk_repository import DocumentChunkRepository
from src.repositories.document_repository import DocumentRepository
from src.repositories.message_repository import MessageRepository
from src.repositories.storage_repository import StorageRepository
from src.repositories.user_repository import UserRepository
from src.services.auth_service import AuthService
from src.services.boe_document_service import BoeDocumentService
from src.services.chat_service import ChatService
from src.services.document_service import DocumentService
from src.services.embedding_service import EmbeddingService
from src.services.storage_service import StorageService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


# Repositories
async def get_user_repository(
    session: AsyncSession = Depends(get_db_session),
) -> UserRepository:
    return UserRepository(session)


async def get_document_repository(
    session: AsyncSession = Depends(get_db_session),
) -> DocumentRepository:
    return DocumentRepository(session)


async def get_document_chunk_repository(
    session: AsyncSession = Depends(get_db_session),
) -> DocumentChunkRepository:
    return DocumentChunkRepository(session)


async def get_storage_repository() -> StorageRepository:
    return StorageRepository()


async def get_message_repository(
    session: AsyncSession = Depends(get_db_session),
) -> MessageRepository:
    return MessageRepository(session)


# Services
async def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repo)


async def get_storage_service(
    repo: StorageRepository = Depends(get_storage_repository),
) -> StorageService:
    return StorageService(repo)


async def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()


async def get_document_service(
    doc_repo: DocumentRepository = Depends(get_document_repository),
    chunk_repo: DocumentChunkRepository = Depends(get_document_chunk_repository),
    storage_service: StorageService = Depends(get_storage_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
) -> DocumentService:
    return DocumentService(doc_repo, chunk_repo, storage_service, embedding_service)


async def get_boe_document_service(
    doc_repo: DocumentRepository = Depends(get_document_repository),
    chunk_repo: DocumentChunkRepository = Depends(get_document_chunk_repository),
    storage_service: StorageService = Depends(get_storage_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
) -> BoeDocumentService:
    return BoeDocumentService(doc_repo, chunk_repo, storage_service, embedding_service)


async def get_chat_agent() -> ChatAgent:
    return ChatAgent()


async def get_chat_service(
    message_repo: MessageRepository = Depends(get_message_repository),
    chunk_repo: DocumentChunkRepository = Depends(get_document_chunk_repository),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    agent: ChatAgent = Depends(get_chat_agent),
) -> ChatService:
    return ChatService(message_repo, chunk_repo, embedding_service, agent)


# Current User
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_repo: UserRepository = Depends(get_user_repository),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub", "")
        if email == "":
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = await user_repo.get_by_email(email=token_data.email or email)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user
