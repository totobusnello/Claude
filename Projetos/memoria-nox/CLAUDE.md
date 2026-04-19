# memoria-nox — Projeto de Memória Inteligente para OpenClaw

## O que é este repo

Documentação, specs, plans e paper técnico do sistema de memória **nox-mem** (v3.0.0, deployado na VPS) e do produto comercial **NOX-Supermem** (em desenvolvimento no repo `nox-supermem`).

## Estrutura

```
memoria-nox/
├── specs/
│   ├── 2026-03-14-nox-memory-system-design.md       — Spec técnico do nox-mem
│   ├── 2026-04-12-self-evolving-hooks.md            — Spec: feedback loop automático (hooks)
│   └── (2026-03-14-nox-supermem-produto-design.md   — movido para nox-supermem/)
├── plans/
│   ├── 2026-03-14-nox-memory-system.md               — Plan técnico (executado)
│   └── (2026-03-14-nox-supermem-produto.md           — movido para nox-supermem/)
├── audits/
│   ├── audit-2026-04-08-stability.md                 — Audit de estabilidade VPS
│   ├── audit-2026-04-08-live-vps.md                  — Audit live da VPS
│   └── hardening-report-2026-04-08.md                — Relatório de hardening
├── paper-tecnico-nox-mem.md                           — Paper técnico completo (12 seções)
├── paper-tecnico-nox-mem.docx                         — Versão Word do paper
└── .claude/CLAUDE.md                                  — Este arquivo
```

## Sistema nox-mem v3.3 (deployado 2026-03-23, hardened 2026-03-31, Tier 0+1 fixes 2026-04-18)

- **VPS:** ssh root@187.77.234.79 (público) / ssh root@100.87.8.44 (Tailscale), Hostinger KVM 4
- **Path:** `/root/.openclaw/workspace/tools/nox-mem/`
- **Stack:** TypeScript, better-sqlite3, FTS5, sqlite-vec, Gemini embeddings (3072d), inotifywait, systemd
- **OpenClaw:** v2026.3.31 (binário, requer Node.js 22.12+)
- **Node.js:** v22.22.2 com wrapper `--no-warnings` em `/usr/bin/node` (suprime DEP0040 punycode que causava crash loop)
- **RelayPlane:** v1.8.37 (proxy inteligente de roteamento AI, atualizado 2026-03-31)

### Schema v3
- `chunks` + `chunks_fts` (FTS5 porter unicode61) — **1,951 chunks**
- `consolidated_files` — 18 done, 0 failed
- `meta` — key-value config
- `vec_chunks` + `vec_chunk_map` — sqlite-vec embeddings (**1,951 / 1,951 = 100% coverage** pós re-embed 2026-04-18)
- `kg_entities` (~371) + `kg_relations` (~500) — Knowledge Graph v2 (Gemini 2.5 Flash extraction, migrado 2026-04-11)
- `decision_versions` — tracked decisions
- `dedup_log` — duplicate audit trail
- `reflect_cache` — Gemini Flash synthesis cache (TTL 24h, colunas `hit_count` + `last_hit_at` 2026-04-18)
- **Trigger `trg_chunks_delete_cascade`** — AFTER DELETE ON chunks limpa vec_chunks + vec_chunk_map (previne órfãos, instalado 2026-04-18)

### Hybrid Search (default, 3 camadas — semantic restaurada 2026-04-18)
- Layer 1: FTS5 BM25 (keyword, type boost 2x, recency 1.5x) → `match_type: "fts"`
- Layer 2: Gemini semantic (gemini-embedding-001, 3072d, sqlite-vec) → `match_type: "semantic"`
- Layer 3: RRF fusion (k=60, content dedup) → tag `[hybrid]`
- sqlite-vec carrega via `loadVecSafe()` em embed.js (path direto + fallback)
- **Atenção:** entre ~mar/2026 e 2026-04-18 a Layer 2 estava silenciosamente quebrada (0 embeddings vivos, todos vec_chunk_map órfãos). Search devolvia [hybrid] mas era 100% BM25. Fix no Tier 1 2026-04-18.

