from google import genai
from google.genai import types

from src.core.config import settings


class EmbeddingService:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is not set")
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.model = "gemini-embedding-001"

    def split_text(
        self, text: str, chunk_size: int = 1000, overlap: int = 200
    ) -> list[str]:
        """
        Simple text splitter with overlap.
        For production, a more robust tokenizer-aware splitter is recommended,
        but this serves the purpose without heavy dependencies like langchain.
        """
        if not text:
            return []

        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunks.append(text[start:end])
            if end == text_len:
                break
            start += chunk_size - overlap

        return chunks

    async def generate_embeddings(
        self, texts: list[str], dimensions: int = 2000
    ) -> list[list[float]]:
        results = []
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            response = self.client.models.embed_content(
                model=self.model,
                contents=batch,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT", output_dimensionality=dimensions
                ),
            )
            if response.embeddings:
                results.extend([e.values for e in response.embeddings if e.values])

        return results

    async def generate_query_embedding(
        self, text: str, dimensions: int = 2000
    ) -> list[float]:
        response = self.client.models.embed_content(
            model=self.model,
            contents=[text],
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY", output_dimensionality=dimensions
            ),
        )
        if not response.embeddings or not response.embeddings[0].values:
            raise ValueError("Failed to generate embedding")
        return response.embeddings[0].values
