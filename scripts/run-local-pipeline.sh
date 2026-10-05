#!/usr/bin/env bash
#
# Esteira CI/CD completa executada LOCALMENTE no WSL (gera evidencias).
# Todas as etapas Python/seguranca rodam em CONTAINERS (sem depender de
# pip/venv no host). Fluxo:
#   Build -> Teste -> Security Scan -> Imagem Docker -> Deploy -> Container
#
set -uo pipefail

PROJ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJ"
IMAGE="techsecure-app"
CONTAINER="techsecure-app"
EVID="$PROJ/evidencias"
mkdir -p "$EVID"
PYIMG="python:3.12-slim"
TRIVY="aquasec/trivy:0.55.0"

line() { printf "\n\033[1;36m========== %s ==========\033[0m\n" "$1"; }
run_py() { docker run --rm -v "$PROJ":/app -w /app "$PYIMG" bash -c "$1"; }

line "0) AMBIENTE"
docker --version
echo "Projeto: $PROJ"

line "1) BUILD + 2) TESTE (pytest em container)"
run_py "pip install --no-cache-dir -q -r requirements-dev.txt && python -m pytest" | tee "$EVID/02-testes-pytest.txt"

line "3) SECURITY SCAN"
echo "-- 3a) Bandit (SAST - codigo Python) --"
run_py "pip install --no-cache-dir -q bandit && bandit -r app -f txt" | tee "$EVID/03a-bandit.txt"
echo "-- 3b) pip-audit (CVEs em dependencias) --"
run_py "pip install --no-cache-dir -q pip-audit && pip-audit -r requirements.txt" | tee "$EVID/03b-pip-audit.txt"
echo "-- 3c) Trivy (scan do filesystem) --"
docker run --rm -v "$PROJ":/src -w /src "$TRIVY" fs --scanners vuln --severity HIGH,CRITICAL . | tee "$EVID/03c-trivy-fs.txt"

line "4) BUILD DA IMAGEM DOCKER"
docker build -t "$IMAGE:latest" . | tee "$EVID/04-docker-build.txt"
docker images "$IMAGE" | tee -a "$EVID/04-docker-build.txt"

line "4b) SCAN DA IMAGEM (Trivy)"
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock "$TRIVY" image --scanners vuln --severity HIGH,CRITICAL "$IMAGE:latest" | tee "$EVID/04b-trivy-image.txt"

line "5) DEPLOY AUTOMATICO (container)"
docker rm -f "$CONTAINER" 2>/dev/null || true
docker run -d --name "$CONTAINER" -p 8080:8080 --restart unless-stopped "$IMAGE:latest"
sleep 5
docker ps --filter "name=$CONTAINER" | tee "$EVID/05-docker-ps.txt"

line "6) APLICACAO FUNCIONANDO"
echo "GET /health:"
curl -fsS http://localhost:8080/health | tee "$EVID/06-app-health.txt"; echo
echo "GET /api/version:"
curl -fsS http://localhost:8080/api/version | tee "$EVID/06-app-version.txt"; echo
echo "GET /api/soma?a=2&b=3:"
curl -fsS "http://localhost:8080/api/soma?a=2&b=3" | tee "$EVID/06-app-soma.txt"; echo

line "ESTEIRA CONCLUIDA"
echo "Evidencias em: $EVID"