### Knowledge Graph v2
- ~371 entidades, ~500 relações, 11 tipos (project, tool, concept, person, org, agent, etc.)
- LLM extraction via Gemini 2.5 Flash (migrado de Ollama 2026-04-11, thinkingBudget:0, JSON schema nativo)
- TTL: 90 dias, confidence decay -0.1/30d, prune threshold 0.3
- Graph traversal: BFS path finding entre entidades

### CLI (25+ comandos)
`search/ingest/reindex/primer/stats/consolidate/retry-failed/digest/sync-notion/doctor`
`vectorize/kg-stats/kg-query/kg-extract/kg-path/kg-build/kg-merge/kg-prune`
`cross-search/cross-stats/agent-profiles/agent-insights/cross-kg`
`self-improve/decision-set/decision-get/decision-history/decision-list`
`reflect/crystallize/crystallize-validate` (Hermes upgrades 2026-04-13)

### MCP Server (16 tools)
`nox_mem_search` (hybrid), `stats`, `primer`, `ingest`, `cross_search`, `cross_stats`, `metrics`
`kg_build`, `kg_query`, `kg_stats`, `agent_profiles`, `cross_kg`, `kg_path`, `self_improve`
`nox_mem_reflect`, `nox_mem_crystallize` (Hermes upgrades 2026-04-13, build consertado 2026-04-18)

### HTTP API Server (porta 18802 — era 18800, Chrome squata :18800)
10 endpoints:
- Core: `/api/health`, `/api/agents`, `/api/kg`, `/api/kg/path`, `/api/search`, `/api/cross-kg`
- Hermes: `/api/reflect?q=...&nocache=1`, `/api/procedures`, `POST /api/crystallize`, `POST /api/crystallize/validate?id=N`
- Porta real: controlada por `NOX_API_PORT` em `/root/.openclaw/.env` (hoje 18802)
- Systemd: `nox-mem-api.service` (Type=simple)

### 6 Serviços systemd (todos ativos)
- `openclaw-gateway` (:18789 WS, Type=simple, Restart=always)
  - `StartLimitBurst=5` + `StartLimitIntervalSec=120` (crash loop protection)
  - `ExecStartPre=fuser -k 18789/tcp` (mata orphans por porta antes de iniciar)
  - `ANTHROPIC_BASE_URL=http://127.0.0.1:4100` (via RelayPlane)
- `relayplane-proxy` (:4100, proxy AI routing, v1.8.37)
  - Cascade fallback: Sonnet → Haiku → DeepSeek R1 (Groq) → Qwen3 32B (Groq) → Llama 70B (Groq)
  - `maxEscalations: 4`, `escalateOn: error`
  - Complexity routing: simple=Haiku, moderate=Sonnet, complex=Opus
  - Budget: $5/dia warn, $1/hora warn, $0.50/request block
- `claude-telegram.service` — **DESABILITADO** (2026-03-31, conflitava com gateway Telegram)
- `nox-mem-watcher` (inotifywait, debounce 15s, heartbeat)
- `nox-mem-api` (:18802 HTTP JSON — configurável via `NOX_API_PORT` no .env)
- `ollama` (llama3.2:3b CPU, KEEP_ALIVE=5m — descarrega modelo após inatividade). **Nota 2026-04-17:** user reportou ollama desabilitado; confirmar via `systemctl is-active ollama` antes de assumir disponibilidade
- `tailscaled` (100.87.8.44)

### Cron Jobs (consolidados em nightly-maintenance.sh pós-2026-04-01)
- **Serial runner único às 23:00** via `/root/.openclaw/scripts/nightly-maintenance.sh` executa: reindex → consolidate → vectorize → kg-build → kg-prune → session-distill em ordem determinística (elimina race conditions entre writers)
- */5 min: `/root/.openclaw/scripts/health-probe.sh` (probe de serviços; lê `${NOX_API_PORT}` do .env pós-2026-04-18)
- 02:00: SQLite backup (7d retention)
- 03:00: backup completo (`/root/.openclaw/scripts/backup-openclave.sh`)
- */6h: git backup + WAL checkpoint
- **DEPRECATED (2026-04-01):** `session-context.json` e `active-tasks.md` → migrados para SESSION-STATE.md
- **REMOVIDO:** `claude-tg-watchdog.sh` (recriava bot Telegram duplicado a cada 5min)
- **Histórico:** antes da consolidação, cron tinha ~29 entries com heavy writers rodando em paralelo — docs antigos mencionam essa config

