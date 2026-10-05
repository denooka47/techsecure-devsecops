# syntax=docker/dockerfile:1
# ---- Imagem base enxuta ----
FROM python:3.12-slim

# Boas praticas DevSecOps:
# - nao rodar como root
# - nao gravar .pyc / buffer de stdout
# - instalar apenas o necessario
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_VERSION=1.0.0 \
    PORT=8080

WORKDIR /app

# Instala dependencias primeiro (cache de camada)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o codigo da aplicacao
COPY app ./app

# Cria usuario sem privilegios e ajusta permissoes
RUN useradd --create-home --uid 10001 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

# Healthcheck do container
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0) if urllib.request.urlopen(\"http://127.0.0.1:8080/health\").getcode()==200 else sys.exit(1)"

# Servidor de producao (gunicorn) servindo o objeto app:app
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "app.main:app"]
