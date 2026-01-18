from dataclasses import dataclass

from src.domain.models.user import User
from src.repositories.document_chunk_repository import DocumentChunkRepository
from src.services.embedding_service import EmbeddingService


@dataclass
class ChatDeps:
    user: User
    chunk_repo: DocumentChunkRepository
    embedding_service: EmbeddingService