### Segurança e Hardening (2026-03-31)
- **Firewall (ufw):** deny default, SSH aberto, portas 18789/18802/4100 restritas a Tailscale (100.64.0.0/10)
- **fail2ban:** ativo para SSH (12 IPs banidos historicamente)
- **API keys:** todas via env vars em `/root/.openclaw/.env` (nenhuma hardcoded no JSON)
- **Swappiness:** 10 (otimizado para servidor, era 60)
- **Scripts permanentes:** `/root/.openclaw/scripts/` (não mais em /tmp/)

### Multi-Agent (6 agentes, DBs isolados)
- Total: **1,880 workspace chunks** + agents = sistema crescendo ativamente
- OPENCLAW_WORKSPACE env var controla path resolution
- `agents.defaults` em openclaw.json: fallback chain (Sonnet → Haiku → DeepSeek R1 → Qwen3 → Llama 70B, tudo Groq free)
- `agents.list`: 7 entries (main + nox/atlas/boris/cipher/forge/lex)

### Cross-Agent Intelligence
- Agent expertise profiling (chunk type analysis)
- Knowledge sharing (pull lessons/decisions cross-agent)
- Cross-KG merge (unified entity view)
- Graph traversal (BFS path finding)

### Dashboard Integration
- **Repo:** github.com/totobusnello/agent-hub-dashboard
- **Stack:** React 18 + Vite + shadcn/ui + Recharts + TanStack Query
- **11 páginas** incluindo 4 nox-mem views:
  - `/memory` — Health, vector coverage, services, agent breakdown
  - `/knowledge-graph` — Force-directed graph canvas, path finder, entity filters
  - `/agent-intel` — Agent cards, hybrid search, cross-KG
  - `/system-paper` — Paper técnico live com charts Recharts (auto-refresh 60s)

### Routing de Modelos (RelayPlane + OpenClaw)
```
Agentes → Gateway (:18789) → RelayPlane (:4100) → Provider APIs
```
- **RelayPlane** faz routing por complexidade (simple/moderate/complex) e cascade automático em erro
- **OpenClaw `agents.defaults.model`** define fallback por agente
- **Cascade em erro:** Sonnet → Haiku → DeepSeek R1 (Groq) → Qwen3 32B (Groq) → Llama 70B (Groq) (até 4 tentativas)
- Config: `/root/.relayplane/config.json`

### API Keys (em /root/.openclaw/.env)
Anthropic, Groq, Gemini, OpenAI (sem créditos, removido dos fallbacks), OpenRouter + service tokens

