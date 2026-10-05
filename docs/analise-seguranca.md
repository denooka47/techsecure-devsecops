# Análise de Segurança — TechSecure Solutions

Este documento apresenta os achados da análise automatizada de segurança
executada pela esteira CI/CD, conforme exigido no item 5 da atividade.

A esteira executa **três camadas** de verificação de segurança:

| Camada | Ferramenta | O que analisa |
|--------|-----------|---------------|
| SAST (código) | **Bandit** | Código-fonte Python em `app/` |
| SCA (dependências) | **pip-audit** e **Trivy (fs)** | Pacotes em `requirements.txt` |
| Imagem de container | **Trivy (image)** | Pacotes Python + SO da imagem Docker |

---

## Achado principal (destacado para a apresentação)

### 🔴 CVE-2023-43804 — urllib3: vazamento do cabeçalho Cookie em redirecionamentos cross-origin

| Campo | Valor |
|-------|-------|
| **Vulnerabilidade** | CVE-2023-43804 — o cabeçalho `Cookie` não é removido ao seguir um redirecionamento HTTP para outra origem (cross-origin). |
| **Componente afetado** | `urllib3` versão **1.26.12** (dependência transitiva de `requests`). |
| **Severidade** | **HIGH** (Alta) |
| **Detectado por** | Trivy (filesystem e imagem) e pip-audit |
| **Impacto** | Se a aplicação faz uma requisição a um servidor que responde com redirect para outro domínio, os cookies (que podem conter tokens de sessão/autenticação) são reenviados para o domínio de destino, permitindo roubo de credenciais/sessão. |
| **Correção / Mitigação** | Atualizar `urllib3` para **>= 1.26.17** (ou **2.0.6**). Na prática, atualizar `requests` para **>= 2.31.0**, que já exige uma versão corrigida de `urllib3`. |

**Como a esteira detectou (trecho real do relatório Trivy):**

```
│ urllib3 │ CVE-2023-43804 │ HIGH │ 1.26.12 │ 2.0.6, 1.26.17 │
│ python-urllib3: Cookie request header isn't stripped during cross-origin redirects │
```

---

## Demais achados relevantes

### 🔴 CVE-2023-37920 — certifi: certificado raiz e-Tugra removido

| Campo | Valor |
|-------|-------|
| **Vulnerabilidade** | CVE-2023-37920 — o pacote `certifi` ainda confia na autoridade certificadora **e-Tugra**, cujo root foi removido por questões de segurança. |
| **Componente afetado** | `certifi` versão **2022.9.24**. |
| **Severidade** | **HIGH** (Alta) |
| **Detectado por** | Trivy (fs e imagem) |
| **Correção / Mitigação** | Atualizar `certifi` para **>= 2023.7.22**. |

### 🟠 Bandit B104 — bind em todas as interfaces (SAST)

| Campo | Valor |
|-------|-------|
| **Achado** | B104 `hardcoded_bind_all_interfaces` — a aplicação faz `app.run(host="0.0.0.0")`, expondo o servidor em todas as interfaces de rede. |
| **Componente afetado** | `app/main.py`, linha 58 (bloco `__main__` de desenvolvimento). |
| **Severidade** | **MEDIUM** (CWE-605) |
| **Detectado por** | Bandit (SAST) |
| **Observação / Mitigação** | Em produção a aplicação roda via **gunicorn** (não por esse bloco). O bind em `0.0.0.0` é necessário dentro do container para expor a porta, porém o container é publicado apenas na porta mapeada e roda como usuário não-root. Mitigação formal: anotar com `# nosec B104` justificando, ou restringir o host via variável de ambiente. |

### 🔴 CVE-2025-47273 — setuptools: Path Traversal

| Campo | Valor |
|-------|-------|
| **Componente** | `setuptools` 70.3.0 (presente na imagem base Python). |
| **Severidade** | **HIGH** |
| **Correção** | Atualizar `setuptools` para **>= 78.1.1** (ex.: `pip install --upgrade setuptools` no Dockerfile). |

### Vulnerabilidades do sistema operacional da imagem base

O scan da imagem (`trivy image`) também apontou **45 vulnerabilidades HIGH** em
pacotes do SO (Debian 13) da imagem `python:3.12-slim`, como `util-linux`,
`libsystemd0`, `ncurses` e `perl-base`. Mitigação: manter a imagem base
atualizada (`docker pull python:3.12-slim` periodicamente) e, quando houver
correção publicada, reconstruir a imagem; usar imagens menores (ex.:
`-alpine` ou *distroless*) reduz a superfície de ataque.

---

## Resumo quantitativo (execução real da esteira)

| Ferramenta / alvo | Total | HIGH | CRITICAL |
|-------------------|-------|------|----------|
| Trivy — `requirements.txt` (fs) | 8 | 8 | 0 |
| Trivy — imagem (SO Debian) | 45 | 45 | 0 |
| Trivy — imagem (pacotes Python) | 12 | 12 | 0 |
| Bandit — código Python | 1 | — | — (1 MEDIUM) |

---

## Correção aplicada na demonstração

Na demonstração em sala (passo "alteração simples no código"), as dependências
vulneráveis são atualizadas em `requirements.txt`:

```diff
- requests==2.28.1
- urllib3==1.26.12
- certifi==2022.9.24
+ requests==2.32.4
+ urllib3==2.2.2
+ certifi==2024.8.30
```

Após o `commit` + `push`, a esteira roda novamente e os achados de
`urllib3`/`certifi`/`requests` **desaparecem** do relatório, comprovando o
ciclo DevSecOps de detecção → correção → verificação automatizada.
