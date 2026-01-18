from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from src.api.dependencies import (
    get_boe_document_service,
    get_current_active_user,
    get_document_service,
)
from src.domain.models.user import User
from src.domain.schemas.document import DocumentResponse
from src.services.boe_document_service import BoeDocumentService
from src.services.document_service import DocumentService

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    is_boe: bool = False,
    current_user: User = Depends(get_current_active_user),
    service: DocumentService = Depends(get_document_service),
    boe_service: BoeDocumentService = Depends(get_boe_document_service),
):
    if is_boe:
        return await boe_service.upload_document(current_user, file)
    return await service.upload_document(current_user, file)


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_active_user),
    service: DocumentService = Depends(get_document_service),
):
    return await service.get_documents(current_user)


@router.get("/{doc_id}")
async def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_active_user),
    service: DocumentService = Depends(get_document_service),
):
    doc, url = await service.get_document(current_user, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {"metadata": DocumentResponse.model_validate(doc), "download_url": url}


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_active_user),
    service: DocumentService = Depends(get_document_service),
):
    try:
        await service.delete_document(current_user, doc_id)
        return {"ok": True}
    except PermissionError:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this document"
        )