### Evolution
- v1.0 (Mar 14): FTS5, consolidation, Notion sync
- v2.0 (Mar 17): MCP server, crons, watcher
- v2.2 (Mar 20): Cross-agent, KG v1 (regex), self-improve
- v2.5 (Mar 22): Multi-agent workspace fix, gateway supervision
- v2.6 (Mar 22): Hybrid search default, 866/866 vectorized
- v3.0 (Mar 23): KG v2 (LLM, 384 entities), Cross-Agent Intelligence, HTTP API, Dashboard
- v3.1 (Mar 31 tarde): **Infrastructure hardening** — 12-point audit, cascade fallback, WAL checkpoint, ufw firewall, gateway crash loop protection, health check com auto-restart, Ollama KEEP_ALIVE, swappiness tuning, ExecStartPre fix, agents.defaults restoration
- v3.2 (Mar 31 noite): **Stability fix** — bot Telegram duplicado eliminado (claude-telegram.service + watchdog), crons otimizados (consolidation a cada 2 dias, wrap-ups 2x/semana, health 15min), OpenAI removido dos fallbacks (sem créditos), DeepSeek R1 adicionado via Groq (free), RelayPlane atualizado v1.8.37, auth profile cooldown fix
- v3.3 (Apr 18): **Memory integrity restoration** — diagnóstico via 4 agentes especializados (architect + database-optimizer + sre-engineer + performance-engineer) identificou 5 gaps críticos. **Tier 0**: health-probe lê `NOX_API_PORT` do .env (elimina 288 restarts/dia causados por port mismatch contra Chrome squatter em :18800); `busy_timeout=5000` em db.ts; `/api/health.vectorCoverage` reporta estado real. **Tier 1**: 6627 órfãos em `vec_chunk_map` + 2587 unreferenced em `vec_chunks` limpos; trigger `trg_chunks_delete_cascade` instalado; bug em vectorize.ts (consultava coluna inexistente `vec_chunks.chunk_id`) corrigido; `embedBatch` reescrito usando `batchEmbedContents` Gemini (serial→batch 50, 3→26.4 chunks/s, 9×); re-embed completo dos 1951 chunks em 74s, zero 429. **Estado pós-fix:** embedded 1951/1951 (100% coverage), hybrid search funcional pela primeira vez (antes era FTS-only silenciosamente), semantic matches confirmados em queries de teste. Novos endpoints HTTP adicionados no mesmo dia: `/api/reflect`, `/api/procedures`, `POST /api/crystallize`, `POST /api/crystallize/validate`. MCP server rebuild (bugs de sintaxe L137/L267 fixados). Auto-embed em crystallize (não espera cron). Validação de procedures com `{outcome, agent, notes}` e `successRate`.

