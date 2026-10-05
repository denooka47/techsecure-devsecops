---
title: "Roteiro de Gravação do Vídeo — DevSecOps passo a passo"
subtitle: "TechSecure Solutions · Esteira CI/CD"
date: "Duração alvo: 5 a 10 minutos"
---

# Visão geral

Este roteiro mostra **o que fazer, quando e onde**, com os **comandos exatos**,
para gravar o vídeo demonstrando a esteira CI/CD DevSecOps de ponta a ponta.

O vídeo cobre os 9 itens exigidos: arquitetura, aplicação, repositório,
pipeline, build, teste de segurança, resultado do scan, container e aplicação
funcionando.

## Janelas que você vai usar (abra todas antes de gravar)

| Sigla | O que é | Como abrir |
|-------|---------|-----------|
| **T1** | Terminal Ubuntu — pasta do projeto | Windows Terminal → aba Ubuntu |
| **T2** | Terminal Ubuntu — runner do deploy | Windows Terminal → outra aba Ubuntu |
| **NAV** | Navegador (Chrome) | Aba 1: aplicação · Aba 2: GitHub |

> Dica de gravação: aumente a fonte do terminal (**Ctrl + Shift + "+"**) para
> ficar legível no vídeo. Grave em 1080p.

---

# PARTE 0 — Preparação (NÃO grave esta parte)

Deixe o ambiente no ponto de partida antes de apertar o REC.

**T2 — iniciar o runner (deixe rodando o vídeo inteiro):**
```bash
cd ~/actions-runner
./run.sh
```
*(Espere aparecer "Listening for Jobs". Não feche esta aba.)*

**T1 — ir para o projeto e garantir o estado inicial:**
```bash
cd ~/projetos/techsecure-devsecops
export PATH=$HOME/.local/bin:$PATH

# garantir que a versão é 1.0.0 e as dependências estão vulneráveis
grep APP_VERSION app/main.py | head -1
grep -E "requests|urllib3|certifi" requirements.txt
git status --short            # deve estar limpo

# garantir que o container está no ar
docker ps --filter name=techsecure-app
```
Se o container não estiver rodando:
```bash
./scripts/deploy.sh
```

**NAV — abrir as duas abas:**
- Aba 1: `http://localhost:8080`
- Aba 2: `https://github.com/denooka47/techsecure-devsecops`

Agora aperte **REC**.

---

# PARTE 1 — Gravação (passo a passo)

## 🎬 Cena 1 — Abertura e arquitetura · ~0:40 · (NAV + fala)

- **Onde:** mostre o repositório no GitHub (Aba 2) e o `README.md`.
- **Fale:** "Esta é a POC de uma esteira CI/CD com DevSecOps para a TechSecure
  Solutions. O fluxo é: Código → Build → Teste → Análise de Segurança → Imagem
  Docker → Deploy automático → Container."
- Mostre o diagrama de arquitetura (abra `docs/trabalho-escrito.docx` ou o slide
  3 da apresentação) e explique as 4 peças: GitHub, GitHub Actions, Docker e as
  ferramentas de segurança (Bandit, pip-audit, Trivy).

## 🎬 Cena 2 — A aplicação funcionando · ~0:50 · (NAV + T1)

