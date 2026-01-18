from pydantic_ai import RunContext

from .deps import ChatDeps


async def retrieve_documents(ctx: RunContext[ChatDeps], query: str) -> str:
    """
    Busca fragmentos de documentos relevantes basados en una consulta.
    Usa esta herramienta cuando necesites información específica de los documentos del usuario.
    """
    embedding = await ctx.deps.embedding_service.generate_query_embedding(query)
    chunks = await ctx.deps.chunk_repo.search_similar(embedding, limit=5)

    if not chunks:
        return "No se encontraron documentos relevantes."

    context = "\n\n".join(
        [f"Fragmento {i + 1}:\n{chunk.content}" for i, chunk in enumerate(chunks)]
    )
    return context