### Incident Log
- **2026-03-31 19:43-20:02:** Gateway crash — `openclaw.json` tinha agent keys em formato antigo (flat) + novo (list). Nova versão rejeitou chaves flat como "Unrecognized keys". Processo orphan queimou 105% CPU. Fix: removidas chaves flat, matado orphan, gateway reiniciado.
- **2026-03-31 ~21:30:** Gateway crash loop (restart counter 18+) — `ExecStartPre` usava `pkill openclaw-gateway` que truncava a 15 chars e não matava nada. Fix: substituído por `fuser -k 18789/tcp`.
- **2026-03-31:** `agents.defaults` acidentalmente removido durante cleanup do config. Fix: seção inteira restaurada com model fallback chain, heartbeat, compaction, memory search.
- **2026-03-31:** RelayPlane cascade fallback estava desligado (`cascade.enabled: false`, `models: []`). Causa raiz do fallback não funcionar durante instabilidade Anthropic. Fix: cascade ativado com 6 modelos e 4 max escalations.
- **2026-03-31 22:00-23:05:** Agentes lentos no Discord/WhatsApp/Telegram. Causa raiz: `claude-telegram.service` (systemd) + `claude-tg-watchdog.sh` (cron */5min) criavam bot Telegram duplicado, gerando conflito 409 no polling e dobro de API requests. Gateway duplicado esgotou API rate limit. Compaction usava OpenAI (sem créditos) em loop infinito. Fix: service desabilitado, watchdog removido, OpenAI removido dos fallbacks, crons espaçados, auth cooldowns limpos, DeepSeek R1 (Groq free) adicionado como fallback.
- **2026-04-01 07:15:** Gateway crash loop (restart counter 4/5) — chave `"providers"` no root do `openclaw.json` não reconhecida pela versão 2026.3.2. Config foi escrito por versão 2026.3.31 que suporta essa chave. Fix: chave removida, systemd reset-failed, gateway reiniciado. Também: `session-context.json` e `active-tasks.md` stale (12-14 dias) → deprecated em favor de SESSION-STATE.md; crons adicionados para `tiers evaluate` (Seg 03:00), `session-distill` (Dom 05:00), `update-session` promovido de semanal para diário (23:30).
- **2026-04-01 12:00-15:30:** Gateway crash loop contínuo (~75 restarts). **Causa raiz:** Node.js 22 emite `DEP0040 DeprecationWarning` (punycode) no stderr; OpenClaw v2026.3.31 interpreta qualquer stderr ERROR como falha e auto-reinicia o gateway via subsistema `restart`. Ciclo: gateway inicia → punycode warning 2s depois → restart subsystem mata child → systemd reinicia → loop infinito. **Amplificadores:** (1) health check cron `/5min não resetava contador após restart → restart em cascata; (2) agente `main` configurado com `openai/gpt-5.1-codex` (sem créditos) → boot task falhava; (3) `anthropic-overload-monitor` cron com prompt 33K tokens > limite 6K TPM do Groq → falhava sempre no startup. **Fix:** wrapper `/usr/bin/node` → `/usr/bin/node.bin --no-warnings` suprime DEP0040 em todos os processos. **Fixes colaterais:** main agent model OpenAI→Sonnet; `anthropic-overload-monitor` desabilitado; health check script com grace period + counter reset; delivery queue limpa; `memorySearch.fallback` OpenAI→Gemini. **Nota:** OpenClaw v2026.3.31 requer Node.js 22.12+ (downgrade para Node 20 não é opção).
- **2026-04-18 (silent, multi-week):** Semantic search silenciosamente morta. **Causa raiz compounded:** (1) Chrome com `--remote-debugging-port=18800` rodando num workstation ocupou a porta; `nox-mem-api` migrou pra :18802 pra escapar; `health-probe.sh` continuou batendo em `http://127.0.0.1:18800` hardcoded → 12 restarts/hora (288/dia) matando writes mid-flight; (2) `vectorize.ts:39` consultava `SELECT chunk_id FROM vec_chunks` mas essa coluna não existe (chunk_id mora em `vec_chunk_map`) → "already embedded" check sempre vazio, vectorize re-embedava tudo E nunca detectava órfãos; (3) sem FK CASCADE nem trigger, cada `DELETE chunks` por consolidation/dedup deixava vec_chunks + vec_chunk_map órfãos; (4) `busy_timeout=0` causava SQLITE_BUSY silencioso sob contenção (watcher + api + CLI). Acumulado: 6,627 linhas em `vec_chunk_map` 100% órfãs, 2,587 vetores unreferenced em `vec_chunks`, 0 chunks vivos embedded. `/api/health` mentia `embedded: 6627`. Hybrid search era FTS-only disfarçado — paper técnico e dashboard mentindo. **Fix (Tier 0+1):** probe port via env; `busy_timeout=5000`; DELETE órfãos + trigger `trg_chunks_delete_cascade AFTER DELETE ON chunks`; `vectorize.ts` corrigido (INNER JOIN em vec_chunk_map); `embedBatch` substituído por `embedBatchAPI` usando `batchEmbedContents` (3→26.4 chunks/s); re-embed full em 74s, 0 × 429. **Aprendizado:** `/api/health` nunca deve derivar de tabela — sempre JOIN com a source-of-truth (chunks). Embedding layer precisa de teste canário: script diário que faz 1 query e checa se `match_type: "semantic"` aparece em resultados.

## Produto NOX-Supermem (em desenvolvimento)

- **Repo:** github.com/totobusnello/nox-supermem (private)
- **Local:** ~/Claude/Projetos/nox-supermem/
- **Mercado:** Brasil (PT-BR), Hotmart
- **Tiers:** A R$147, B R$197, C R$227 (+R$30/semana suporte)
- **Plan:** 24 tasks em 4 chunks (scaffold, modules, installer, docs)

## Paper Técnico

- **Markdown:** `paper-tecnico-nox-mem.md` (12 seções, ~4000 palavras)
- **Word:** `paper-tecnico-nox-mem.docx` (23 KB)
- **Live Dashboard:** `/system-paper` no agent-hub-dashboard (auto-refresh)

## Convenções

