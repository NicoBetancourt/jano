from pydantic_ai import RunContext

from .deps import ChatDeps


def _format_chunk(i: int, filename: str, chunk) -> str:
    """Formatea un fragmento con su referencia de fuente."""
    page_ref = f", Página {chunk.page_number}" if chunk.page_number is not None else ""
    header = f"[Fuente: {filename}{page_ref}]"
    return f"Fragmento {i + 1} {header}:\n{chunk.content}"


async def search_official_document(
    ctx: RunContext[ChatDeps], document_id: int, query: str
) -> str:
    """
    Busca fragmentos relevantes en un documento oficial específico.
    Usa esta herramienta cuando necesites información de un documento oficial proveído en el contexto.
    Debes pasar el ID numérico del documento (el número entre corchetes en la lista de documentos del contexto).
    """
    doc = await ctx.deps.doc_repo.get_by_id(document_id)
    if not doc or not doc.is_official:
        return f"No se encontró el documento oficial con ID '{document_id}'."

    embedding = await ctx.deps.embedding_service.generate_query_embedding(query)
    chunks = await ctx.deps.chunk_repo.search_similar_by_document_id(
        embedding, doc.id, limit=5
    )

    if not chunks:
        return f"No se encontró información relevante en el documento '{doc.filename}' (ID: {document_id})."

    context = "\n\n".join(
        [_format_chunk(i, doc.filename, chunk) for i, chunk in enumerate(chunks)]
    )
    return context


async def search_user_documents(ctx: RunContext[ChatDeps], query: str) -> str:
    """
    Busca fragmentos relevantes en los documentos propios del usuario.
    Usa esta herramienta cuando el usuario pregunte por sus propios documentos o información personal que ha subido.
    """
    embedding = await ctx.deps.embedding_service.generate_query_embedding(query)
    chunks = await ctx.deps.chunk_repo.search_similar_by_user(
        embedding, ctx.deps.user.id, limit=5
    )

    if not chunks:
        return "No se encontraron documentos relevantes en tus archivos."

    # Precargamos los documentos para tener el filename de cada chunk
    doc_cache: dict[int, str] = {}
    formatted: list[str] = []
    for i, chunk in enumerate(chunks):
        if chunk.document_id not in doc_cache:
            doc = await ctx.deps.doc_repo.get_by_id(chunk.document_id)
            doc_cache[chunk.document_id] = (
                doc.filename if doc else "Documento desconocido"
            )
        filename = doc_cache[chunk.document_id]
        formatted.append(_format_chunk(i, filename, chunk))

    return "\n\n".join(formatted)
