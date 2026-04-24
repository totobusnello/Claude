# Project Detection & Agent Recommendation Guide

> Extracted from CLAUDE.md to keep the root CLAUDE.md compact.
> Reference this when Claude is opening a new project and needs to pick the right agent/skill.

---

## Detect by Config Files

| Arquivo | Stack Detectado | Agents Recomendados |
|---------|-----------------|---------------------|
| `package.json` | Node.js/JavaScript | `javascript-pro`, `typescript-pro` |
| `tsconfig.json` | TypeScript | `typescript-pro` |
| `next.config.js` | Next.js | `nextjs-developer`, `react-specialist` |
| `vite.config.ts` | Vite + React/Vue | `react-specialist` ou `vue-expert` |
| `angular.json` | Angular | `angular-architect` |
| `nuxt.config.ts` | Nuxt.js | `vue-expert` |
| `requirements.txt` | Python | `python-pro` |
| `pyproject.toml` | Python (modern) | `python-pro` |
| `Cargo.toml` | Rust | `rust-engineer` |
| `go.mod` | Go | `golang-pro` |
| `pom.xml` | Java/Maven | `java-architect` |
| `build.gradle` | Java/Gradle | `java-architect`, `kotlin-specialist` |
| `Gemfile` | Ruby | `rails-expert` |
| `composer.json` | PHP | `php-pro`, `laravel-specialist` |
| `pubspec.yaml` | Flutter/Dart | `flutter-expert` |
| `Dockerfile` | Containers | `devops-engineer`, `kubernetes-specialist` |
| `terraform/` | IaC | `terraform-engineer`, `cloud-architect` |
| `kubernetes/` ou `k8s/` | K8s | `kubernetes-specialist` |
| `.github/workflows/` | CI/CD | `devops-engineer` |

## Detect by Directory Structure

| Diretório | Tipo de Projeto | Agents Recomendados |
|-----------|-----------------|---------------------|
| `src/components/` | Frontend React/Vue | `frontend-developer`, `react-specialist` |
| `src/app/` (Next.js) | Next.js App Router | `nextjs-developer` |
| `pages/` | Next.js/Nuxt Pages | `nextjs-developer`, `vue-expert` |
| `api/` ou `routes/` | Backend API | `backend-developer`, `api-designer` |
| `prisma/` | Prisma ORM | `database-administrator`, `typescript-pro` |
| `migrations/` | Database migrations | `database-administrator` |
| `tests/` ou `__tests__/` | Testing | `qa-expert`, `test-automator` |
| `docs/` | Documentation | `documentation-engineer`, `technical-writer` |
| `infra/` | Infrastructure | `cloud-architect`, `terraform-engineer` |
| `ml/` ou `models/` | Machine Learning | `ml-engineer`, `data-scientist` |
| `notebooks/` | Data Science | `data-scientist`, `data-analyst` |

## Detect by File Content

| Pattern no Código | Stack | Agents Recomendados |
|-------------------|-------|---------------------|
| `import React` | React | `react-specialist` |
| `from fastapi` | FastAPI | `fastapi-expert`, `python-pro` |
| `from django` | Django | `django-developer` |
| `@nestjs/` | NestJS | `nestjs-expert` |
| `import express` | Express.js | `backend-developer` |
| `import torch` | PyTorch | `ml-engineer` |
| `import tensorflow` | TensorFlow | `ml-engineer` |
| `import pandas` | Data Analysis | `data-analyst`, `python-pro` |
| `import boto3` | AWS | `cloud-architect` |
| `@azure/` | Azure | `azure-infra-engineer` |

---

## Agents by Task Type

### 🆕 Novo Projeto
- `workflow-orchestrator` para planejar
- `product-manager` para definir escopo
- Agent específico do stack (ex: `nextjs-developer`)

### 🐛 Debugging
- `debugger` - Análise geral
- `error-detective` - Investigação de erros
- `performance-engineer` - Problemas de performance

### 🔒 Segurança
- `security-auditor` - Auditoria geral
- `penetration-tester` - Testes de invasão
- `code-reviewer` - Revisão de código seguro

