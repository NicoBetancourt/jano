from typing import BinaryIO

from src.repositories.storage_repository import StorageRepository


class StorageService:
    def __init__(self, repo: StorageRepository):
        self.repo = repo

    async def upload_file(self, file_obj: BinaryIO, key: str) -> None:
        await self.repo.upload(file_obj, key)

    async def delete_file(self, key: str) -> None:
        await self.repo.delete(key)

    async def get_presigned_url(self, key: str) -> str:
        return await self.repo.get_presigned_url(key)
