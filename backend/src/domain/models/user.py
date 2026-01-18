import enum
from typing import TYPE_CHECKING, List

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

if TYPE_CHECKING:
    from src.domain.models.document import Document


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    BOE = "boe"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False), default=UserRole.USER
    )
    is_active: Mapped[bool] = mapped_column(default=True)

    documents: Mapped[List["Document"]] = relationship(back_populates="user")
