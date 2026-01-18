from datetime import datetime

from pydantic import BaseModel


class DocumentCreate(BaseModel):
    pass  # Usually created from UploadFile, no json body needed


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    size: int
    content_type: str | None
    created_at: datetime
    # We might generate a presigned url as well, but that's dynamic

    class Config:
        from_attributes = True
