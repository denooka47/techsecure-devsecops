---
title: "AP II — DevSecOps: Esteira CI/CD com Segurança Integrada"
subtitle: "Prova de Conceito — TechSecure Solutions"
date: "Outubro de 2026"
---

\newpage

# Capa

**Instituição:** _[preencher]_

**Disciplina:** AP II — DevSecOps

**Professor(a):** _[preencher]_

**Título do trabalho:** Esteira CI/CD com práticas de DevSecOps — Prova de Conceito para a TechSecure Solutions

**Data de apresentação:** 19/10/2026

## Integrantes do grupo

| Nome | RA / Matrícula |
|------|----------------|
| _[preencher]_ | _[preencher]_ |
| _[preencher]_ | _[preencher]_ |
| _[preencher]_ | _[preencher]_ |
| _[preencher]_ | _[preencher]_ |

\newpage

# 1. Objetivo

O objetivo deste trabalho é desenvolver uma **esteira básica de CI/CD** (Integração
e Entrega Contínuas) incorporando práticas de **DevSecOps**, ou seja, com a
segurança integrada ao ciclo de desenvolvimento de software.

A solução implementa o seguinte fluxo automatizado:

```
Código → Build → Teste → Análise de Segurança → Imagem Docker → Deploy Automático → Container
```

De forma prática, o projeto atende aos requisitos mínimos:

- armazenar o código-fonte em um repositório Git;
- iniciar automaticamente a pipeline após uma alteração no código (push);
- executar build e pelo menos um teste automatizado;
- executar uma análise básica de segurança de forma automática;
- construir uma imagem de container (Docker);
- realizar o deploy automático da aplicação;
- disponibilizar a aplicação funcionando em um container.

# 2. Cenário

A empresa fictícia **TechSecure Solutions** deseja reduzir erros de implantação e
incorporar práticas de segurança ao ciclo de desenvolvimento. Este trabalho
entrega uma prova de conceito (POC) de uma esteira CI/CD automatizada que detecta
vulnerabilidades **antes** de a aplicação chegar ao ambiente final, implementando
o conceito de "*shift-left security*" (deslocar a segurança para o início do
processo).

# 3. Arquitetura

A arquitetura é composta por quatro blocos principais:

1. **Repositório Git (GitHub):** guarda o código-fonte e dispara a pipeline a cada
   `push` na branch `main`.
2. **Pipeline CI/CD (GitHub Actions):** orquestra os estágios de build, teste,
   análise de segurança, construção e scan da imagem e deploy.
3. **Container Docker:** empacota a aplicação de forma isolada e portável.
4. **Ferramentas de segurança (Bandit, pip-audit, Trivy):** executam as análises
   automatizadas dentro da pipeline.

```
  Desenvolvedor
       │ git push
       ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                    GitHub (repositório)                         │
  └───────────────────────────────────────────────────────────────┘
       │ dispara automaticamente
       ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                 Pipeline CI/CD (GitHub Actions)                 │
  │                                                                 │
  │  [build-test] → [security] → [docker-build-scan] → [deploy]     │
  │   pytest         Bandit         docker build         container  │
  │                  pip-audit      Trivy (imagem)       no WSL      │
  │                  Trivy (fs)                                      │
  └───────────────────────────────────────────────────────────────┘
       │ deploy automático (runner self-hosted)
       ▼
  ┌───────────────────────────────────────────────────────────────┐
  │        Container Docker "techsecure-app" (porta 8080)           │
  │                 Aplicação Flask em execução                     │
  └───────────────────────────────────────────────────────────────┘
```

# 4. Aplicação escolhida

Foi desenvolvida uma aplicação web simples em **Python + Flask**, servida em
produção pelo servidor **gunicorn** e empacotada em container Docker. A aplicação
expõe os seguintes endpoints:

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Página HTML institucional da TechSecure Solutions |
| `/health` | GET | Healthcheck (usado pelo container e pelo deploy) |
| `/api/version` | GET | Retorna a versão da aplicação e das bibliotecas |
| `/api/soma` | GET | Ex.: `/api/soma?a=2&b=3` — lógica coberta por teste |

A escolha por uma aplicação simples é proposital: o foco da atividade é a esteira
e a segurança, não a complexidade da aplicação.

# 5. Tecnologias utilizadas

| Categoria | Ferramenta | Função |
|-----------|-----------|--------|
| Versionamento | **Git + GitHub** | Repositório de código e gatilho da pipeline |
| CI/CD | **GitHub Actions** | Orquestração da esteira |
| Linguagem | **Python 3.12 / Flask** | Aplicação web |
| Servidor | **gunicorn** | Servidor WSGI de produção |
| Container | **Docker** | Empacotamento e execução isolada |
| Testes | **pytest** | Testes automatizados |
| Segurança (SAST) | **Bandit** | Análise estática do código Python |
| Segurança (SCA) | **pip-audit** | Vulnerabilidades em dependências |
| Segurança (SCA + imagem) | **Trivy** | Scan de filesystem e da imagem Docker |
| Ambiente de execução | **WSL2 (Ubuntu) + Docker** | Execução local das evidências |

