---
title: "Roteiro de Apresentação — AP II DevSecOps"
subtitle: "TechSecure Solutions · Esteira CI/CD com Segurança Integrada"
date: "Apresentação: 19/10/2026 · Duração: 15 minutos"
---

# Como usar este roteiro

- Duração total: **15 minutos** (12 min de fala + 3 min de demonstração ao vivo).
- **Todos os integrantes falam.** Os blocos estão marcados com
  *[Integrante 1]*, *[Integrante 2]*, etc. — distribuam conforme preferirem.
- Deixe aberto **antes de começar**: (1) o terminal Ubuntu com o runner rodando
  (`cd ~/actions-runner && ./run.sh`); (2) o navegador na aba **Actions** do
  repositório; (3) uma aba em `http://localhost:8080`.
- Repositório: **https://github.com/denooka47/techsecure-devsecops**

---

# Linha do tempo (15 min)

| Tempo | Bloco | Quem |
|-------|-------|------|
| 0:00–1:00 | Abertura e objetivo | Integrante 1 |
| 1:00–2:30 | Cenário e arquitetura | Integrante 2 |
| 2:30–4:00 | Aplicação e tecnologias | Integrante 3 |
| 4:00–6:00 | A pipeline (os 4 estágios) | Integrante 4 |
| 6:00–7:30 | Análise de segurança (o achado) | Integrante 1 |
| 7:30–12:00 | **Demonstração ao vivo** | Integrante 2 + 3 |
| 12:00–13:30 | Dificuldades e conclusão | Integrante 4 |
| 13:30–15:00 | Perguntas | Todos |

---

# 1. Abertura e objetivo — *[Integrante 1]* (1 min)

> "Bom dia/boa tarde. Somos o grupo _[nomes]_ e vamos apresentar nossa prova de
> conceito de uma **esteira CI/CD com DevSecOps** para a empresa fictícia
> **TechSecure Solutions**.
>
> O objetivo foi automatizar o caminho do código até o container em produção,
> **com segurança integrada em cada etapa** — o conceito de *shift-left
> security*, ou seja, encontrar vulnerabilidades o quanto antes.
>
> O fluxo que implementamos é: **Código → Build → Teste → Análise de Segurança →
> Imagem Docker → Deploy Automático → Container.**"

# 2. Cenário e arquitetura — *[Integrante 2]* (1,5 min)

> "A TechSecure queria reduzir erros de implantação e incorporar segurança ao
> ciclo de desenvolvimento. Nossa arquitetura tem quatro peças:
>
> 1. **GitHub** — guarda o código e **dispara a pipeline a cada push**;
> 2. **GitHub Actions** — orquestra os estágios da esteira;
> 3. **Docker** — empacota a aplicação em um container isolado;
> 4. **Ferramentas de segurança** — Bandit, pip-audit e Trivy, rodando
>    automaticamente dentro da pipeline.
>
> O diferencial é que o **deploy é automático**: ao final da esteira, um *runner
> self-hosted* roda aqui na nossa máquina (WSL) e sobe o container
> automaticamente."

*(Mostrar o diagrama de arquitetura do trabalho escrito.)*

# 3. Aplicação e tecnologias — *[Integrante 3]* (1,5 min)

> "A aplicação é propositalmente simples — o foco é a esteira, não a aplicação.
> É uma API web em **Python com Flask**, servida por **gunicorn** e empacotada em
> Docker. Ela tem uma página inicial e endpoints como `/health`, `/api/version`
> e `/api/soma`.
>
> As tecnologias: **Git/GitHub** para versionamento, **GitHub Actions** para
> CI/CD, **Docker** para containers, **pytest** para os testes e, na segurança,
> **Bandit** (análise do código), **pip-audit** e **Trivy** (vulnerabilidades em
> dependências e na imagem).
>
> Uma boa prática importante: o container roda como **usuário não-root** e tem
> **healthcheck**."

# 4. A pipeline — os 4 estágios — *[Integrante 4]* (2 min)

> "Nossa pipeline, no arquivo `cicd.yml`, tem quatro *jobs* encadeados:
>
> 1. **build-test** — instala as dependências e roda os **testes com pytest**. Se
>    um teste falhar, a esteira para.
> 2. **security** — roda as **três camadas de segurança**: Bandit no código,
>    pip-audit e Trivy nas dependências. Os relatórios ficam salvos.
> 3. **docker-build-scan** — **constrói a imagem** Docker e roda o **Trivy na
>    imagem**, achando falhas tanto nos pacotes Python quanto no sistema
>    operacional base.
> 4. **deploy** — roda no **runner self-hosted** e **sobe o container**
>    automaticamente aqui na máquina.
>
> Ou seja, nenhuma imagem vai para o deploy sem antes passar pelos testes e pela
> análise de segurança."

# 5. Análise de segurança — o achado — *[Integrante 1]* (1,5 min)

