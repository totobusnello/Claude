# Claude Code Workspace — System Paper

**Autor:** Toto (totobusnello)
**Data de consolidação:** 2026-04-24
**Versão:** 1.0
**Claude Code version:** 2.1.119
**Repositório:** https://github.com/totobusnello/Claude

> Paper técnico do setup completo do workspace Claude Code — arquitetura, componentes, decisões, evolução e roadmap. Documento-referência pra continuidade entre sessões e onboarding futuro.

---

## Sumário executivo

Setup multi-camada que transforma o Claude Code CLI numa plataforma de automação pessoal completa, cobrindo:

- **58 categorias de skills** (expertise pacotada por domínio)
- **173 agents especializados** (Python/Rust/Go/frontend/cloud/etc)
- **14 plugins ativos** (core infrastructure)
- **11 MCP servers** em uso
- **3 hooks customizados** (PermissionRequest, SubagentStart, SessionStart)
- **7 projetos ativos** orquestrados via Agent Orchestrator (`ao`)
- **VPS complementar** (OpenClaw + nox-mem) — não coberto neste paper

Setup segue filosofia **"source-of-truth em `~/Claude/`"**: tudo versionado em git, sincronizado via rsync pra `~/.claude/` (onde o CLI lê), auto-sync noturno via launchd.

---

## Arquitetura em camadas

```
┌──────────────────────────────────────────────────────────────┐
│                   Claude Code CLI (2.1.119)                  │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │   Plugins    │  │     Hooks     │  │  Slash Cmds    │   │
│  │  (14 active) │  │  (3 custom)   │  │  (local + pl.) │   │
│  └──────────────┘  └───────────────┘  └────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │    Skills    │  │    Agents     │  │  MCP Servers   │   │
│  │  (58 cats)   │  │  (173, model  │  │   (11 used)    │   │
│  │              │  │  -routed)     │  │                │   │
│  └──────────────┘  └───────────────┘  └────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                             │
                  read from ~/.claude/
                             │
           ┌─────────────────┴─────────────────┐
           │     ~/.claude/ (deployment)        │
           └─────────────────┬─────────────────┘
                             │
                  rsync sync-all-to-home.sh
                             │
           ┌─────────────────┴─────────────────┐
           │      ~/Claude/ (source of truth)   │
           │                                    │
           │  skills/  agents/  commands/       │
           │  hooks/   prompts/  scripts/       │
           │  Projetos/ docs/   .claude/        │
           └────────────────────────────────────┘
                             │
                       (git push)
                             │
          ┌──────────────────┴──────────────────┐
          │    github.com/totobusnello/Claude   │
          └─────────────────────────────────────┘
```

**Fluxo de mutação:**
1. Edit em `~/Claude/*`
2. `bash ~/Claude/scripts/sync-all-to-home.sh` (manual ou launchd 23h)
3. rsync `--delete` → `~/.claude/`
4. `/reload-plugins` ou próxima sessão aplica

---

## Componentes detalhados

### 1. Skills (58 categorias)

Skills são pacotes de expertise acionáveis por keyword. Cada `SKILL.md` tem frontmatter:

```yaml
---
name: skill-name
description: Quando o Claude deve invocar isto (prefixo "Use when...")
allowed-tools: [opcional, YAML list]
---
```

**Categorias principais:**
- `memory/` — A-MEM server, memory-recompile, agent-memory-mcp
- `marketing/` — SEO, CRO, email, content (35+ skills)
- `browser-automation/` — playwright-skill, agent-browser, browser-extension-builder
- `testing/` — tdd-guide, debugging-wizard, test-master, chaos-engineer
- `backend/` — django, fastapi, nestjs, rails, laravel, spring-boot
- `engineering/` — architecture-designer, code-reviewer, graphql-architect
- `autonomous-dev/`, `autonomous-loop/` — self-driven workflows
- `ui-styling/`, `design-system/`, `brand/` — UI/visual
- `mcp-tools/` — mcp-builder, skill-creator, artifacts-builder

**Deployment path:** `~/.claude/skills/` (symlink-free copy via rsync).

### 2. Agents (173 agents)

Agents são personas especializadas invocáveis via `Task(subagent_type, ...)` ou `"Use o agent X"`.

