#!/usr/bin/env bash
# Deploy/atualizacao do container da aplicacao TechSecure.
set -euo pipefail
IMAGE="${1:-techsecure-app:latest}"
CONTAINER="techsecure-app"
echo "[deploy] removendo container antigo (se existir)..."
docker rm -f "$CONTAINER" 2>/dev/null || true
echo "[deploy] subindo novo container a partir de $IMAGE ..."
docker run -d --name "$CONTAINER" -p 8080:8080 --restart unless-stopped "$IMAGE"
sleep 5
echo "[deploy] status:"
docker ps --filter "name=$CONTAINER"
echo "[deploy] healthcheck:"
curl -fsS http://localhost:8080/health && echo " -> OK"
