#!/bin/sh
set -e

echo "=== Environment Configuration ==="
echo "POSTGRES_USER: $POSTGRES_USER"
echo "POSTGRES_HOST: $POSTGRES_HOST"
echo "DATABASE_URL: $DATABASE_URL"
echo "================================="

echo "Running database migrations..."
python -m alembic upgrade head

echo "Starting FastAPI server..."
exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