**Organização em 10 categorias:**
1. `01-core-development/` — api-designer, backend-developer, fullstack, frontend
2. `02-language-specialists/` — python-pro, rust-engineer, typescript-pro, angular-architect...
3. `03-infrastructure/` — cloud-architect, kubernetes-specialist, devops-engineer
4. `04-quality-security/` — code-reviewer, security-auditor, penetration-tester, qa-expert
5. `05-data-ai/` — data-engineer, ml-engineer, llm-architect, nlp-engineer
6. `06-developer-experience/` — powershell-module-architect, build-engineer, dx-optimizer
7. `07-specialized-domains/` — fintech-engineer, quant-analyst, blockchain, gamedev
8. `08-business-product/` — product-manager, business-analyst, ux-researcher
9. `09-meta-orchestration/` — workflow-orchestrator, multi-agent-coordinator
10. `10-research-analysis/` — research-analyst, market-researcher, trend-analyst

**Routing por modelo** (CLAUDE.md policy):
- `haiku` — exploração, lookups simples, *-low variants
- `sonnet` — dev padrão, execução, review (default)
- `opus` — arquitetura, planning, análise estratégica, coordinators

Em 2026-04-24 adicionamos `model:` frontmatter em **128 agents** que não tinham (22 opus + 106 sonnet). Cobertura antes: 25%. Cobertura depois: 100%.

### 3. Plugins (14 ativos de 87 instalados)

Plugins injetam skills/commands/hooks via `~/.claude/plugins/cache/<marketplace>/<name>/<version>/`.

**Ativos atualmente:**

| Plugin | Função | Uso real (transcripts) |
|---|---|---|
| `context-mode` | Compressão de output gigante via sandbox | 443 MCP calls |
| `chrome-devtools-mcp` | Browser automation | 220 MCP calls |
| `telegram` | Bot 24/7 no VPS | 30 calls |
| `superpowers` | TDD, debugging, handoff discipline | 7 skills |
| `claude-mem` | Memória cross-session | 6 calls |
| `github` | PR/issue ops | 2 calls |
| `frontend-design` | UI intelligence | 1 call |
| `claude-hud` | Statusline visual | UI passiva |
| `remember` | Session-start continuity | hook silent |
| `commit-commands` | `/commit`, `/commit-push-pr` | slash cmds |
| `claude-md-management` | `/revise-claude-md` | manual |
| `claude-code-setup` | `/claude-automation-recommender` | 1× hoje |
| `ui-ux-pro-max` | 161 regras + 67 estilos de design | manual |
| `feature-dev` | Workflow 7-fases pra features grandes | manual |

**Desabilitados em 2026-04-24:** 22 plugins zero-usage em 1.269 transcripts (sentry, firebase, firecrawl, vercel, ralph-loop, hookify, playground, plannotator, skill-creator, plugin-dev, code-review, typescript-lsp, pyright-lsp, semgrep — principal culpado de context bloat — learning-output-style, context7).

### 4. MCP Servers

Context-mode enumeration ordena por uso real:

| Server | Calls | Função |
|---|---|---|
| `plugin_context-mode` | 443+ | Sandbox output, fetch+index, search |
| `plugin_chrome-devtools` | 220+ | Browser lifecycle + a11y + screenshots |
| `plugin_telegram` | 30+ | Reply/download/react |
| `claude_ai_Notion` | 44+ | Notion pages/search/fetch |
| `plugin_claude-mem` | 5+ | Memory search across sessions |
| `plugin_github` | 2 | File contents |

**Dormentes candidatos a remoção:** sqlite, time, sequential-thinking, supabase, firebase, posthog, serena, context7 — zero calls em 1.269 transcripts.

### 5. Hooks customizados (`~/Claude/hooks/`)

Registrados em `~/Claude/.claude/settings.json`:

