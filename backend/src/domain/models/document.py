from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base

if TYPE_CHECKING:
    from src.domain.models.document_chunk import DocumentChunk
    from src.domain.models.user import User


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=True
    )
    filename: Mapped[str] = mapped_column(String)
    file_key: Mapped[str] = mapped_column(String, unique=True)
    size: Mapped[int] = mapped_column()
    content_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_official: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    user: Mapped[Optional["User"]] = relationship(back_populates="documents")
    chunks: Mapped[List["DocumentChunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )
