#!/usr/bin/env bash
#
# Script da DEMONSTRACAO (item 9 da atividade):
# faz uma "alteracao simples no codigo" que CORRIGE as vulnerabilidades
# de dependencias detectadas pela esteira (urllib3 / certifi / requests)
# e incrementa a versao da aplicacao.
#
# Uso:
#   ./scripts/demo-fix.sh
# Depois: git add -A && git commit -m "fix: atualiza dependencias vulneraveis" && git push
# (o push dispara a pipeline automaticamente; o novo scan sai limpo)
#
set -euo pipefail
PROJ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJ"

echo "[demo] Atualizando requirements.txt para versoes seguras..."
cat > requirements.txt <<'EOF'
# Dependencias de runtime da aplicacao TechSecure Solutions
Flask==3.0.3
gunicorn==22.0.0

# Dependencias atualizadas (correcao das CVEs detectadas na esteira):
#   urllib3 CVE-2023-43804 / certifi CVE-2023-37920 / requests PYSEC-2023-74
requests==2.32.4
urllib3==2.2.2
certifi==2024.8.30
EOF

echo "[demo] Incrementando APP_VERSION 1.0.0 -> 1.0.1..."
sed -i 's/APP_VERSION", "1.0.0"/APP_VERSION", "1.0.1"/' app/main.py
sed -i 's/APP_VERSION=1.0.0/APP_VERSION=1.0.1/' Dockerfile

echo "[demo] Pronto. Alteracoes:"
echo "  - requirements.txt: dependencias atualizadas"
echo "  - app/main.py / Dockerfile: versao 1.0.1"
echo
echo "Proximos passos (demonstracao):"
echo "  git add -A"
echo "  git commit -m 'fix: atualiza dependencias vulneraveis (v1.0.1)'"
echo "  git push        # dispara a pipeline automaticamente"