# 6. Descrição da pipeline

A pipeline está definida no arquivo `.github/workflows/cicd.yml` e é disparada
automaticamente a cada `push` na branch `main` (e em *pull requests*). Ela é
composta por quatro *jobs* encadeados:

1. **build-test** — instala as dependências e executa os testes automatizados com
   `pytest`. Se algum teste falhar, a pipeline é interrompida.
2. **security** — executa as três ferramentas de análise de segurança:
   - **Bandit** (SAST) sobre o diretório `app/`;
   - **pip-audit** sobre o `requirements.txt`;
   - **Trivy** em modo *filesystem* sobre o projeto.
   Os relatórios são publicados como *artifacts* da execução.
3. **docker-build-scan** — constrói a imagem Docker da aplicação e executa o
   **Trivy** sobre a imagem, detectando vulnerabilidades tanto nos pacotes Python
   quanto no sistema operacional da imagem base.
4. **deploy** — executado em um *runner self-hosted* no WSL, sobe/atualiza o
   container `techsecure-app` na porta 8080 e valida o healthcheck.

> Observação: toda a esteira também pode ser executada **localmente no WSL** por
> meio do script `scripts/run-local-pipeline.sh`, que reproduz os mesmos estágios
> usando containers Docker (é a origem das evidências deste documento).

# 7. Dockerfile

A imagem foi construída seguindo boas práticas de segurança:

- imagem base enxuta `python:3.12-slim`;
- execução como **usuário não-root** (`appuser`, uid 10001);
- `HEALTHCHECK` embutido;
- servidor de produção `gunicorn` (não o servidor de desenvolvimento do Flask).

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_VERSION=1.0.0 \
    PORT=8080

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
COPY app ./app

RUN useradd --create-home --uid 10001 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0) if urllib.request.urlopen('http://127.0.0.1:8080/health').getcode()==200 else sys.exit(1)"
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "app.main:app"]
```

# 8. Ferramenta de segurança e análise

A esteira executa **três camadas** de verificação automatizada de segurança:

| Camada | Ferramenta | Alvo |
|--------|-----------|------|
| SAST (código) | Bandit | Código-fonte Python (`app/`) |
| SCA (dependências) | pip-audit e Trivy (fs) | `requirements.txt` |
| Imagem de container | Trivy (image) | Pacotes Python + SO da imagem |

## 8.1 Achado principal apresentado

**Vulnerabilidade:** CVE-2023-43804 — o cabeçalho HTTP `Cookie` não é removido ao
seguir um redirecionamento para outra origem (*cross-origin*).

- **Componente afetado:** biblioteca `urllib3`, versão **1.26.12** (dependência
  transitiva de `requests`).
- **Severidade:** **HIGH** (Alta).
- **Detectada por:** Trivy (filesystem e imagem) e pip-audit.
- **Impacto:** cookies — que podem conter tokens de sessão/autenticação — são
  reenviados a um domínio de destino diferente durante um redirect, permitindo
  roubo de sessão/credenciais.
- **Correção / mitigação:** atualizar `urllib3` para **≥ 1.26.17** (ou `2.0.6`).
  Na prática, atualizar `requests` para **≥ 2.31.0**, que já exige uma versão
  corrigida de `urllib3`.

## 8.2 Outros achados

- **CVE-2023-37920 (HIGH)** — `certifi` 2022.9.24 ainda confia na autoridade
  e-Tugra (removida). Correção: `certifi ≥ 2023.7.22`.
- **Bandit B104 (MEDIUM)** — bind em `0.0.0.0` em `app/main.py` (bloco de
  desenvolvimento). Em produção usa-se gunicorn; mitigação: `# nosec B104`
  justificado ou restrição por variável de ambiente.
- **CVE-2025-47273 (HIGH)** — `setuptools` da imagem base (path traversal).
  Correção: atualizar `setuptools ≥ 78.1.1`.

# 9. Resultados e evidências

Resumo quantitativo da execução real da esteira (ambiente WSL2 + Docker):

| Ferramenta / alvo | Total | HIGH | CRITICAL |
|-------------------|-------|------|----------|
| pytest (testes) | 6 testes | — | — (6 passaram) |
| Trivy — `requirements.txt` (fs) | 8 | 8 | 0 |
| Trivy — imagem (SO Debian) | 45 | 45 | 0 |
| Trivy — imagem (pacotes Python) | 12 | 12 | 0 |
| Bandit — código Python | 1 | — | 1 MEDIUM |

Evidências (logs) estão no diretório `evidencias/` do repositório:

- `02-testes-pytest.txt` — 6 testes aprovados;
- `03a-bandit.txt` — achado SAST B104;
- `03b-pip-audit.txt` — CVEs em dependências;
- `03c-trivy-fs.txt` — 8 vulnerabilidades HIGH;
- `04-docker-build.txt` — build da imagem;
- `04b-trivy-image.txt` — 45+12 vulnerabilidades HIGH na imagem;
- `05-docker-ps.txt` — container em execução (status *healthy*);
- `06-app-*.txt` — respostas da aplicação funcionando.

## 9.1 Prints da execução (WSL)

As figuras a seguir são as capturas da execução real da esteira no ambiente
WSL2 + Docker, cobrindo cada etapa exigida (build, teste, security scan, imagem
Docker, container e aplicação funcionando), além da pipeline no GitHub Actions.

![Figura 1 — Testes automatizados (pytest): 6 testes aprovados.](evidencias/img/fig-01-testes.png){width=6in}

![Figura 2 — Security scan com Bandit (SAST): achado B104 no código.](evidencias/img/fig-02-bandit.png){width=6in}

![Figura 3 — Security scan com pip-audit: CVEs nas dependências.](evidencias/img/fig-03-pip-audit.png){width=6in}

![Figura 4 — Security scan com Trivy (filesystem): 8 vulnerabilidades HIGH.](evidencias/img/fig-04-trivy-fs.png){width=6in}

![Figura 5 — Build da imagem Docker da aplicação.](evidencias/img/fig-05-docker-build.png){width=6in}

![Figura 6 — Scan da imagem Docker com Trivy (pacotes Python + SO).](evidencias/img/fig-06-trivy-image.png){width=6in}

![Figura 7 — Container em execução (status *healthy*) na porta 8080.](evidencias/img/fig-07-container.png){width=6in}

![Figura 8 — Aplicação respondendo aos endpoints (curl).](evidencias/img/fig-08-app-endpoints.png){width=6in}

![Figura 9 — Aplicação funcionando no navegador (http://localhost:8080).](evidencias/img/fig-09-app-navegador.png){width=6in}

![Figura 10 — Pipeline no GitHub Actions disparada automaticamente a cada push.](evidencias/img/fig-10-actions.png){width=6in}

> Observação: as capturas de terminal foram geradas a partir das saídas reais
> salvas em `evidencias/` (arquivos `.txt`); as Figuras 9 e 10 são capturas
> diretas do navegador. Todas podem ser substituídas por *screenshots* próprios
> tirados durante a demonstração, se preferir.

# 10. Demonstração (ciclo DevSecOps)

Na demonstração em sala é feita uma **alteração simples no código** (script
`scripts/demo-fix.sh`) que corrige as dependências vulneráveis e incrementa a
versão para `1.0.1`:

```diff
- requests==2.28.1
- urllib3==1.26.12
- certifi==2022.9.24
+ requests==2.32.4
+ urllib3==2.2.2
+ certifi==2024.8.30
```

Após `commit` + `push`, a pipeline roda automaticamente e os achados de
`urllib3`/`certifi`/`requests` **desaparecem** do relatório de segurança,
comprovando o ciclo **detecção → correção → verificação** automatizado.

# 11. Dificuldades encontradas

- **Ambiente WSL:** o Docker nativo do WSL usava um *credential helper* do Docker
  Desktop incompatível; foi necessário ajustar o `~/.docker/config.json`.
- **Conflito de dependências:** a ferramenta `pip-audit` conflitava com as versões
  antigas propositalmente fixadas (`requests==2.28.1`); a solução foi instalar as
  ferramentas de segurança de forma isolada, em containers dedicados.
- **Vulnerabilidade controlada:** para garantir um achado demonstrável e com
  correção clara, as dependências foram fixadas em versões com CVEs conhecidos.

# 12. Conclusão

A prova de conceito demonstrou, de ponta a ponta, uma esteira CI/CD com segurança
integrada (DevSecOps). A automação garante que todo `push` seja submetido a
testes e a três camadas de análise de segurança antes do deploy, implementando o
princípio de *shift-left security*. A detecção de vulnerabilidades reais
(ex.: CVE-2023-43804 em `urllib3`) e sua correção automatizada evidenciam o
valor da abordagem para reduzir riscos e erros de implantação — exatamente o
objetivo da TechSecure Solutions.

\newpage

# Apêndice — Estrutura do repositório

```
techsecure-devsecops/
├── app/
│   ├── main.py
│   └── templates/index.html
├── tests/test_app.py
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── .dockerignore
├── .github/workflows/cicd.yml
├── scripts/
│   ├── run-local-pipeline.sh
│   ├── deploy.sh
│   ├── demo-fix.sh
│   └── setup-self-hosted-runner.sh
├── evidencias/
├── docs/
│   ├── analise-seguranca.md
│   └── GUIA-GITHUB.md
└── README.md
```
