from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.models.document_chunk import DocumentChunk


class DocumentChunkRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_many(self, chunks: list[DocumentChunk]) -> list[DocumentChunk]:
        self.session.add_all(chunks)
        await self.session.commit()
        for chunk in chunks:
            await self.session.refresh(chunk)
        return chunks

    async def get_by_document_id(self, document_id: int) -> list[DocumentChunk]:
        stmt = (
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_similar(
        self, embedding: list[float], limit: int = 5
    ) -> list[DocumentChunk]:
        # Using pgvector cosine distance operator <->
        stmt = (
            select(DocumentChunk)
            .order_by(DocumentChunk.embedding.cosine_distance(embedding))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_similar_by_document_id(
        self, embedding: list[float], document_id: int, limit: int = 5
    ) -> list[DocumentChunk]:
        stmt = (
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.embedding.cosine_distance(embedding))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_similar_by_user(
        self, embedding: list[float], user_id: int, limit: int = 5
    ) -> list[DocumentChunk]:
        from src.domain.models.document import Document

        stmt = (
            select(DocumentChunk)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(Document.user_id == user_id, Document.is_official == False)
            .order_by(DocumentChunk.embedding.cosine_distance(embedding))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