- **Onde:** Aba 1 do navegador (`http://localhost:8080`).
- **Fale:** "A aplicação é uma API em Python/Flask rodando em container."
- **T1 — mostrar os endpoints respondendo:**
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/version
curl "http://localhost:8080/api/soma?a=2&b=3"
```
- **Fale:** "Repare na versão: **1.0.0**. Vamos atualizá-la no final."

## 🎬 Cena 3 — O repositório (Source) · ~0:40 · (NAV)

- **Onde:** GitHub (Aba 2).
- Mostre a estrutura: pasta `app/`, `tests/`, `Dockerfile`,
  `.github/workflows/cicd.yml`, `scripts/`.
- **Fale:** "O código fica no Git. Qualquer push na branch main dispara a
  pipeline automaticamente."

## 🎬 Cena 4 — A pipeline (o arquivo) · ~0:50 · (NAV ou T1)

- **Onde:** abra `.github/workflows/cicd.yml` no GitHub, OU no T1:
```bash
cat .github/workflows/cicd.yml
```
- **Fale:** "A pipeline tem 4 jobs encadeados: **build-test** (pytest),
  **security** (Bandit + pip-audit + Trivy), **docker-build-scan** (imagem +
  Trivy na imagem) e **deploy** (runner self-hosted que sobe o container)."

## 🎬 Cena 5 — Build, Teste e Security Scan localmente (close-up) · ~1:30 · (T1)

> Esta cena mostra de perto o build, o teste e o resultado do scan de segurança
> (com os achados). É o "teste de segurança" e o "resultado do security scan".

- **T1 — rodar a esteira local completa:**
```bash
./scripts/run-local-pipeline.sh
```
- **Fale enquanto roda:**
  - No **pytest**: "Aqui o build e os 6 testes passando."
  - No **Bandit**: "Análise estática do código (SAST) — achou o B104."
  - No **Trivy**: "Scan das dependências — **8 vulnerabilidades HIGH**."
- **Quando aparecer o Trivy**, pare e aponte o achado principal:
  - **Fale:** "Destaque: **CVE-2023-43804** no **urllib3 1.26.12**,
    severidade **HIGH** — o cabeçalho Cookie vaza em redirecionamentos
    cross-origin. A correção é atualizar o urllib3."

## 🎬 Cena 6 — O ciclo automático: alteração → push → pipeline · ~2:00 · (T1 + NAV)

> Aqui está o coração do DevSecOps: corrigir a vulnerabilidade e ver a esteira
> rodar sozinha.

- **T1 — fazer a alteração que corrige as CVEs e sobe a versão:**
```bash
./scripts/demo-fix.sh
```
- **Fale:** "Fiz uma alteração simples: atualizei as bibliotecas vulneráveis e
  subi a versão para 1.0.1."
- **T1 — commit e push (dispara a pipeline):**
```bash
git add -A
git commit -m "fix: atualiza dependencias vulneraveis (v1.0.1)"
git push
```
- **NAV — ir para a aba Actions** e **recarregar**:
  `https://github.com/denooka47/techsecure-devsecops/actions`
- **Fale:** "Veja: o push disparou a pipeline automaticamente."
- Clique na execução que apareceu e mostre os jobs rodando em sequência:
  **Build e Testes → Análise de Segurança → Build e Scan da Imagem → Deploy.**
- **Fale ao abrir o job de Segurança:** "Com as dependências corrigidas, os
  achados de urllib3 e certifi **sumiram** do relatório."

## 🎬 Cena 7 — Deploy e container atualizado · ~1:00 · (NAV + T2 + T1)

- **NAV:** mostre o job **Deploy automático** concluindo (verde).
- **T2:** mostre rapidamente o runner recebendo e executando o job
  ("Running job: Deploy automatico...").
- **T1 — comprovar o container e a versão nova:**
```bash
docker ps --filter name=techsecure-app
curl http://localhost:8080/api/version
```
- **Fale:** "O container foi atualizado automaticamente pela esteira — a versão
  agora é **1.0.1**, sem nenhuma intervenção manual."
- **NAV — Aba 1:** recarregue `http://localhost:8080` e mostre a aplicação no ar.

## 🎬 Cena 8 — Encerramento · ~0:30 · (fala)

- **Fale:** "Resumindo: todo push passa por testes e três camadas de segurança
  antes do deploy. Detectamos uma vulnerabilidade real, corrigimos, e a esteira
  reconstruiu e reimplantou a aplicação automaticamente. Esse é o ciclo
  DevSecOps: detecção → correção → verificação. Obrigado!"

---

# Checklist de itens obrigatórios do vídeo

- [ ] Arquitetura do projeto — Cena 1
- [ ] Aplicação escolhida — Cena 2
- [ ] Repositório — Cena 3
- [ ] Pipeline — Cena 4
- [ ] Execução do build — Cena 5 (e Cena 6, nos Actions)
- [ ] Teste de segurança — Cena 5
- [ ] Resultado do security scan — Cena 5 (achado) e Cena 6 (sumiço após fix)
- [ ] Container em execução — Cena 7
- [ ] Aplicação funcionando — Cena 2 e Cena 7

---

# Como VOLTAR ao estado inicial (para regravar)

Se precisar gravar de novo, reverta a alteração da demo:
```bash
cd ~/projetos/techsecure-devsecops
git revert --no-edit HEAD      # desfaz o commit do demo-fix (gera novo commit)
git push                       # opcional: dispara a pipeline de volta p/ 1.0.0
# OU, se ainda não deu push:
# git reset --hard HEAD~1
./scripts/deploy.sh            # garante o container no ar
```

# Dicas de gravação

- Software sugerido: **OBS Studio** (grava tela + microfone).
- Feche abas e notificações que possam aparecer na tela.
- Fonte do terminal grande; tema escuro ajuda a leitura.
- Fale pausadamente ao mostrar comandos; dê tempo da pipeline rodar
  (cada run leva ~1,5 a 2 min — você pode acelerar/cortar na edição).