> "Para demonstrar a detecção, fixamos propositalmente versões antigas de
> algumas bibliotecas. A esteira detectou vulnerabilidades reais. O achado que
> destacamos:
>
> - **Vulnerabilidade:** CVE-2023-43804.
> - **Componente:** a biblioteca **urllib3** versão 1.26.12.
> - **Problema:** o cabeçalho **Cookie não é removido** ao seguir um
>   redirecionamento para outro domínio — ou seja, tokens de sessão poderiam
>   vazar para um site diferente.
> - **Severidade:** **ALTA (HIGH)**.
> - **Correção:** atualizar o urllib3 para 1.26.17 ou mais novo — na prática,
>   atualizar o `requests` para 2.31+.
>
> No total, o Trivy apontou **8 vulnerabilidades HIGH** nas dependências e mais
> de **50 na imagem**, e o Bandit apontou o uso de bind em todas as interfaces."

# 6. DEMONSTRAÇÃO AO VIVO — *[Integrante 2 conduz, Integrante 3 narra]* (4,5 min)

> "Agora vamos demonstrar a esteira funcionando de ponta a ponta."

**Passo a passo (seguir os 10 itens obrigatórios):**

```bash
cd ~/projetos/techsecure-devsecops
```

1. **Aplicação funcionando** — mostrar no navegador `http://localhost:8080` e:
   ```bash
   curl http://localhost:8080/api/version      # mostra "version":"1.0.0"
   ```

2. **Alteração simples no código** — corrige as vulnerabilidades e muda a versão:
   ```bash
   ./scripts/demo-fix.sh
   ```
   *(Narrar: "estamos atualizando as bibliotecas vulneráveis para versões
   seguras e subindo a versão para 1.0.1".)*

3. **Commit e push:**
   ```bash
   git add -A
   git commit -m "fix: atualiza dependencias vulneraveis (v1.0.1)"
   git push
   ```

4. **Pipeline iniciando automaticamente** — abrir a aba **Actions** no GitHub e
   mostrar a nova execução surgindo sozinha após o push.

5. **Build** — mostrar o job *Build e Testes* rodando.

6. **Teste** — mostrar os testes do pytest passando.

7. **Security scan** — abrir o job *Análise de Segurança*; mostrar que, com as
   dependências corrigidas, **os achados de urllib3/certifi sumiram** do relatório.

8. **Build da imagem** — mostrar o job *Build e Scan da Imagem* construindo a
   imagem e rodando o Trivy.

9. **Deploy** — mostrar o job *Deploy automático* concluindo no runner
   self-hosted.

10. **Aplicação atualizada** — de volta ao terminal:
    ```bash
    curl http://localhost:8080/api/version      # agora mostra "version":"1.0.1"
    ```
    *(Narrar: "o container foi atualizado automaticamente pela esteira — a versão
    mudou de 1.0.0 para 1.0.1 sem nenhuma intervenção manual".)*

> **Plano B (se a internet/Actions falhar):** rodar a esteira localmente com
> `./scripts/run-local-pipeline.sh`, que executa os mesmos estágios no WSL.

# 7. Dificuldades e conclusão — *[Integrante 4]* (1,5 min)

> "Entre as dificuldades: ajustar o Docker no ambiente WSL, resolver um conflito
> de versões entre a ferramenta de segurança e as bibliotecas antigas, e
> configurar o runner self-hosted para o deploy automático.
>
> **Concluindo:** conseguimos uma esteira CI/CD completa com segurança integrada.
> Todo push passa por testes e três camadas de análise de segurança antes do
> deploy. Detectamos vulnerabilidades reais e mostramos o ciclo completo de
> **detecção → correção → verificação automatizada** — exatamente o que a
> TechSecure precisava para reduzir riscos e erros de implantação.
>
> Obrigado! Estamos abertos a perguntas."

# 8. Perguntas — *[Todos]* (1,5 min)

**Perguntas prováveis e respostas rápidas:**

- *"Por que Trivy e Bandit?"* — Bandit analisa o **código** (SAST); Trivy analisa
  **dependências e a imagem** (SCA). Juntos cobrem código + bibliotecas + SO.
- *"O deploy é mesmo automático?"* — Sim; o job `deploy` roda no runner
  self-hosted e sobe o container sem intervenção manual.
- *"A pipeline bloqueia se achar vulnerabilidade?"* — Nesta POC os scans
  **reportam** (não bloqueiam) para fins didáticos; em produção configuraríamos
  `exit-code` para falhar em severidade CRITICAL/HIGH.
- *"Por que a aplicação é tão simples?"* — O foco da atividade é a esteira e a
  segurança, não a complexidade da aplicação.

---

# Checklist pré-apresentação

- [ ] Runner rodando: `cd ~/actions-runner && ./run.sh` (terminal aberto)
- [ ] Container no ar: `docker ps` mostra `techsecure-app (healthy)`
- [ ] Navegador: aba Actions + aba `http://localhost:8080`
- [ ] Versão atual em 1.0.0 (para a demo mudar para 1.0.1)
- [ ] Trabalho escrito (`.docx`) com integrantes preenchidos
- [ ] Todos sabem seus blocos de fala
