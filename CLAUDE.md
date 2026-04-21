# Claude Code - Project Detection & Agent Guide

> Este arquivo ajuda Claude a identificar o tipo de projeto e sugerir os agents/skills apropriados.

---

## Model & Swarm Strategy

### Princípio: Eficiência Máxima
- **Use o modelo mais leve possível** para tarefas operacionais
- **Lance swarms paralelos** para acelerar trabalho independente
- **Reserve modelos pesados** apenas para decisões complexas

### Seleção de Modelo por Tarefa

| Tipo de Tarefa | Modelo | Exemplos de Agents |
|----------------|--------|-------------------|
| Busca de arquivos, lookups simples | `haiku` | `explore`, `architect-low`, `security-reviewer-low`, `researcher-low` |
| Execução de código, dev padrão | `sonnet` | `executor`, `frontend-agent`, `backend-developer`, `code-reviewer` |
| Arquitetura complexa, planejamento | `opus` | `architect`, `planner`, `analyst`, `critic` |

### Padrões de Swarm

```
# Múltiplos arquivos para revisar → spawn revisores paralelos
Task(explore, "find auth files") + Task(explore, "find api routes") + Task(explore, "find tests")

# Validação completa → rodar tudo em paralelo
Task(build-fixer) + Task(security-reviewer-low) + Task(tdd-guide-low)

# Exploração de codebase → múltiplos explores com patterns diferentes
Task(explore, "*.ts in src/") + Task(explore, "*.test.ts") + Task(explore, "*.config.*")
```

### Regras de Ouro
1. **Haiku primeiro** - só escale se a tarefa exigir
2. **Paralelize sempre que possível** - tarefas independentes = swarm
3. **Evite opus para operacional** - reserve para decisões de arquitetura

---

## Como Funciona

### Skills (Automáticas)
Skills são ativadas **automaticamente** baseadas em:
- Palavras-chave no seu prompt (ex: "criar PRD" → skill `prd`)
- Contexto do arquivo sendo editado
- Campo `description` no SKILL.md de cada skill

### Agents (Manuais ou Sugeridos)
Agents precisam ser **chamados explicitamente** ou sugeridos por Claude:
```
Use o agent typescript-pro para revisar este código
```

---

## Project Detection Rules

Ao iniciar trabalho em um projeto, Claude deve verificar estes arquivos para identificar o stack:

### 1. Detect by Config Files

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

### 2. Detect by Directory Structure

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

### 3. Detect by File Content

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

## Suggested Agents by Task Type

### 🆕 Novo Projeto
```
Detectar stack → Sugerir:
- `workflow-orchestrator` para planejar
- `product-manager` para definir escopo
- Agent específico do stack (ex: nextjs-developer)
```

### 🐛 Debugging
```
- `debugger` - Análise geral
- `error-detective` - Investigação de erros
- `performance-engineer` - Problemas de performance
```

### 🔒 Segurança
```
- `security-auditor` - Auditoria geral
- `penetration-tester` - Testes de invasão
- `code-reviewer` - Revisão de código seguro
```

### 📊 Data/ML
```
- `data-engineer` - Pipelines de dados
- `ml-engineer` - Modelos ML
- `data-scientist` - Análise e insights
- `llm-architect` - Sistemas com LLMs
```

### 🏗️ Infraestrutura
```
- `cloud-architect` - Design de cloud
- `kubernetes-specialist` - Containers/K8s
- `terraform-engineer` - IaC
- `devops-engineer` - CI/CD
```

### 📝 Documentação
```
- `documentation-engineer` - Docs técnicos
- `technical-writer` - Documentação geral
- `api-documenter` - API docs
```

### 🔄 Refatoração
```
- `refactoring-specialist` - Refatoração geral
- `legacy-modernizer` - Código legado
- `architect-reviewer` - Revisão de arquitetura
```

---

## Quick Agent Invocation Examples

```markdown
# Chamar agent específico
"Use o agent rust-engineer para otimizar este código"

# Pedir sugestão
"Qual agent devo usar para este projeto React com TypeScript?"

# Multi-agent
"Use o workflow-orchestrator para coordenar a implementação desta feature"

# Revisão
"Peça ao code-reviewer para analisar este PR"
"Use o security-auditor para verificar vulnerabilidades"
```

---

## Skill Activation Keywords

Skills são ativadas automaticamente quando você menciona:

| Keyword/Frase | Skill Ativada |
|---------------|---------------|
| "criar PRD", "escrever requisitos" | `prd` |
| "navegar site", "testar UI" | `dev-browser` |
| "commit", "commitar" | `commit` |
| "desenvolvimento autônomo" | `autonomous-dev` |
| "criar MCP server" | `mcp-builder` |
| "extrair dados financeiros" | `financial-data-extractor` |
| "análise M&A" | `mna-toolkit` |
| "criar apresentação", "montar deck", "fazer slides", "powerpoint" | `presentation` |
| "download video" | `video-downloader` |
| "organizar arquivos" | `file-organizer` |

---

## PowerPoint Templates

93 templates profissionais em `templates-powerpoint/allpowerpointtemplates/` (submodule).
Catalogo completo em `templates-powerpoint/README.md`.

### Quando usar
- Qualquer pedido de apresentacao, deck, slides, powerpoint
- Skill `presentation` e ativada automaticamente

### Categorias disponiveis
- **Corporate/Business** (29): advantage, corporate, company-profile, elevate...
- **General/Multipurpose** (40): ONE, SMPL, nova, porto, segoe...
- **Real Estate** (8): branch-homes, realtor, rosewood...
- **Financial** (7): bridgewater, monex, investments...
- **Marketing/Pitch** (6): pitch-deck, marketing-pitch, trend...
- **Education** (3): training, teaching, learn...

### Fontes padrao
- Lato + Montserrat (maioria), Rooto + Lato, Roboto, Muli - todas no Google Fonts

---

## Project Startup Checklist

Quando iniciar um novo projeto, Claude deve:

1. **Detectar Stack**
   - Verificar arquivos de configuração
   - Identificar linguagens e frameworks

2. **Sugerir Agents**
   - Listar 2-3 agents mais relevantes
   - Explicar quando usar cada um

3. **Identificar Skills Úteis**
   - Listar skills que podem ajudar
   - Explicar ativação automática

4. **Setup Recomendado**
   - Verificar se precisa de `ralph` para loop autônomo
   - Sugerir `prd` se for feature complexa

---

## Workspace Structure

```
~/Claude/                          (source of truth)
├── skills/          → synced to ~/.claude/skills/    (56 categories)
├── agents/          → synced to ~/.claude/agents/    (22 categories)
├── commands/        → synced to ~/.claude/commands/  (26 categories)
├── prompts/         → synced to ~/.claude/prompts/   (41 files)
├── templates-powerpoint/  (submodule: 93 PowerPoint templates)
├── Projetos/              (submodules: 7 repos + agent-orchestrator)
├── _retired/              (skills/commands replaced by AO)
├── docs/                  (reference docs: MCP setup, optimization)
├── scripts/               (sync and automation scripts)
├── agent-orchestrator.yaml (AO config: 7 projects)
├── CATALOG.md             (skills/agents catalog)
└── INDEX.md               (master index)
```

## Agent Orchestrator (AO)

- **CLI**: `ao` (run from `~/Claude/`)
- **Config**: `agent-orchestrator.yaml` (7 projects)
- **Commands**: `ao status`, `ao spawn <project> <issue>`, `ao batch-spawn`, `ao dashboard`
- **Reactions**: auto-responds to CI failures, PR reviews, stuck agents

## MCP Servers (14 total)

- **Core**: github, sequential-thinking, sqlite, time, amem
- **Plugins**: context7, sentry, firecrawl, semgrep, vercel, supabase, firebase, posthog, serena

## Sync Flow

- **Source of truth**: `~/Claude/{skills,agents,commands,prompts}`
- **Deployment target**: `~/.claude/{skills,agents,commands,prompts}`
- **Sync script**: `scripts/sync-all-to-home.sh`
- **Auto-sync**: runs nightly via launchd (23h)
- **Manual sync**: `~/Claude/scripts/sync-all-repos.sh`

## Installed Extensions Summary

- **56 Skill Categories** em `skills/` (synced to `~/.claude/skills/`)
- **22 Agent Categories** em `agents/` (synced to `~/.claude/agents/`)
- **26 Command Categories** em `commands/` (synced to `~/.claude/commands/`)
- **41 Prompt Templates** em `prompts/` (synced to `~/.claude/prompts/`)
- **INDEX.md** catalogo completo

---

*Para ver o catalogo completo: `cat INDEX.md` ou `cat ~/.claude/INDEX.md`*
