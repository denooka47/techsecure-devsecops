# TechSecure Solutions - POC de Esteira CI/CD com DevSecOps

Prova de conceito de uma esteira CI/CD automatizada com segurança integrada,
para a empresa fictícia **TechSecure Solutions**.

## Fluxo da esteira

```
Código → Build → Teste → Análise de Segurança → Imagem Docker → Deploy Automático → Container
```

## Aplicação

Aplicação web simples em **Python + Flask**, servida em produção por **gunicorn**,
empacotada em container Docker.

| Endpoint          | Descrição                                   |
|-------------------|---------------------------------------------|
| `GET /`           | Página HTML institucional                   |
| `GET /health`     | Healthcheck (usado pelo container/deploy)   |
| `GET /api/version`| Versão da aplicação e das libs              |
| `GET /api/soma`   | Ex.: `/api/soma?a=2&b=3` (lógica testada)   |

## Tecnologias

- **Versionamento:** Git + GitHub
- **CI/CD:** GitHub Actions (`.github/workflows/cicd.yml`)
- **Container:** Docker (imagem `python:3.12-slim`, usuário não-root)
- **Testes:** pytest
- **Segurança:**
  - **Bandit** — SAST (análise estática do código Python)
  - **pip-audit** — CVEs nas dependências
  - **Trivy** — scan de filesystem e da imagem Docker

## Estrutura

```
techsecure-devsecops/
├── app/                      # aplicação Flask
│   ├── main.py
│   └── templates/index.html
├── tests/test_app.py         # testes automatizados (pytest)
├── requirements.txt          # dependências de runtime
├── requirements-dev.txt      # dependências de teste/segurança
├── Dockerfile                # imagem do container
├── .dockerignore
├── .github/workflows/cicd.yml# pipeline CI/CD (GitHub Actions)
└── scripts/
    ├── run-local-pipeline.sh # roda a esteira inteira no WSL (relatórios em reports/)
    ├── deploy.sh             # deploy/atualização do container
    └── setup-self-hosted-runner.sh # runner self-hosted p/ deploy no WSL
```

## Como executar localmente (WSL + Docker)

```bash
# roda build + teste + security scan + imagem + deploy + container
./scripts/run-local-pipeline.sh

# aplicação disponível em:
curl http://localhost:8080/health
# abrir no navegador: http://localhost:8080
```

## Pipeline CI/CD (GitHub Actions)

Dispara **automaticamente** a cada `push` na branch `main`. Jobs:

1. **build-test** — instala dependências e roda `pytest`.
2. **security** — Bandit + pip-audit + Trivy (filesystem); publica relatórios.
3. **docker-build-scan** — build da imagem + Trivy (scan da imagem).
4. **deploy** — runner **self-hosted** no WSL sobe/atualiza o container local.

## Análise de segurança

As dependências foram inicialmente fixadas em versões vulneráveis
(`requests==2.28.1`, `urllib3==1.26.12`, `certifi==2022.9.24`) para
validar a detecção pela esteira. Principais achados:

| Achado | Componente | Severidade | Ferramenta |
|--------|-----------|------------|------------|
| CVE-2023-43804 (vazamento de Cookie em redirect) | urllib3 1.26.12 | HIGH | Trivy, pip-audit |
| CVE-2023-37920 (root CA e-Tugra) | certifi 2022.9.24 | HIGH | Trivy |
| B104 (bind em 0.0.0.0) | `app/main.py` | MEDIUM | Bandit |

**Correção:** dependências atualizadas para `requests==2.32.4`,
`urllib3==2.2.2` e `certifi==2024.8.30`. O B104 é risco aceito, pois o bind
em `0.0.0.0` é necessário para expor a porta dentro do container.
