from pydantic_ai import Agent, RunContext
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from src.core.config import settings

from .deps import ChatDeps
from .prompt import build_system_prompt
from .tools import retrieve_documents


class ChatAgent:
    def __init__(self):
        self.provider = GoogleProvider(api_key=settings.GOOGLE_API_KEY)
        self.agent = Agent(
            GoogleModel(provider=self.provider, model_name=settings.MODEL_NAME),
            deps_type=ChatDeps,
        )
        self.agent.tool(retrieve_documents)

        @self.agent.system_prompt
        def get_system_prompt(ctx: RunContext[ChatDeps]) -> str:
            return build_system_prompt(ctx)

    async def run(self, prompt: str, deps: ChatDeps, message_history: list = []):
        return await self.agent.run(prompt, deps=deps, message_history=message_history)
