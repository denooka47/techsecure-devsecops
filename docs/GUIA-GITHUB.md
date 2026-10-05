# Guia de integração com o GitHub (pipeline automática)

Este guia conclui a parte que exige a **sua conta GitHub**: subir o repositório
e fazer a pipeline (GitHub Actions) disparar automaticamente a cada `push`.

> Todos os comandos abaixo rodam no **WSL (Ubuntu)**, dentro da pasta do projeto:
> `cd ~/projetos/techsecure-devsecops`

## 1. Instalar e autenticar o GitHub CLI

```bash
# instala o gh (uma vez)
sudo apt-get update && sudo apt-get install -y gh

# autentica (abre o fluxo no navegador — escolha GitHub.com, HTTPS, login via browser)
gh auth login
```

> No Claude Code, você pode rodar um comando interativo digitando no prompt:
> `! gh auth login`

## 2. Criar o repositório e fazer o push

```bash
# cria o repo na sua conta e faz o push do branch main (já commitado)
gh repo create techsecure-devsecops --public --source=. --remote=origin --push
```

Pronto: ao concluir o push, a aba **Actions** do repositório mostra a pipeline
rodando automaticamente (jobs: build-test → security → docker-build-scan → deploy).

> O job **deploy** usa um runner *self-hosted* (passo 3). Enquanto ele não
> estiver registrado, esse job fica "pendente"; os demais rodam normalmente nos
> runners da nuvem do GitHub. Se preferir, comente o job `deploy` no
> `.github/workflows/cicd.yml` para a pipeline ficar 100% verde na nuvem e faça
> o deploy localmente com `./scripts/deploy.sh`.

## 3. (Opcional) Runner self-hosted no WSL — deploy automático do container

Para o container ser implantado **no seu WSL** automaticamente ao final da
pipeline:

1. No GitHub: **repo → Settings → Actions → Runners → New self-hosted runner**
   → selecione **Linux**. Copie o **token** exibido (campo `--token`).
2. No WSL:

```bash
./scripts/setup-self-hosted-runner.sh https://github.com/<SEU_USUARIO>/techsecure-devsecops <TOKEN>
```

O script baixa, configura (labels `self-hosted, wsl`) e inicia o runner.
Deixe esse terminal aberto durante a demonstração — o job `deploy` será
executado nele e subirá o container `techsecure-app` no WSL.

## 4. Demonstração (item 9 da atividade)

```bash
# 1) aplicação funcionando
curl http://localhost:8080/health

# 2) alteração simples no código (corrige vulnerabilidades + versão 1.0.1)
./scripts/demo-fix.sh

# 3) commit e push -> dispara a pipeline automaticamente
git add -A
git commit -m "fix: atualiza dependencias vulneraveis (v1.0.1)"
git push

# 4..9) acompanhe na aba Actions: build -> teste -> security scan ->
#        build da imagem -> deploy
# 10) aplicação atualizada:
curl http://localhost:8080/api/version   # deve mostrar "version":"1.0.1"
```
