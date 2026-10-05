# TechSecure Solutions - POC de Esteira CI/CD com DevSecOps

Prova de conceito (AP II - DevSecOps) de uma esteira CI/CD automatizada com
segurança integrada, para a empresa fictícia **TechSecure Solutions**.

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
├── scripts/
│   ├── run-local-pipeline.sh # roda a esteira inteira no WSL (evidências)
│   ├── deploy.sh             # deploy/atualização do container
│   └── setup-self-hosted-runner.sh # runner self-hosted p/ deploy no WSL
├── evidencias/               # saídas (logs) de cada etapa
└── docs/                     # material do trabalho escrito
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

## Análise de segurança (achado demonstrado)

As dependências foram fixadas propositalmente em versões vulneráveis
(`requests==2.28.1`, `urllib3==1.26.12`, `certifi==2022.9.24`) para
demonstrar a detecção. Veja `docs/analise-seguranca.md` para o achado
detalhado (vulnerabilidade, componente, severidade e correção).

**Correção / mitigação:** atualizar as dependências para as versões mais
recentes (ver `docs/analise-seguranca.md`).
