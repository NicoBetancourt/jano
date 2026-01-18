from src.core.security import get_password_hash, verify_password
from src.domain.models.user import User
from src.domain.schemas.user import UserCreate
from src.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, user_in: UserCreate) -> User:
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise ValueError("User already exists")

        hashed_pw = get_password_hash(user_in.password)
        user = User(email=user_in.email, hashed_password=hashed_pw)
        return await self.user_repo.create(user)

    async def authenticate_user(self, email: str, password: str) -> User | None:
        user = await self.user_repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
