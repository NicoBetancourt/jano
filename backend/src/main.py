from contextlib import asynccontextmanager

import logfire
from fastapi import FastAPI

from src.api.routes import auth, chat, documents
from src.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


logfire.configure(token=settings.LOGFIRE_TOKEN)
logfire.info("Hello, {place}!", place="Nico")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(
    documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"]
)
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])


@app.get("/")
def root():
    return {"message": "Welcome to Document Management API"}
