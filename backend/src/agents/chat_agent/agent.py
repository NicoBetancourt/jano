from pydantic_ai import Agent, RunContext
from pydantic_ai.messages import ModelMessage, ModelRequest, SystemPromptPart
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from src.core.config import settings

from .deps import ChatDeps
from .prompt import build_system_prompt
from .tools import search_official_document, search_user_documents


def strip_system_prompt(messages: list[ModelMessage]) -> list[ModelMessage]:
    """Remove SystemPromptParts from stored history.

    The system prompt is rebuilt dynamically on each run, so we must strip
    any previously stored system prompt parts to avoid duplicates / stale data.
    """
    cleaned: list[ModelMessage] = []
    for msg in messages:
        if isinstance(msg, ModelRequest):
            filtered_parts = [
                p for p in msg.parts if not isinstance(p, SystemPromptPart)
            ]
            if filtered_parts:
                cleaned.append(ModelRequest(parts=filtered_parts))
        else:
            cleaned.append(msg)
    return cleaned


class ChatAgent:
    def __init__(self):
        self.provider = GoogleProvider(api_key=settings.GOOGLE_API_KEY)
        self.agent = Agent(
            GoogleModel(provider=self.provider, model_name=settings.MODEL_NAME),
            deps_type=ChatDeps,
            history_processors=[strip_system_prompt],
        )
        self.agent.tool(search_official_document)
        self.agent.tool(search_user_documents)

        @self.agent.system_prompt
        async def get_system_prompt(ctx: RunContext[ChatDeps]) -> str:
            return await build_system_prompt(ctx)

    async def run(self, prompt: str, deps: ChatDeps, message_history: list = []):
        return await self.agent.run(prompt, deps=deps, message_history=message_history)
