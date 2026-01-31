from src.domain.models.user import User, UserRole
from src.domain.schemas.user import UserResponse
from src.repositories.user_repository import UserRepository


class UserService:
    """
    Servicio de lógica de negocio para gestión de usuarios.
    Consume el UserRepository para operaciones de base de datos.
    """

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Obtiene un usuario por su email.

        Args:
            email: Email del usuario a buscar

        Returns:
            User | None: Usuario encontrado o None si no existe
        """
        return await self.user_repo.get_by_email(email)

    async def get_user_response_by_email(self, email: str) -> UserResponse | None:
        """
        Obtiene un usuario por su email y lo convierte a UserResponse.

        Args:
            email: Email del usuario a buscar

        Returns:
            UserResponse | None: Schema de respuesta del usuario o None
        """
        user = await self.user_repo.get_by_email(email)
        if not user:
            return None
        return UserResponse.model_validate(user)

    async def create_user(self, user: User) -> User:
        """
        Crea un nuevo usuario en la base de datos.

        Args:
            user: Modelo de usuario a crear

        Returns:
            User: Usuario creado con ID asignado
        """
        return await self.user_repo.create(user)

    async def is_user_active(self, email: str) -> bool:
        """
        Verifica si un usuario está activo.

        Args:
            email: Email del usuario

        Returns:
            bool: True si el usuario existe y está activo, False en caso contrario
        """
        user = await self.user_repo.get_by_email(email)
        return user.is_active if user else False

    async def is_user_admin(self, email: str) -> bool:
        """
        Verifica si un usuario tiene rol de administrador.

        Args:
            email: Email del usuario

        Returns:
            bool: True si el usuario existe y es admin, False en caso contrario
        """
        user = await self.user_repo.get_by_email(email)
        return user.role == UserRole.ADMIN if user else False

    async def user_exists(self, email: str) -> bool:
        """
        Verifica si un usuario existe en la base de datos.

        Args:
            email: Email del usuario

        Returns:
            bool: True si el usuario existe, False en caso contrario
        """
        user = await self.user_repo.get_by_email(email)
        return user is not None
