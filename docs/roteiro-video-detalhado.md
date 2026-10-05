---
title: "Roteiro DETALHADO de Gravação — Vídeo DevSecOps"
subtitle: "TechSecure Solutions · passo a passo, comando a comando"
date: "Duração alvo: 7 a 9 minutos"
---

# Como ler este roteiro

Cada passo tem:

- 🖥️ **TELA** — o que deve estar aparecendo.
- ⌨️ **AÇÃO** — o comando exato ou o clique.
- 🎙️ **NARRAÇÃO** — o texto para você falar (pode ler).
- ✅ **ESPERADO** — a saída/resultado que deve aparecer.
- 💡 **DICA** — para onde apontar o cursor / cuidados.

Janelas usadas:
**T1** = terminal Ubuntu (projeto) · **T2** = terminal Ubuntu (runner) ·
**NAV** = navegador (aba APP = `localhost:8080`, aba GITHUB = repositório).

---

# PARTE 0 — Preparação (NÃO gravar)

Faça tudo isto ANTES de apertar REC. Cada comando tem a saída esperada — se bater,
você não terá surpresas na gravação.

### 0.1 — Iniciar o runner (T2)
```bash
cd ~/actions-runner && ./run.sh
```
✅ Esperado: aparece `√ Connected to GitHub` e depois **`Listening for Jobs`**.
Deixe esta aba aberta o vídeo inteiro.

> Se aparecer `Conflict. Retrying…`, aguarde ~1 min (sessão antiga expira) ou
> Ctrl+C e rode `./run.sh` de novo.

### 0.2 — Preparar o terminal do projeto (T1)
```bash
cd ~/projetos/techsecure-devsecops
export PATH=$HOME/.local/bin:$PATH
clear
```

### 0.3 — Conferir o estado inicial (T1)
```bash
grep APP_VERSION app/main.py | head -1
grep -E "requests|urllib3|certifi" requirements.txt
docker ps --filter name=techsecure-app
git status --short
```
✅ Esperado:
- versão **1.0.0**;
- `requests==2.28.1`, `urllib3==1.26.12`, `certifi==2022.9.24` (vulneráveis);
- container `Up ... (healthy)` na porta 8080;
- `git status` **sem nada** (limpo).

Se o container não estiver no ar: `./scripts/deploy.sh`

### 0.4 — Abrir o navegador (NAV)
- Aba **APP**: `http://localhost:8080`
- Aba **GITHUB**: `https://github.com/denooka47/techsecure-devsecops`

### 0.5 — Ajustes de gravação
- Fonte do terminal grande: **Ctrl + Shift + +** (umas 3 vezes).
- Feche notificações do Windows. Grave 1080p (OBS Studio).
- Deixe o T1 com a tela limpa (`clear`).

▶️ **Agora aperte REC.**

---

# PARTE 1 — GRAVAÇÃO

## 🎬 CENA 1 — Abertura e arquitetura — alvo 0:00–0:50

🖥️ **TELA:** aba GITHUB (página inicial do repositório).
🎙️ **NARRAÇÃO:**
> "Olá! Vamos demonstrar uma esteira CI/CD com DevSecOps — segurança integrada ao
> ciclo de desenvolvimento — para a empresa fictícia TechSecure Solutions. O
> objetivo é ir do código ao container de forma automática, verificando segurança
> em cada etapa. O fluxo é: Código, Build, Teste, Análise de Segurança, Imagem
> Docker, Deploy automático e Container."

⌨️ **AÇÃO:** abra o `docs/apresentacao.pptx` (slide 3 — Arquitetura) OU o diagrama
do `README`.
🎙️ **NARRAÇÃO (apontando o diagrama):**
> "A arquitetura tem quatro peças: o GitHub, que guarda o código e dispara a
> pipeline; o GitHub Actions, que orquestra; o Docker, que empacota a aplicação; e
> as ferramentas de segurança — Bandit, pip-audit e Trivy."

💡 **DICA:** passe o cursor em cada bloco do diagrama enquanto cita.

---

## 🎬 CENA 2 — A aplicação funcionando — alvo 0:50–1:40

🖥️ **TELA:** aba APP (`http://localhost:8080`).
🎙️ **NARRAÇÃO:**
> "Esta é a aplicação: uma API web em Python com Flask, rodando dentro de um
> container Docker. Repare no fluxo da esteira ilustrado na página."

⌨️ **AÇÃO:** vá para o **T1** e rode os endpoints:
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/version
curl "http://localhost:8080/api/soma?a=2&b=3"
```
✅ **ESPERADO:**
```
{"status":"ok","version":"1.0.0"}
{"app":"TechSecure Solutions","requests_lib":"2.28.1","version":"1.0.0"}
{"a":2.0,"b":3.0,"resultado":5.0}
```
🎙️ **NARRAÇÃO:**
> "A aplicação responde. Guarde este número: **versão 1.0.0**. No fim do vídeo
> ela vai mudar automaticamente para 1.0.1."

💡 **DICA:** selecione com o mouse o trecho `"version":"1.0.0"` para destacar.

---

## 🎬 CENA 3 — O repositório (Source) — alvo 1:40–2:20

🖥️ **TELA:** aba GITHUB.
⌨️ **AÇÃO:** clique na pasta **app/**, depois volte e mostre **Dockerfile** e
**.github/workflows/cicd.yml** (clique para abrir cada um brevemente).
🎙️ **NARRAÇÃO:**
> "O código-fonte fica no Git. Temos a aplicação em `app`, os testes em `tests`,
> o `Dockerfile` que descreve a imagem, e a pipeline em
> `.github/workflows/cicd.yml`. Qualquer push na branch main dispara a esteira
> automaticamente."

💡 **DICA:** no Dockerfile, aponte `USER appuser` e diga "roda como usuário
não-root — boa prática de segurança".

---

## 🎬 CENA 4 — A pipeline (os 4 estágios) — alvo 2:20–3:10

🖥️ **TELA:** o arquivo `.github/workflows/cicd.yml` aberto no GitHub (ou no T1 com
`cat .github/workflows/cicd.yml`).
🎙️ **NARRAÇÃO (rolando o arquivo devagar):**
> "A pipeline tem quatro jobs encadeados. Primeiro, **build-test**: instala as
> dependências e roda os testes com pytest — se um teste falhar, a esteira para.
> Segundo, **security**: roda Bandit, que analisa o código, mais pip-audit e
> Trivy, que analisam as dependências. Terceiro, **docker-build-scan**: constrói
> a imagem e roda o Trivy sobre a imagem. E quarto, **deploy**: um runner
> self-hosted sobe o container automaticamente."

💡 **DICA:** aponte cada `name:` dos jobs ao citá-los.

---

## 🎬 CENA 5 — Build, Teste e Security Scan de perto — alvo 3:10–4:50

> Esta cena mostra, bem de perto, o build, os testes e o **resultado do scan de
> segurança com o achado**. É a cena mais importante para os critérios.

🖥️ **TELA:** T1 (terminal grande).
⌨️ **AÇÃO:**
```bash
./scripts/run-local-pipeline.sh
```
Deixe rolar. Vão aparecer, em ordem, blocos com cabeçalhos coloridos.

**(a) Testes** — quando aparecer o bloco do pytest:
✅ **ESPERADO:** `6 passed in 0.1x s`
🎙️ **NARRAÇÃO:** "Build e testes: os seis testes passaram."

**(b) Bandit** — bloco `Security Scan → Bandit`:
✅ **ESPERADO:** `>> Issue: [B104:hardcoded_bind_all_interfaces] ... Severity: Medium`
🎙️ **NARRAÇÃO:** "Análise estática do código com o Bandit: encontrou o B104, um
aviso de bind em todas as interfaces."

**(c) Trivy (filesystem)** — bloco `Trivy`:
✅ **ESPERADO:** `Total: 8 (HIGH: 8, CRITICAL: 0)` e uma tabela com
`certifi CVE-2023-37920` e `urllib3 CVE-2023-43804`.
🎙️ **NARRAÇÃO (PARE aqui e aponte a linha do urllib3):**
> "Aqui está o resultado do scan de segurança: oito vulnerabilidades de
> severidade alta nas dependências. O destaque é o **CVE-2023-43804**, na
> biblioteca **urllib3 1.26.12**: o cabeçalho Cookie não é removido em
> redirecionamentos para outro domínio, o que pode vazar tokens de sessão. A
> coluna 'Fixed Version' já indica a correção: atualizar para 1.26.17."

💡 **DICA:** se quiser, role de volta no terminal para mostrar a tabela do Trivy
parada enquanto narra.

---

## 🎬 CENA 6 — O ciclo DevSecOps: alteração → push → pipeline — alvo 4:50–6:40

🖥️ **TELA:** T1.
🎙️ **NARRAÇÃO:**
> "Agora o coração do DevSecOps: vou corrigir essa vulnerabilidade e ver a esteira
> rodar sozinha."

⌨️ **AÇÃO (a alteração simples):**
```bash
./scripts/demo-fix.sh
```
✅ **ESPERADO:** mensagens "Atualizando requirements.txt…", "Incrementando
APP_VERSION 1.0.0 -> 1.0.1".
🎙️ **NARRAÇÃO:** "Atualizei as bibliotecas vulneráveis para versões seguras e
subi a versão da aplicação para 1.0.1."

⌨️ **AÇÃO (confirmar a mudança — opcional):**
```bash
git diff --stat
```
✅ **ESPERADO:** mostra `requirements.txt`, `app/main.py`, `Dockerfile` alterados.

⌨️ **AÇÃO (commit e push — dispara a pipeline):**
```bash
git add -A
git commit -m "fix: atualiza dependencias vulneraveis (v1.0.1)"
git push
```
✅ **ESPERADO:** `... main -> main` no final do push.
🎙️ **NARRAÇÃO:** "Commit e push feitos. Isso dispara a pipeline automaticamente."

🖥️ **TELA:** aba GITHUB → clique em **Actions** (menu do topo) e **recarregue**
(F5).
✅ **ESPERADO:** no topo da lista aparece uma execução nova com o nome do commit,
com bolinha **amarela** (em andamento).
🎙️ **NARRAÇÃO:** "Veja: o push iniciou a pipeline sozinho."

⌨️ **AÇÃO:** clique na execução nova. Aparecem os 4 jobs no diagrama.
🎙️ **NARRAÇÃO (enquanto roda):**
> "Os jobs rodam em sequência: build e testes, análise de segurança, build e scan
> da imagem e, por último, o deploy."

💡 **ESPERA (~1,5 a 2 min):** enquanto a pipeline roda, clique no job
**"Análise de Segurança"** e abra o passo do Trivy.
🎙️ **NARRAÇÃO:**
> "Repare: agora, com as dependências corrigidas, os achados de urllib3 e certifi
> **não aparecem mais** no relatório. A correção funcionou."

> 💡 Se não quiser mostrar a espera inteira, **corte na edição** e volte quando
> todos os jobs estiverem verdes.

---

## 🎬 CENA 7 — Deploy automático e container atualizado — alvo 6:40–8:00

🖥️ **TELA:** aba GITHUB (a execução).
✅ **ESPERADO:** os 4 jobs com ✓ verde, inclusive **"Deploy automatico (container)"**.
🎙️ **NARRAÇÃO:** "Pipeline verde, incluindo o deploy."

🖥️ **TELA:** rápida passada no **T2** (runner).
✅ **ESPERADO:** linhas como `Running job: Deploy automatico (container)` e
`Job … completed with result: Succeeded`.
🎙️ **NARRAÇÃO:** "O deploy rodou no nosso runner self-hosted, aqui na máquina."

⌨️ **AÇÃO:** no **T1**, comprove o container e a versão nova:
```bash
docker ps --filter name=techsecure-app
curl http://localhost:8080/api/version
```
✅ **ESPERADO:**
```
techsecure-app   Up ... (healthy)   0.0.0.0:8080->8080/tcp
{"app":"TechSecure Solutions","requests_lib":"2.32.4","version":"1.0.1"}
```
🎙️ **NARRAÇÃO:**
> "O container foi atualizado automaticamente pela esteira. A versão agora é
> **1.0.1** e a biblioteca requests subiu para a versão corrigida — tudo sem
> nenhuma intervenção manual."

🖥️ **TELA:** aba APP → **recarregue** (F5) `http://localhost:8080`.
🎙️ **NARRAÇÃO:** "A aplicação atualizada continua no ar."

💡 **DICA:** se a versão ainda mostrar 1.0.0, aguarde o job de deploy terminar
100% e recarregue; o deploy leva alguns segundos após o job ficar verde.

---

## 🎬 CENA 8 — Encerramento — alvo 8:00–8:40

🖥️ **TELA:** aba GITHUB (pipeline verde) ou o slide de conclusão.
🎙️ **NARRAÇÃO:**
> "Recapitulando: todo push passa por testes e três camadas de análise de
> segurança antes do deploy. Detectamos uma vulnerabilidade real, corrigimos, e a
> esteira reconstruiu e reimplantou a aplicação automaticamente. Esse é o ciclo
> DevSecOps: detecção, correção e verificação contínua. Obrigado!"

⏹️ **Pare a gravação.**

---

# Checklist dos 9 itens obrigatórios

| Item do enunciado | Cena |
|-------------------|------|
| Arquitetura do projeto | 1 |
| Aplicação escolhida | 2 |
| Repositório | 3 |
| Pipeline | 4 |
| Execução do build | 5 e 6 |
| Teste de segurança | 5 |
| Resultado do security scan | 5 (achado) e 6 (sumiço após a correção) |
| Container em execução | 7 |
| Aplicação funcionando | 2 e 7 |

---

# Para REGRAVAR (voltar ao estado inicial 1.0.0)

```bash
cd ~/projetos/techsecure-devsecops
git revert --no-edit HEAD        # desfaz o commit do demo-fix
git push                         # (opcional) roda a pipeline de volta p/ 1.0.0
./scripts/deploy.sh              # garante o container no ar na 1.0.0
curl http://localhost:8080/api/version   # confirmar: 1.0.0
```

# Problemas comuns durante a gravação

| Sintoma | O que fazer |
|---------|-------------|
| `./run.sh` diz `Conflict. Retrying` | Só há um runner permitido. Ctrl+C, espere ~1 min, rode de novo. |
| Pipeline não aparece no Actions | Confirme o `git push` (deve terminar com `main -> main`) e dê F5. |
| Job **Deploy** fica "Queued" para sempre | O runner (T2) não está rodando. Inicie `cd ~/actions-runner && ./run.sh`. |
| `curl` falha / porta 8080 | `./scripts/deploy.sh` e tente de novo. |
| Versão não muda para 1.0.1 | Espere o job de deploy ficar verde e recarregue; confira `docker ps`. |
| `gh`/`git push` pede login | Abra um terminal novo (PATH já tem o gh) ou rode `export PATH=$HOME/.local/bin:$PATH`. |
