from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from src.api.dependencies import get_auth_service
from src.core.security import create_access_token
from src.domain.schemas.token import Token
from src.domain.schemas.user import UserCreate, UserResponse
from src.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate, auth_service: AuthService = Depends(get_auth_service)
):
    try:
        user = await auth_service.register_user(user_in)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}
