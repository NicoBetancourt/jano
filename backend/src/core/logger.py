import logging

import logfire
from fastapi import FastAPI
from src.core.config import settings


def setup_logging(app: FastAPI) -> None:
    # Configure logfire integration and instrumentations
    level = getattr(logging, settings.LOGFIRE_LEVEL, logging.INFO)
    logfire.configure(
        send_to_logfire=settings.LOGFIRE_SEND, token=settings.LOGFIRE_TOKEN
    )
    logging.basicConfig(handlers=[logfire.LogfireLoggingHandler()], level=level)
    if settings.LOGFIRE_PYDANTIC:
        logfire.instrument_pydantic_ai()

    if settings.LOGFIRE_FASTAPI:
        logfire.instrument_fastapi(app)

    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(logger_name)
        logger.handlers.clear()
        logger.propagate = True