**`PermissionRequest` hook** (`hooks/permission-auto.mjs`, 170 linhas):
- Intercepta tool permission requests
- **Allow rules:** git read-ops, gh read-ops, docker read-ops, safe utilities (`ls, cat, grep, rg, mkdir, open`), Read/Glob/Grep nativos, MCP tools `*_search|*_read|*_get|*_fetch`, Write/Edit dentro de `~/Claude`
- **Deny rules:** `rm -rf /`, `sudo rm -rf`, `curl|bash`, fork bombs, `git reset --hard origin/main`, `mkfs`, writes em `/etc /usr /System`
- **Ask fallback:** não-classificado → permission flow normal

**`SubagentStart` hook** (`hooks/subagent-start.mjs`, 94 linhas):
- Filtra por pattern de nome: `architect|planner|analyst|critic|orchestrator|coordinator|researcher|strategist|advisor|reviewer`
- Injeta session brief compacto (~400 tokens): branch atual, últimos 5 commits, áreas modificadas (top 3), mapa de seções do CLAUDE.md
- No-op pra light agents (explore, executor, writer)
- Economia esperada: 2-3 tool calls iniciais por invocação opus

**SessionStart hook** (global `~/.claude/settings.json`):
- Carrega `~/.claude/memory/core-memory.json` no turn zero
- User profile + preferences + project context injection

### 6. Permission allowlist

`~/.claude/settings.json` `permissions.allow` — **174 entries** após limpeza:
- Wildcards `Bash(cmd:*)` ou `Bash(cmd *)` cobrindo git/npm/pnpm/node/python/ssh/gh/ao/etc
- MCP tools explicitamente alowlisted
- Native tools `Edit, Write, Read, Glob, Grep, Agent, WebFetch, WebSearch`
- Protected literals (`Bash(BUTTONDOWN_API_KEY=...)` — preservado por request do user)
- `defaultMode: "dontAsk"` — auto-approve só o allowlisted, sem prompts

`~/Claude/.claude/settings.json` (project scope) — 7 extras: ctx-mode MCP family, `Bash(graphify:*)`, `Bash(mkdir:*)`, `Bash(open:*)`.

### 7. Slash commands (27 categorias)

Local (em `~/Claude/commands/`): `/handoff`, `/handoff-continue`, `/learn`, `/spec-elicitation`, + namespaced dirs (`/context:*`, `/dev:*`, `/test:*`, `/deploy:*`, `/security:*`, `/performance:*`, `/visual:*`, `/team:*`, `/sync:*`, `/rust:*`, `/svelte:*`, `/skills:*`, `/simulation:*`, `/boundary:*`, `/reasoning:*`, `/semantic:*`, `/wfgy:*`, `/project:*`, `/ship:*`, `/spec-workflow:*`).

Plugin-provided: `/commit*`, `/revise-claude-md`, `/feature-dev`, `/claude-automation-recommender`, `/ui-ux-pro-max`, `/tauri:*`, `/ralph-loop`, `/hookify`, + muitos via superpowers.

### 8. Agent Orchestrator (AO)

- **CLI:** `ao` global (pnpm link), roda de `~/Claude/`
- **Config:** `~/Claude/agent-orchestrator.yaml` — 7 projetos: Granix-App, Frooty, GalapagosApp, Future-Farm, daily-tech-digest, Area-Campolim-Sorocaba, Area-Manuel_Nobrega
- **Comandos:** `ao status`, `ao spawn <project> <issue>`, `ao batch-spawn`, `ao dashboard` (:3000), `ao send <session> "msg"`
- **Auto-reactions:** CI failures, PR reviews, stuck agents → spawn recovery
- **Stack:** tmux sessions + Node 20+

---

## Decisões arquiteturais (ADRs implícitas)

### ADR-001: Source-of-truth em `~/Claude/`, não `~/.claude/`
**Contexto:** `~/.claude/` é onde o CLI lê, mas também onde plugins escrevem caches, logs, transcripts efêmeros.
**Decisão:** Versionar o que é *conteúdo* (skills/agents/commands/prompts/hooks/scripts/docs) em `~/Claude/`, sincronizar pra `~/.claude/` via rsync.
**Consequência:** git histórico limpo, sync script é trivial, rollback é `git revert`.

### ADR-002: Plugin disabled por default, enabled por evidência de uso
**Contexto:** Marketplace oficial tem 80+ plugins, tentação de ativar tudo.
**Decisão:** Ativar só plugins com evidência documentada de uso (transcripts ≥ 1 call ou utility clara).
**Consequência:** 29 → 14 enabled (2026-04-24). Startup mais rápido, menos context bloat, menos hooks firing.

