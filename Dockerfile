# syntax=docker/dockerfile:1

# Etapa 1: Compilación del Frontend (React + Vite)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# Etapa 2: Entorno de Producción Python (FastAPI + Scikit-Learn + spaCy)
FROM python:3.13-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Instalar dependencias del sistema mínimas necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Descargar modelo de spaCy para lematización en español
RUN python -m spacy download es_core_news_sm

# Copiar código fuente del proyecto
COPY src/ ./src/
COPY api/ ./api/
COPY models/ ./models/
COPY data/ ./data/
COPY run.py ./

# Copiar bundle compilado del frontend desde la etapa 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Exponer puerto de la API y aplicación web
EXPOSE 8000

# Healthcheck para verificar disponibilidad del servicio
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Comando de arranque del servidor
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]

