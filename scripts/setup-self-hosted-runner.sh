#!/usr/bin/env bash
#
# Registra um runner self-hosted do GitHub Actions no WSL,
# permitindo que o job de DEPLOY rode localmente e suba o container
# nesta maquina (visivel no WSL).
#
# Uso:
#   ./setup-self-hosted-runner.sh <URL_DO_REPO> <TOKEN_DO_RUNNER> [VERSAO]
#   (o token sai em: GitHub > repo > Settings > Actions > Runners > New self-hosted runner)
#
set -euo pipefail
REPO_URL="${1:?Informe a URL do repositorio, ex: https://github.com/usuario/repo}"
TOKEN="${2:?Informe o token do runner (Settings > Actions > Runners)}"

# Versao do runner: usa a informada ou busca a mais recente automaticamente
RUNNER_VERSION="${3:-$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest | grep -oP '"tag_name":\s*"v\K[^"]+')}"
echo "[runner] versao alvo: $RUNNER_VERSION"

RUNNER_DIR="$HOME/actions-runner"
mkdir -p "$RUNNER_DIR"; cd "$RUNNER_DIR"

# (re)baixa se a versao instalada for diferente
NEED_DOWNLOAD=1
if [ -f ./.runner_version ] && [ "$(cat ./.runner_version)" = "$RUNNER_VERSION" ] && [ -f ./config.sh ]; then
  NEED_DOWNLOAD=0
fi
if [ "$NEED_DOWNLOAD" = "1" ]; then
  echo "[runner] baixando runner v$RUNNER_VERSION ..."
  curl -fsSL -o runner.tar.gz \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  tar xzf runner.tar.gz
  echo "$RUNNER_VERSION" > ./.runner_version
fi

echo "[runner] configurando (labels: self-hosted,wsl) ..."
./config.sh --unattended --url "$REPO_URL" --token "$TOKEN" \
  --name "wsl-deploy-runner" --labels "wsl" --replace

echo "[runner] iniciando... (Ctrl+C para parar)"
./run.sh
