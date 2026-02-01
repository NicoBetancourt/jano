# Primera fase: Construcción del entorno virtual con UV
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /venv

RUN apt-get update && apt-get install -y libpq-dev gcc && apt-get clean

# Copiar archivos antes de instalar dependencias
COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

# Segunda fase: Imagen final sin UV
FROM python:3.13-slim-bookworm

# Crear un usuario sin privilegios primero
RUN useradd -m app_user

# Copiar el entorno virtual y dar permisos al usuario app_user
COPY --from=builder --chown=app_user:app_user /venv /venv

# Configurar el PATH para usar el entorno virtual
ENV PATH="/venv/.venv/bin:$PATH"
WORKDIR /app

# Copiar el código de la aplicación como app_user
COPY --chown=app_user:app_user . .

# Copiar y configurar el script de entrada
COPY --chown=app_user:app_user docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Cambiar a usuario sin privilegios
USER app_user

ENV PORT=8000
EXPOSE ${PORT}

# Usar el script de entrada que ejecuta migraciones y luego inicia el servidor
ENTRYPOINT ["/docker-entrypoint.sh"]
