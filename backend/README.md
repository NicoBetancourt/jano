# Document Management System API

This is a **FastAPI** based backend for managing documents. It supports uploading files to S3 (MinIO compatible), storing metadata in a SQL database (PostgreSQL/SQLite via Turso), and includes a robust authentication system.

## Features

- **Authentication**: User registration and login with JWT.
- **Role-Based Access Control**:
  - `user`: Can manage their own documents.
  - `admin`: Full access to all documents.
  - `boe`: Read-only access to all documents (simulating BOE access).
- **Document Management**:
  - Upload files to S3/MinIO.
  - Metadata stored in SQL database.
  - Secure download links (Presigned URLs).
- **Architecture**: Clean Architecture principles (Domain, Repositories, Services, API).

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLAlchemy (Async) with Alembic for migrations.
- **Storage**: S3 (via `aioboto3`).
- **Dependency Management**: `uv` (Astral).
- **Containerization**: Docker & Docker Compose.

## Getting Started

### Prerequisites

- [uv](https://github.com/astral-sh/uv) installed.
- Docker (for MinIO).
- Python 3.12+.

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd chat-migracion/backend
    ```

2.  **Install Dependencies**:
    ```bash
    uv sync
    ```

3.  **Start MinIO (Required for S3)**:
    ```bash
    docker-compose up -d minio
    ```

4.  **Run the API**:
    ```bash
    uv run uvicorn src.main:app --reload
    ```
    The API will be available at [http://localhost:8000](http://localhost:8000).

### API Documentation

Once the server is running, you can access the interactive API documentation (Swagger UI) at:
[http://localhost:8000/docs](http://localhost:8000/docs)

### Database Migrations

The project uses Alembic for database migrations.
```bash
# Apply migrations
uv run alembic upgrade head

# Create a new migration (after modifying models)
uv run alembic revision --autogenerate -m "Message"
```

## Deployment with Docker

To run the full stack (API + MinIO) using Docker Compose:

```bash
docker-compose up -d
```

## Project Structure

```text
src/
├── api/             # API Routes & Dependencies
├── core/            # Config, DB, Security
├── domain/          # Pydantic Schemas & SQLAlchemy Models
├── repositories/    # Data Access Layer
└── services/        # Business Logic
```