### 📊 Data/ML
- `data-engineer` - Pipelines de dados
- `ml-engineer` - Modelos ML
- `data-scientist` - Análise e insights
- `llm-architect` - Sistemas com LLMs

### 🏗️ Infraestrutura
- `cloud-architect` - Design de cloud
- `kubernetes-specialist` - Containers/K8s
- `terraform-engineer` - IaC
- `devops-engineer` - CI/CD

### 📝 Documentação
- `documentation-engineer` - Docs técnicos
- `technical-writer` - Documentação geral
- `api-documenter` - API docs

### 🔄 Refatoração
- `refactoring-specialist` - Refatoração geral
- `legacy-modernizer` - Código legado
- `architect-reviewer` - Revisão de arquitetura

---

## Skill Activation Keywords

Skills ativam automaticamente quando mencionadas:

| Keyword/Frase | Skill |
|---------------|-------|
| "criar PRD", "escrever requisitos" | `prd` |
| "navegar site", "testar UI" | `dev-browser` |
| "commit", "commitar" | `commit` |
| "desenvolvimento autônomo" | `autonomous-dev` |
| "criar MCP server" | `mcp-builder` |
| "extrair dados financeiros" | `financial-data-extractor` |
| "análise M&A" | `mna-toolkit` |
| "criar apresentação", "fazer slides", "powerpoint" | `presentation` |
| "download video" | `video-downloader` |
| "organizar arquivos" | `file-organizer` |

---

## PowerPoint Templates (93 disponíveis)

Submódulo em `templates-powerpoint/allpowerpointtemplates/`. Catálogo completo em `templates-powerpoint/README.md`. Skill `presentation` ativa automaticamente em qualquer pedido de deck/apresentação/slides.

**Categorias:** Corporate/Business (29), General/Multipurpose (40), Real Estate (8), Financial (7), Marketing/Pitch (6), Education (3).

**Fontes padrão:** Lato + Montserrat (maioria), Rooto, Roboto, Muli — todas no Google Fonts.

---

## Project Startup Checklist

1. **Detectar Stack** — verificar config files + estrutura
2. **Sugerir 2-3 agents** mais relevantes
3. **Listar skills úteis** (ativação automática)
4. **Recomendar setup** (`ralph` pra loops autônomos, `prd` pra features complexas)

---

## Workspace Structure

```
~/Claude/                   (source of truth, git root)
├── skills/      → synced to ~/.claude/skills/     (59 categorias)
├── agents/      → synced to ~/.claude/agents/     (10 categorias)
├── commands/    → synced to ~/.claude/commands/   (27 categorias)
├── prompts/     → synced to ~/.claude/prompts/    (41 arquivos)
├── hooks/       (PermissionRequest, SubagentStart scripts)
├── templates-powerpoint/  (submodule: 93 templates)
├── Projetos/              (submodules: 7 repos + AO)
├── docs/                  (reference docs, auditorias)
├── scripts/               (sync + cleanup automation)
└── agent-orchestrator.yaml (AO: 7 projetos configurados)
```

---

## Agent Orchestrator (AO)

- CLI: `ao` (rodar de `~/Claude/`)
- Config: `agent-orchestrator.yaml` (7 projetos)
- Commands: `ao status`, `ao spawn <project> <issue>`, `ao batch-spawn`, `ao dashboard`
- Reage a: CI failures, PR reviews, stuck agents

---

## MCP Servers (heavy use, auditado 2026-04-24)

- **Heavy:** `context-mode` (443+), `chrome-devtools-mcp` (220+), `telegram` (30+)
- **Médio:** `claude-mem`, `github`, `notion`
- **Dormente (considerar desabilitar):** sqlite, time, sequential-thinking, supabase, firebase, posthog, serena — zero calls em 1.269 transcripts

---

## Sync Flow

- **Source:** `~/Claude/{skills,agents,commands,prompts}`
- **Target:** `~/.claude/{...}` via `scripts/sync-all-to-home.sh`
- **Auto-sync:** launchd nightly (23h)
- **Manual:** `~/Claude/scripts/sync-all-repos.sh`
