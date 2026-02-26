import io
import uuid

from fastapi import UploadFile
from src.core.config import settings
from src.domain.models.document import Document
from src.domain.models.user import User
from src.services.document_service import DocumentService


class OfficialDocumentService(DocumentService):
    async def upload_document(self, user: User, file: UploadFile) -> Document:
        file_key = f"{settings.S3_OFFICIAL_FOLDER}/{uuid.uuid4()}-{file.filename}"

        content = await file.read()
        file_obj = io.BytesIO(content)
        size = len(content)

        await self.storage_service.upload_file(file_obj, file_key)

        doc = Document(
            user_id=None,
            is_official=True,
            filename=file.filename,
            file_key=file_key,
            size=size,
            content_type=file.content_type,
        )
        created_doc = await self.doc_repo.create(doc)

        await self._process_embeddings(created_doc, content, file.content_type or "")

        return created_doc
