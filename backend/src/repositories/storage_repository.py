from typing import BinaryIO

import aioboto3

from src.core.config import settings


class StorageRepository:
    def __init__(self):
        self.session = aioboto3.Session()
        self.config = {
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
            "region_name": settings.AWS_REGION,
            "endpoint_url": settings.AWS_ENDPOINT_URL,
        }
        self.bucket = settings.S3_BUCKET_NAME
        self._initialized = False

    async def _ensure_bucket(self, s3_client):
        """Ensure the bucket exists, especially useful for local MinIO."""
        if self._initialized:
            return

        try:
            await s3_client.head_bucket(Bucket=self.bucket)
        except Exception:
            if settings.ENVIRONMENT == "dev":
                await s3_client.create_bucket(Bucket=self.bucket)
            else:
                raise
        self._initialized = True

    async def upload(self, file_obj: BinaryIO, key: str) -> None:
        async with self.session.client("s3", **self.config) as s3:
            await self._ensure_bucket(s3)
            await s3.upload_fileobj(file_obj, self.bucket, key)

    async def delete(self, key: str) -> None:
        async with self.session.client("s3", **self.config) as s3:
            await s3.delete_object(Bucket=self.bucket, Key=key)

    async def get_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        async with self.session.client("s3", **self.config) as s3:
            return await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