- Specs e plans usam formato Superpowers (checkbox tasks, chunk boundaries)
- Todos os módulos respeitam OPENCLAW_WORKSPACE env var
- Hybrid search é o padrão (--no-hybrid para desabilitar)
- KG v2 usa LLM extraction via **Gemini 2.5 Flash** (migrado de Ollama 2026-04-11) — superior a regex
- Forge agent faz code review via PRs no GitHub
- **nox-mem-api escuta em :18802** (não 18800 — Chrome remote-debugging squata 18800). Nunca hardcode a porta; ler de `NOX_API_PORT` no `.env`
- **`busy_timeout=5000ms`** é obrigatório em `db.ts` — sem isso, SQLITE_BUSY silencioso sob contenção (watcher + api + CLI escrevendo em paralelo)
- **Embedding em massa sempre via `embedBatchAPI`** (`batchEmbedContents` do Gemini) — nunca loop serial. Batch 50, pause 1s = ~26 chunks/s estável sem 429
- **Trigger `trg_chunks_delete_cascade`** (AFTER DELETE ON chunks) garante que DELETE em chunks limpa vec_chunks + vec_chunk_map. Nunca remover esse trigger
- **`/api/health.vectorCoverage`** deve reportar `embedded` via `JOIN chunks × vec_chunk_map` (não COUNT sobre vec_chunk_map sozinho — conta órfãos)
- **Teste canário semântico:** depois de qualquer operação que toca chunks (consolidation, dedup, re-ingest), validar que `curl /api/search?q=...` retorna pelo menos 1 resultado com `match_type: "semantic"`. Se não, semantic layer está quebrado
- **Nunca editar `openclaw.json` removendo `agents.defaults`** — contém fallback chain, heartbeat, compaction essenciais
- **Gateway systemd:** ExecStartPre deve usar `fuser -k <porta>` (não pkill por nome — trunca a 15 chars)
- **Scripts de manutenção:** sempre em `/root/.openclaw/scripts/` (nunca /tmp/ — reboot apaga)
- **Nunca rodar bot Telegram fora do gateway** — `claude-telegram.service` e `claude-tg-watchdog.sh` foram desabilitados; o gateway já tem Telegram integrado
- **Auth profile cooldowns** persistem em `*/agent/auth-profiles.json` (campo `usageStats.cooldownUntil`). Se agentes pararem de responder, limpar `usageStats: {}` e reiniciar gateway
- **OpenAI sem créditos** — removido dos fallbacks. Reabilitar quando recarregar saldo
- **Crontab backup** antes de editar: `/root/crontab-backup-YYYYMMDD-HHMM.txt`
- **SESSION-STATE.md é a fonte única de estado** — `session-context.json` e `active-tasks.md` estão deprecated (2026-04-01)
- **Nunca adicionar chaves root novas ao `openclaw.json`** sem verificar a versão do binário na VPS (v2026.3.31) — versões mais novas escrevem chaves que a VPS não reconhece e causam crash loop
- **Node.js wrapper obrigatório:** `/usr/bin/node` é wrapper bash que chama `/usr/bin/node.bin --no-warnings`. Sem isso, DEP0040 (punycode) causa crash loop. Se `apt upgrade nodejs` for rodado, recriar o wrapper (renomear novo binary para `node.bin`, recriar wrapper)
- **Nunca usar OpenAI como model primary/fallback** enquanto sem créditos — causa crash no boot task do gateway. Agente `main` deve usar `anthropic/claude-sonnet-4-6`
- **Cron `anthropic-overload-monitor` está desabilitado** — prompt excede limite TPM do Groq. Reabilitar quando reduzir prompt ou trocar para modelo com TPM maior


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

### Mar 15, 2026

| ID | Time | T | Title | Read |
|----|------|---|-------|------|
| #667 | 7:37 AM | 🔵 | Phase 3 specification review for nox-mem semantic search upgrade | ~472 |

### Mar 17, 2026

| ID | Time | T | Title | Read |
|----|------|---|-------|------|
| #730 | 3:05 PM | ✅ | Updated CLAUDE.md documentation to reflect actual nox-mem schema and deployment state | ~630 |
| #729 | " | 🔵 | memoria-nox project documentation reveals schema mismatch with deployed nox-mem system | ~739 |

### Mar 23, 2026

| ID | Time | T | Title | Read |
|----|------|---|-------|------|
| #960 | 6:37 PM | ✅ | Project Documentation Updated to Reflect v3.0.0 Architecture and Capabilities | ~1055 |
| #889 | 11:07 AM | ✅ | Comprehensive Technical Paper Created Documenting nox-mem v3.0.0 Architecture | ~1347 |
</claude-mem-context>