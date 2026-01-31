from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Document Management API"
    API_V1_STR: str = "/api"

    # DATABASE
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/chat_migracion"
    )

    # SECURITY
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # STORAGE (S3/MinIO)
    ENVIRONMENT: str = "dev"
    AWS_ACCESS_KEY_ID: str = "minioadmin"
    AWS_SECRET_ACCESS_KEY: str = "minioadmin"
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "documents"
    AWS_ENDPOINT_URL: Optional[str] = "http://localhost:9000"

    # FOLDERS
    S3_DOCS_FOLDER: str = "documents"
    S3_BOE_FOLDER: str = "boe"

    # AI / RAG
    MODEL_NAME: str = "gemini-3-flash-preview"
    GOOGLE_API_KEY: str = Field(default=...)
    LOGFIRE_TOKEN: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