### ADR-003: Hooks customizados em `~/Claude/hooks/`, wired em project `.claude/settings.json`
**Contexto:** Hooks poderiam ir em user settings, mas ficam invisíveis ao git.
**Decisão:** Scripts em `hooks/` (versionado), wiring em project `.claude/settings.json` (gitignored mas colável).
**Consequência:** Hooks reviewable no git, reinstaláveis rapidamente em outro setup.

### ADR-004: Modelo por agent via `model:` frontmatter
**Contexto:** Sem `model:`, todos os agents rodavam no modelo da sessão principal (geralmente Sonnet ou Opus).
**Decisão:** Classificar cada agent por tipo de trabalho (haiku/sonnet/opus) e declarar explicitamente.
**Consequência:** 3-5× redução de custo em workflows que usam agents de forma pesada (explore, review, code-generation).

### ADR-005: `/learn` substitui learning-output-style deprecated
**Contexto:** CC 2.0.30 deprecou output styles. Plugin funciona mas quebra no futuro.
**Decisão:** Comportamento migrado pra slash command `/learn` com on/off toggle.
**Consequência:** Forward-compatible; plugin pode ser removido quando quebrar upstream.

### ADR-006: PermissionRequest hook complementa allowlist
**Contexto:** Allowlist de 211 entries tava crescendo com literais one-off.
**Decisão:** Hook scripted intercepta antes do allowlist. Allow pattern-based, deny footguns, ask fallback.
**Consequência:** Allowlist fica enxuto. Hook absorve novos casos sem edit de settings.

### ADR-007: CLAUDE.md compacto + `docs/project-detection-guide.md` on-demand
**Contexto:** CLAUDE.md carrega em todo turn. 313 linhas = cache prefix hit mais curto.
**Decisão:** Root CLAUDE.md só com policy (Model Strategy, Collaboration Style, essentials). Detection tables + catálogos em `docs/`.
**Consequência:** CLAUDE.md 313 → 76 linhas. Melhor cache hit rate no prompt prefix.

---

## Evolução — timeline da sessão de consolidação (2026-04-24)

Sessão única de auditoria e otimização disparada por `/plugin install claude-code-setup` + skill `claude-setup-optimizer`.

| Commit | Tema | Impacto |
|---|---|---|
| `32f0212` | Fix 4 skills quebradas + dedup 13 duplicatas | -20k linhas, loader funciona |
| `de4441c` | `model:` frontmatter em 128 agents | 100% routing coverage |
| `581c169` | PermissionRequest hook | Allowlist complementada |
| `b0013e6` | SubagentStart hook | Session brief injection |
| `fea19b6` | `/learn` command | Output style deprecated migrated |
| `5a4991f` | `purge-disabled-plugins.py`, `uninstall-disabled-plugins.sh` | Tooling |
| `00609fd` | Merge cleanup branch | Main consolidated |
| `14137e7` | Purge script fix (true orphans, not disabled) | 181 MB disk freed |
| `7f4618d` | Allowlist cleaner + `.remember/` gitignored | 211 → 174 entries |
| `6e969d8` | CLAUDE.md slim (313 → 76) | Cache-friendly prompt |
| `(este)` | SYSTEM-PAPER-2026-04-24.md | Documentação consolidada |

**Métricas acumuladas:**
- 9 commits (+ este)
- 249 arquivos tocados
- −20.2k linhas líquidas
- 181 MB disco liberado
- 58 plugins órfãos purgados
- 22 plugins desabilitados (29 → 14 enabled)
- 128 agents ganharam routing
- 13 skills duplicadas resolvidas
- 4 skills quebradas reparadas
- 37 entradas tóxicas removidas do allowlist
- 5 .zip artefatos limpados
- 3 hooks customizados novos
- 1 slash command novo (`/learn`)

---

## Operação & manutenção

### Comandos rotineiros

