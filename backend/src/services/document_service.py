import uuid

import fitz
from fastapi import UploadFile
from src.core.config import settings
from src.domain.models.document import Document
from src.domain.models.document_chunk import DocumentChunk
from src.domain.models.user import User, UserRole
from src.repositories.document_chunk_repository import DocumentChunkRepository
from src.repositories.document_repository import DocumentRepository
from src.services.embedding_service import EmbeddingService
from src.services.storage_service import StorageService


class DocumentService:
    def __init__(
        self,
        doc_repo: DocumentRepository,
        chunk_repo: DocumentChunkRepository,
        storage_service: StorageService,
        embedding_service: EmbeddingService,
    ):
        self.doc_repo = doc_repo
        self.chunk_repo = chunk_repo
        self.storage_service = storage_service
        self.embedding_service = embedding_service

    async def upload_document(self, user: User, file: UploadFile) -> Document:
        file_key = f"{settings.S3_DOCS_FOLDER}/{user.id}/{uuid.uuid4()}-{file.filename}"

        content = await file.read()
        import io

        file_obj = io.BytesIO(content)
        size = len(content)

        await self.storage_service.upload_file(file_obj, file_key)

        doc = Document(
            user_id=user.id,
            filename=file.filename,
            file_key=file_key,
            size=size,
            content_type=file.content_type,
        )
        created_doc = await self.doc_repo.create(doc)

        await self._process_embeddings(created_doc, content, file.content_type or "")

        return created_doc

    async def _process_embeddings(
        self, doc: Document, content: bytes, content_type: str
    ):
        is_text = content_type and "text" in content_type
        is_pdf = content_type == "application/pdf"

        if not (is_text or is_pdf):
            return

        try:
            doc_chunks: list[DocumentChunk] = []

            if is_pdf:
                # Extrae texto página a página para preservar el número de página
                doc_pdf = fitz.open(stream=content, filetype="pdf")
                page_texts: list[tuple[str, int]] = []  # (texto, page_number 1-indexed)
                for page in doc_pdf:
                    text = page.get_text()
                    if text.strip():
                        page_texts.append((text, page.number + 1))
                doc_pdf.close()

                chunk_index = 0
                for page_text, page_num in page_texts:
                    chunks = self.embedding_service.split_text(page_text)
                    if not chunks:
                        continue
                    embeddings = await self.embedding_service.generate_embeddings(
                        chunks
                    )
                    for chunk_text, emb in zip(chunks, embeddings):
                        doc_chunks.append(
                            DocumentChunk(
                                document_id=doc.id,
                                chunk_index=chunk_index,
                                page_number=page_num,
                                content=chunk_text,
                                embedding=emb,
                            )
                        )
                        chunk_index += 1

            elif is_text:
                text_content = content.decode("utf-8")
                chunks = self.embedding_service.split_text(text_content)
                if chunks:
                    embeddings = await self.embedding_service.generate_embeddings(
                        chunks
                    )
                    for i, (chunk_text, emb) in enumerate(zip(chunks, embeddings)):
                        doc_chunks.append(
                            DocumentChunk(
                                document_id=doc.id,
                                chunk_index=i,
                                page_number=None,
                                content=chunk_text,
                                embedding=emb,
                            )
                        )

            if doc_chunks:
                await self.chunk_repo.create_many(doc_chunks)

        except Exception as e:
            print(f"Error generating embeddings: {e}")

    async def get_documents(self, user: User) -> list[Document]:
        if user.role in [UserRole.ADMIN, UserRole.OFFICIAL]:
            return await self.doc_repo.list_all()

        my_docs = await self.doc_repo.list_by_user_only(user.id)
        official_docs = await self.doc_repo.list_official()
        return official_docs + my_docs

    async def get_document(self, user: User, doc_id: int):
        doc = await self.doc_repo.get_by_id(doc_id)
        if not doc:
            return None, None

        if (
            not doc.is_official
            and user.role not in [UserRole.ADMIN, UserRole.OFFICIAL]
            and doc.user_id != user.id
        ):
            return None, None

        url = await self.storage_service.get_presigned_url(doc.file_key)
        return doc, url

    async def delete_document(self, user: User, doc_id: int):
        doc = await self.doc_repo.get_by_id(doc_id)
        if not doc:
            return

        if doc.is_official and user.role not in [UserRole.ADMIN, UserRole.OFFICIAL]:
            raise PermissionError("Not allowed")

        if (
            not doc.is_official
            and user.role != UserRole.ADMIN
            and doc.user_id != user.id
        ):
            raise PermissionError("Not allowed")

        await self.storage_service.delete_file(doc.file_key)
        await self.doc_repo.delete(doc_id)
