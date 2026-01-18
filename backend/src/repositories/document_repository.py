from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.models.document import Document


class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, document: Document) -> Document:
        self.session.add(document)
        await self.session.commit()
        await self.session.refresh(document)
        return document

    async def get_by_id(self, doc_id: int) -> Document | None:
        stmt = select(Document).where(Document.id == doc_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> list[Document]:
        stmt = select(Document).where(Document.user_id == user_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_all(self) -> list[Document]:
        stmt = select(Document)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def delete(self, doc_id: int) -> None:
        stmt = delete(Document).where(Document.id == doc_id)
        await self.session.execute(stmt)
        await self.session.commit()