```bash
# Sync manual pós-edit
bash ~/Claude/scripts/sync-all-to-home.sh

# Reload plugins sem reiniciar
/reload-plugins  (dentro do CC)

# Purge plugin cache órfão
python3 ~/Claude/scripts/purge-disabled-plugins.py --dry-run
python3 ~/Claude/scripts/purge-disabled-plugins.py

# Limpeza de allowlist
python3 ~/Claude/scripts/clean-allowlist.py --dry-run
python3 ~/Claude/scripts/clean-allowlist.py

# AO operations
ao status
ao spawn <project> <issue>
ao dashboard  (port 3000)
```

### Backups automáticos

- `~/.claude/settings.json.bak-*` — snapshots antes de mudanças críticas
- `~/.claude/plugins/installed_plugins.json.bak-*` — snapshot pré-purge
- git é o backup primário do código/config versionado

### Auto-sync

launchd schedule nightly às 23h — executa `~/Claude/scripts/sync-all-to-home.sh`.

Verify: `launchctl list | grep claude`

---

## Stack complementar — VPS (não detalhada aqui)

Setup separado mas conectado:
- **VPS:** Hostinger KVM 4, Tailscale 100.87.8.44 / pública 187.77.234.79
- **Services:** openclaw-gateway (:18789), nox-mem-watcher, nox-mem-api (:18800), tailscaled
- **Stack:** SQLite FTS5 + sqlite-vec + Gemini embeddings (3072d) + hybrid search (BM25+vector+RRF) + KG v2 (LLM extraction)
- **874 chunks** workspace + 607 across 6 agent DBs = **1.481 total memórias**
- **MCP Server:** 14 tools via JSON-RPC 2.0 stdio
- **Dashboard:** 4 páginas em agent-hub-dashboard
- **Paper dedicado:** `Projetos/memoria-nox/paper-tecnico-nox-mem.docx`

Telegram bot 24/7 roda no VPS via tmux + systemd (não no Mac).

---

## Roadmap & itens abertos

### Curto prazo (próxima sessão)
1. **Validar hooks em sessão nova** — `PermissionRequest` e `SubagentStart` nunca foram testados live. Confirmar firing correto.
2. **MCP server audit ativo** — desabilitar sqlite/time/sequential-thinking/supabase/firebase/posthog/serena se confirmado zero-usage.
3. **`skills:` frontmatter em agents** — feature v2.0.43, auto-load skills por agent. 20-40 min trabalho.

### Médio prazo
4. **`memory:` frontmatter em opus agents** — persistência cross-session por agente.
5. **Verificar se `/revise-claude-md` consegue encolher mais** — CLAUDE.md tá em 76 linhas, talvez sobrou redundância.
6. **Subdirs em `skills/marketing/`** — 35+ skills flat, subdivide em cro/, email/, seo/, content/.

### Longo prazo / experimental
7. **Agent Teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, v2.1.32) — multi-agent collab nativo. Token-intensive, testar num dia de exploração.
8. **PostCompact hook** — snapshot útil pré-compact.
9. **Plugin custom próprio** — `plugin-dev` + `skill-creator` estão prontos quando precisar.

---

## Referências internas

- `~/Claude/README.md` — entry point do repo
- `~/Claude/CLAUDE.md` — policy essencial (ativa em todo turn)
- `~/Claude/docs/project-detection-guide.md` — detection tables + catálogos
- `~/Claude/docs/claude-setup-optimization-2026-04-24.md` — auditoria inicial desta sessão
- `~/Claude/INDEX.md` — catálogo master
- `~/Claude/CATALOG.md` — skills/agents
- `~/Claude/hooks/permission-auto.mjs` — hook de permissões
- `~/Claude/hooks/subagent-start.mjs` — hook de session brief
- `~/Claude/scripts/sync-all-to-home.sh` — deployment pipeline
- `~/Claude/agent-orchestrator.yaml` — config dos 7 projetos

---

## Referências externas

- Claude Code docs: https://code.claude.com/docs
- Claude Code changelog: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- Plugin marketplace: `/plugin marketplace list`
- Repo deste setup: https://github.com/totobusnello/Claude

---

**Fim do paper.** Para acréscimos ou correções futuras, crie nova versão: `docs/SYSTEM-PAPER-YYYY-MM-DD.md` e mantenha esta como baseline.
