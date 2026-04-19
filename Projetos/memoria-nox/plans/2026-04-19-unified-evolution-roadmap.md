# Unified Evolution Roadmap — nox-mem Memory System

**Versão:** 1.0 (2026-04-19)
**Status:** Foundation repaired. Ready to execute Fase 1.6.
**Fonte estratégica:** `docs/nox-neural-memory.md` (v12)
**Fonte de execução:** este arquivo — **source of truth daqui em diante**
**Última auditoria completa:** 2026-04-18 (4 agentes specialists)

---

## Executive Summary

Objetivo: sistema de memória hyper-eficiente, confiável e persistente para os 6 agentes do Totó acessados via WhatsApp/Discord. Estado atual: v3.3, 1.951 chunks 100% embedded, hybrid search funcional pela primeira vez, autodefesa diária ativa. Próximos 3 movimentos: (1) bake telemetria leve em Fase 1.6, (2) executar Fase 1.6 (query expansion + dedup — +30-40% recall, 2h, zero risco), (3) Fase 1.7a (User Profile + ontology — economia de API + boot de agentes com contexto rico).

---

## Phase Matrix

| # | Nome | Status | Esforço | Depende de | Exit criteria |
|---|---|---|---|---|---|
| 1 | Quick Wins (wip, feedback, L1) | ✅ DONE | — | — | Concluída 2026-04-11 |
| 1.5 | KG Migration Ollama→Gemini | ✅ DONE | — | 1 | 1489 entities extraídas |
| **0.5** | **Foundation Repair** | ✅ DONE | — | 1.5 | 1951/1951 embedded, canary+morning ativos |
| 24h | Observação pós-Fase 0.5 | 🔧 IN PROGRESS | passivo | 0.5 | Nightly 23h passa limpo; canary 06:00 OK |
| 1.6 | Search Quality (expansion + dedup) | ⏳ READY | 2-3h | 24h | +30% recall em queries ambíguas; telemetria ativa |
| 1.7a | Core Memory Quality | ⏳ READY | 2-3h | 1.6 | USER-PROFILE.md gerado; -30% calls Gemini |
| 2.5 | graph-memory plugin | ⏳ READY | 30 min | 1.7a | Conversa 7+ turns cabe em 24K tokens |
| Path A | Write coordinator | 🔒 PRE-REQ para Fase 2 | 2 semanas | 2.5 | Zero partial writes sob contention |
| 2 | Graphify + GitHub repos | 🔒 BLOCKED | 2-3h + wait | Path A | GRAPH_REPORT.md indexado; query "o que tem no repo X?" responde |
| 1.7b | Memory Quality advanced | 🔒 BLOCKED | 4-6h | 2 | Conflicts detectados; inline entity real-time |
| 3 | HD rsync + enrichment tiered | 🔒 BLOCKED | 1h + tempo rsync | 1.7b | 50+ docs indexados com Tier 1/2/3 |
| 3.5 | Fathom API | 🔒 BLOCKED (opcional) | 3-4h | pré-req API | Reunião indexada <24h |
| 4 | Obsidian view-only | 🔒 BLOCKED | 1h | 3 | Galáxia 3D no Mac |
| Path B-lite | Semantic reflect cache | 🔒 BLOCKED | 2-3h | 1.7a + telemetria | Hit rate ≥40% over 7d |
| Path C | WAL shipping + cold tier | 🔒 BLOCKED | dias | 4 | DB hot <50MB perpetuamente |
| 4b | Obsidian write | 🔒 FUTURO | 2-3h | 4 + 2-4 sem | Zero corrupção em 2 sem |
| 5 | openclaw-memory-sync | 🔒 FUTURO | 1h | 4b | Delay <5min bidirecional |
| SEH | Self-Evolving Hooks | 🔒 INDEPENDENTE | 2h | — | 3+ sessões geram regra aprendida |
| P | Productização nox-supermem | 🔒 HORIZONTE 60d+ | semanas | 4 estável 30d | v3.3 paridade no produto |

Legenda: ✅ done / 🔧 in progress / ⏳ ready / 🔒 blocked

---

## Fase 24h — Observação pós-Foundation Repair (ATIVO AGORA)

**Goal:** Validar que os fixes do Tier 0+1 sobreviveram ao stress test do `nightly-maintenance.sh` das 23h.

**Deliverables:**
- [ ] Morning report das 06:30 chega no Discord `#nox-chief-of-staff` sem RED
- [ ] Canary das 06:00 retorna `OK: total=N semantic>0 orphans=0`
- [ ] `nightly-maintenance.log` sem errors novos
- [ ] `vectorCoverage.embedded == total` (watcher pode ter adicionado chunks — OK se ainda 100%)
- [ ] Zero restarts automáticos entre 12:30 e 06:30

**Verificação (rode 1 comando):**
```bash
~/Claude/Projetos/memoria-nox/scripts/check-nox-mem.sh
```

**Exit criteria:** output do script termina com "All green — safe to proceed to Tier 3".

**Risk:** nightly-maintenance pode expor race condition que `busy_timeout=5000` não cobre.
**Rollback:** restore backup `/root/.openclaw/workspace/backups/nox-mem-pre-nightly-20260418-125019.db` (instruções em `plans/2026-04-18-tier0-tier1-session-log.md`).

---

## Fase 1.6 — Search Quality Upgrade + Telemetria Leve

**Goal:** +30-40% recall em queries ambíguas via query expansion (multi-query rewrite) + diversidade de resultados via dedup 4-layer. Instrumentar telemetria leve para medir impacto.

**Inspiração:** [garrytan/gbrain](https://github.com/garrytan/gbrain) `search/expansion.ts` + `search/dedup.ts` (validado em 14.7K brain files).

**Deliverables:**
- [ ] `src/search-expansion.ts` (~70 LOC) — Gemini 2.5 Flash reescreve query em 3 variantes (original + 2 expansões). Queries <3 palavras pulam expansion
- [ ] Config `expansionEnabled: boolean` no `openclaw.json` — liga/desliga sem deploy. Default `true`
- [ ] Fallback gracioso: se Gemini falhar, usa query original (non-fatal)
- [ ] `src/search-dedup.ts` (~80 LOC) — 4 layers: (1) top 3 por page, (2) similarity >0.85 remove duplicatas, (3) nenhum type >60%, (4) max 2 chunks por page final
- [ ] Wire-up em `src/search.ts` — expansion ANTES do RRF, dedup DEPOIS. Zero mudança no core
- [ ] **Telemetria leve:** tabela `search_telemetry` (query_hash, timestamp, variants_count, results_count, has_semantic, latency_ms) — 1 INSERT por search, sem wrapper complexo
- [ ] Campo em `/api/health.searchTelemetry` reportando last_24h_avg_results, semantic_ratio, p95_latency
- [ ] 15 queries de teste cobrindo: ambígua, específica, muito curta, natural language longa — comparar recall antes/depois

**Depende de:** Fase 24h verde.

**Exit criteria (MEDIDOS):**
- 10 queries de teste mostram ≥3 resultados únicos (era ≤1 em alguns casos com FTS-only)
- Pelo menos 1 query ambígua recupera resultado que BM25 puro não pegava (via match_type=semantic)
- `search_telemetry.has_semantic` true em ≥70% das searches (confirma hybrid real)
- Latência p95 ≤ 1.5s (doc baseline: p95=862ms FTS-only; com expansion vira ~1.2s pela expansion Gemini)

**Risk:** expansion Gemini adiciona ~300ms p95. Mitigação: queries curtas pulam; failover para query original.

**Rollback:** `expansionEnabled: false` no config (sem deploy).

**Estimativa:** 2-3h.

---

## Fase 1.7a — Core Memory Quality

**Goal:** Entidades ricas + economia de API + User Profile carregado no boot dos agentes.

**Inspiração:** [topoteretes/cognee](https://github.com/topoteretes/cognee) (ontology grounding), [garrytan/gbrain](https://github.com/garrytan/gbrain) (source attribution, compiled truth), [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) (user profile).

**Deliverables:**
- [ ] **Ontology Grounding** — prompt de `kg-llm.ts` define campos por tipo: `project` (name, value, status, key_person, ebitda_multiple), `person` (name, role, organization), `document` (name, type, date, parties), `decision` (what, who, date, outcome). Usa `responseSchema` nativo Gemini
- [ ] **Multi-Stage Extraction** (~30 LOC em `kg-llm.ts`) — regex fast-path extrai entidades óbvias antes da chamada LLM: nomes próprios, valores (R$/US$/€), datas, emails, URLs, telefones. Se ≥3 encontradas, pula Gemini (economia 30-40%)
- [ ] **Source Attribution** (gbrain) — campo `source_type` nos chunks: `user_statement` | `compiled` | `timeline` | `external`. RRF fusion aplica boost (user 2x, compiled 1.5x, timeline 1x, external 0.8x)
- [ ] **Compiled Truth Flag** (gbrain) — campo `is_compiled` — consolidados = `true` (síntese), originais = timeline (evidência). Search dá boost para compiled
- [ ] **USER-PROFILE.md** — script `generate-user-profile.ts` que roda semanal (após kg-build) e extrai: top 20 entidades por mention, projetos ativos, decisões últimos 30d, preferências declaradas. Salvo em `shared/USER-PROFILE.md`
- [ ] **Boot injection** — agentes leem `USER-PROFILE.md` no boot (antes de qualquer busca). Economiza re-lookup

**Depende de:** Fase 1.6 concluída (ontology precisa de hybrid search confiável).

**Exit criteria:**
- Query "qual o múltiplo de EBITDA do deal X?" retorna valor específico (não "X é um project")
- kg-build mede redução de ≥30% em chamadas Gemini via fast-path
- USER-PROFILE.md gerado com top 20 entities, projetos ativos, últimas decisões
- Pelo menos 1 agente (Nox) confirma que usa USER-PROFILE.md no boot (log ou resposta explícita)

**Risk:** ontology grounding pode quebrar extrações já feitas. **Mitigação:** rodar em chunks novos apenas; histórico permanece com schema v1.

**Estimativa:** 2-3h.

---

## Fase 2.5 — graph-memory Plugin

**Goal:** Memória de curto prazo em conversas — compressão de contexto (~75%) e recall cross-session automático via [adoresever/graph-memory](https://github.com/adoresever/graph-memory).

**Por que antes da Fase 2:** quando graphify começar a injetar 20K+ entities (Fase 2), o L1 (graph-memory) precisa estar ativo para absorver o volume sem sobrecarregar cada query do WhatsApp.

**Deliverables:**
- [ ] `pnpm openclaw plugins install graph-memory` na VPS
- [ ] Configurar `openclaw.json`: `compactTurnCount: 7`, `recallMaxNodes: 6`, `recallMaxDepth: 2`, LLM via provider padrão, embeddings Gemini endpoint OpenAI-compatible
- [ ] Adicionar `graph-memory.db` ao `backup-all.sh`
- [ ] Teste: conversa no WhatsApp com 10+ turns — verificar compressão efetiva (173K→<30K tokens)
- [ ] Monitorar 1 semana antes de declarar concluída

**Depende de:** Fase 1.7a (USER-PROFILE.md pra contexto inicial rico).

**Exit criteria:**
- Conversa de 7+ rounds cabe em ≤30K tokens de context
- Query "o que conversamos ontem?" retorna recall de sessão anterior
- `graph-memory.db` <50MB após 7 dias de uso

**Risk:** plugin pode conflitar com consolidation do nox-mem. **Mitigação:** DBs e hooks isolados (conforme decisão 6 em nox-neural-memory.md).

**Estimativa:** 30 min setup + 1 semana observação.

---

## Path A — Write Coordinator (PRE-REQ Fase 2)

**Goal:** Processo único long-lived que detém a conexão de escrita do SQLite. Readers (API, MCP, CLI) usam conexões read-only. Elimina contention + race conditions + CASCADE inconsistencies + WAL checkpoint issues.

**Por que AGORA (antes de Fase 2, não depois):** Graphify vai injetar 20K+ entities em lotes. Com writer único no pool de crons + watcher + api, SQLITE_BUSY volta mesmo com `busy_timeout=5000`. Path A é a solução arquitetural.

**Blueprint detalhado:** `audits/sre-deepening-2026-04-18.md` seção Path A.

**Deliverables:**
- [ ] Novo processo systemd `nox-mem-writer.service` — Unix socket em `/run/nox-mem-writer.sock` (FS perms = AuthN, sub-ms latency, não vaza via ufw)
- [ ] Migração incremental por op class (2 semanas, começa pela mais nova/baixo volume):
  - Semana 1: `crystallize` + `reflect_cache` writes
  - Semana 1.5: `ingest` do watcher
  - Semana 2: `vectorize`, `kg-build`, `consolidate`
- [ ] API + CLI passam a abrir DB com `file://... ?mode=ro&immutable=0` para reads
- [ ] Writer implementa backpressure queue (max 100 pending writes, reject após isso)
- [ ] Graceful shutdown handler (SIGTERM drena queue antes de exit)
- [ ] Startup ordering em systemd: `Requires=nox-mem-writer.service` em nox-mem-api + watcher

**Depende de:** Fase 2.5 estável 7d (confirma que graph-memory não introduz novos writers inesperados).

**Exit criteria:**
- Zero SQLITE_BUSY em 48h sob carga normal
- `/api/health` responde <10ms em 99% dos casos mesmo durante nightly-maintenance
- Kill do writer durante transação → recovery automático sem perda de dados (integrity_check=ok)

**Risk:** regressão em latência (IPC sobre Unix socket). Aceitável se <5ms overhead (sub-ms testado em dev).

**Rollback:** disable do writer service, readers voltam a abrir DB direto. Reversível por op class.

**Estimativa:** 2 semanas execução + 1 semana observação.

---

## Fase 2 — Graphify + GitHub Repos (PRIMEIRO GRAFO REAL)

**Goal:** Primeiro grafo real sobre os projetos do Totó. Docs do GitHub viram chunks + entidades consultáveis.

**Fonte:** [safishamsi/graphify](https://github.com/safishamsi/graphify) (71.5x menos tokens via Claude Vision multimodal).

**Deliverables:**
- [ ] `pip install graphifyy` na VPS
- [ ] `graphify install --platform claw` (escreve no AGENTS.md)
- [ ] Criar `/root/vault/projetos/` com symlink `/root/.openclaw/workspace/vault → /root/vault`
- [ ] Script: clonar repos prioritários (definir quais com usuário — Nuvini? FII? todos 20+?)
- [ ] `graphify /root/vault/projetos/` — primeiro build real
- [ ] Analisar `GRAPH_REPORT.md`: god nodes? Conexões surpresa?
- [ ] Cron horário: `git pull` em todos os repos (com lock para não concorrer com nightly)
- [ ] Cron diário 23:30: `graphify --update /root/vault/` (rebuild incremental)
- [ ] Agentes leem `GRAPH_REPORT.md` no boot
- [ ] nox-mem ingest `GRAPH_REPORT.md` (ponte graphify → hybrid search)
- [ ] **Semantic Chunking** (gbrain, ~150 LOC em `chunkers/semantic.ts`): embed por frase, cosine adjacentes, Savitzky-Golay filter (5-window, 3rd-order) para topic boundaries. Fallback graceful para recursive chunker. Aplica a chunks novos apenas; existentes ficam com v1

**Depende de:** Path A estável 7d.

**Exit criteria:**
- `graphify query "o que tem no repo sao-thiago-fii?"` retorna resposta com source citada
- ≥80% dos repos do Totó no GitHub estão indexados
- Chunks de PPTX/PDF novos usam semantic chunking (verificável via metadata `chunker: "semantic"`)

**Risk:** 21GB de HD rsync + 5-10GB de repos ocupa ~30GB no /root (tem 148GB livre — ok).

**Estimativa:** 2-3h setup + tempo do primeiro build (depende do volume de repos).

---

## Fase 1.7b — Memory Quality Advanced

**Goal:** Detecção de contradições, versionamento de fatos, auto-esquecimento inteligente, entity detection real-time.

**Inspiração:** [kraklabs/mie](https://github.com/kraklabs/mie) (conflict detection, invalidation chains), [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) (smart forgetting), [MemPalace/mempalace](https://github.com/MemPalace/mempalace) (verbatim preservation), [garrytan/gbrain](https://github.com/garrytan/gbrain) (inline entity detection).

**Deliverables:**
- [ ] **Reasoning Traces** — novo chunk_type `reasoning_trace`: (query, fontes consultadas, dados extraídos, resposta). Queries similares futuras encontram via hybrid search
- [ ] **Conflict Detection** (SQL query em `kg-build`, ~20 LOC) — entidades com mesmo nome + atributos conflitantes. Exemplo: "FII 2400m² vs 3200m²". Marca para revisão
- [ ] **Invalidation Chains** — campos `valid_until` + `superseded_by` em `kg_entities`. Atualização marca antiga + referencia nova. **REGRA CRÍTICA: entidades com `superseded_by` são IMUNES a TTL (Smart Forgetting)** — arquivadas, nunca deletadas
- [ ] **Smart Forgetting** (~10 LOC em extractor) — TTL inteligente: fatos temporais ("prova amanhã") = data + 7d; permanentes = 90d atual. Exceto entidades superseded
- [ ] **Source Text Preservation** — campo `source_text` na `kg_entities` guardando verbatim. Fallback quando extração não cobre
- [ ] **Hierarchical Tagging** (mudança de prompt) — 3 campos: `scope` (nuvini/fii-sao-thiago/toto), `category` (decisions/contracts/people), `topic` (pricing/ebitda/terreno). +34% retrieval accuracy (MemPalace)
- [ ] **Inline Entity Detection** — regex fast-path em cada mensagem WhatsApp/Discord. Se ≥3 entities (nomes/valores/datas), gravar direto no KG sem LLM. Se <3, chamar Gemini Flash async. KG real-time

**Depende de:** Fase 2 estável 7d (conflicts só fazem sentido com documentos reais chegando).

**Exit criteria:**
- Query de teste "FII tem 2400m² ou 3200m²?" retorna alerta de conflito
- Zero entidades `superseded_by` deletadas por TTL após 30d
- ≥50% das mensagens no Discord com entities são detectadas e gravadas <500ms

**Risk:** inline entity detection com regex pode gerar falsos positivos poluindo KG. **Mitigação:** confidence score + review threshold.

**Estimativa:** 4-6h + testes.

---

## Fase 3 — HD Mac rsync + Enrichment Tiered

**Goal:** Documentos pessoais (PPTX/PDF/XLSX/DOCX) do Mac indexados. Enrichment classificado por importância.

**Deliverables:**
- [ ] Script `~/sync-vault.sh` no Mac (rsync via Tailscale, filtro por extensão, exclude DS_Store + node_modules)
- [ ] Definir com Totó: pastas prioritárias em `~/Documents/` (21GB total; começar com 1-2 pastas)
- [ ] Primeiro rsync manual
- [ ] `graphify --update` processa
- [ ] launchd Mac: sync diário às 02:00
- [ ] **Enrichment Pipeline Tiered** (gbrain):
  - Tier 1 (≥5 mentions): cross-reference todos chunks + compiled truth + conflict validation
  - Tier 2 (2-4 mentions): cross-reference + timeline
  - Tier 3 (1 mention): raw preservation
  - Classificação automática em kg-build

**Depende de:** Fase 1.7b + disk check VPS (verificado: 148GB livre — ok para 21GB rsync).

**Exit criteria:**
- ≥50 docs do HD indexados
- "Qual a área do terreno de Sorocaba?" responde com XLSX indexado
- Tier 1 entities (ex: Sorensen, Nuvini) têm compiled truth gerado

**Estimativa:** 1h setup + tempo rsync inicial.

---

## Fase 3.5 — Fathom API (opcional, paralela)

**Goal:** Reuniões indexadas automaticamente sem esforço manual. **Não bloqueia Fase 4.**

**Pré-requisito (VALIDAR ANTES):**
- [ ] Fathom tem API REST pública?
- [ ] Auth token disponível? Rate limits?
- [ ] Export de transcrições com speakers identificados?

**Se API existir:**
- [ ] Script Python puxa calls novas → `.md` em `/root/vault/reunioes/`
- [ ] Cron noturno 01:00
- [ ] graphify update processa

**Exit criteria:** reunião de hoje indexada até 24h depois.

**Estimativa:** 3-4h (se API viável).

---

## Fase 4 — Obsidian View-Only

**Goal:** Visualizar segundo cérebro no Mac como galáxia 3D — read-only, zero risco de corrupção.

**Deliverables:**
- [ ] graphify gera `graphify-out/obsidian/` como vault pronto
- [ ] rsync noturno VPS → Mac (`~/ObsidianVault/`)
- [ ] Instalar plugins Obsidian: BRAT + 3D Graph, Dataview, Graph Analysis (20 min)
- [ ] Cron launchd: sync diário

**Depende de:** Fase 3 (precisa de dados volumosos para grafo 3D fazer sentido).

**Exit criteria:** grafo 3D rotacionável mostrando clusters reais (projetos/pessoas/documentos).

**Estimativa:** 1h.

---

## Path B-lite — Semantic Reflect Cache

**Goal:** Upgrade do reflect_cache de exact-hash para semantic-key — cache hit quando query é semanticamente similar (cosine >0.92) a uma anterior. **Skip dep-set invalidation** (perf-engineer provou que é correctness trap: watcher DELETE+INSERT = chunk_ids não estáveis).

**Detalhado:** `audits/perf-baseline-2026-04-18.md` seção Path B critique.

**Deliverables:**
- [ ] Tabela `reflect_cache_vec` com embedding da query + resposta cached
- [ ] On reflect: embed query → semantic search na tabela cache → se cosine >0.92, retornar cached
- [ ] Manter TTL 24h (evita staleness sem dep-set)
- [ ] Métrica `reflectCache.semantic_hit_rate` em `/api/health`

**Depende de:** Fase 1.7a (ontology enriquece queries, melhora probabilidade de hit) + 7 dias de telemetria de reflect.

**Exit criteria:** semantic hit rate ≥15% over 7d (abaixo disso, +300ms query embedding é regressão net).

**Risk:** 0.92 é thumb-sucked. **Mitigação:** log de near-misses (0.85-0.91) para recalibrar threshold.

**Estimativa:** 2-3h.

---

## Path C — WAL Shipping + Cold Tier (HORIZONTE 60d)

**Goal:** Backup contínuo sem perda + DB hot perpetuamente <50MB.

**Deliverables:**
- [ ] WAL shipping automático para volume secundário (ou Tailscale peer)
- [ ] Cold tier DB (chunks com `tier='peripheral' AND access_count=0 AND age>90d` → archive DB comprimido)
- [ ] Query router: chunks não encontrados em hot → fallback cold (async)

**Depende de:** Fase 4 estável 30d (baseline de acesso real para classificar tiers).

**Exit criteria:** hot DB <50MB permanentemente, cold tier mantém histórico completo.

**Estimativa:** dias.

---

## Fase 4b + 5 — Obsidian Write + Bidirectional Sync (FUTURO)

**4b:** Obsidian escreve → reconcilia com nox-mem via agente noturno. Pré-requisito: 2-4 semanas em view-only sentindo falta.

**5:** Plugin [YearsAlso/openclaw-memory-sync](https://github.com/YearsAlso/openclaw-memory-sync) conecta porta 18789, sync bidirecional <5min.

---

## SEH — Self-Evolving Hooks (INDEPENDENTE)

**Goal:** Claude Code local (Mac) aprende com correções do usuário e transforma em regras permanentes.

**Spec:** `specs/2026-04-12-self-evolving-hooks.md`.

**Independente das outras fases** — pode rodar em paralelo. Bridge Local→VPS opcional (dream worker ingere regras no nox-mem via `/api/ingest`).

**Estimativa:** 2h.

---

## Fase P — Productização NOX-Supermem (HORIZONTE 60d+)

**Goal:** Empacotar nox-mem v3.3+ estável como produto comercial Hotmart.

**Repo:** `github.com/totobusnello/nox-supermem` (private). Estado: scaffold v2.1.2, ~10% implementação, stale 33d.

**Regra:** NÃO atacar enquanto evolução interna está ativa. Aguardar Fase 4 estável 30d.

**Deliverables (quando chegar a hora):**
- [ ] Rebase: copiar v3.3+ sanitizada → nox-supermem
- [ ] Generalizar: substituir `OPENCLAW_WORKSPACE` hardcoded por `getConfig()` em todos módulos
- [ ] `install.sh` completo com detecção de ambiente
- [ ] Tiers A/B/C definidos (docs, perfis, suporte)
- [ ] Landing + Hotmart setup

**Depende de:** Fase 4 concluída + 30d estável.

**Estimativa:** semanas.

---

## Cross-Cutting Concerns

### Observabilidade (camadas)

1. **HOJE:** canary 06:00 + morning report 06:30 + `check-nox-mem.sh` local
2. **Fase 1.6:** adicionar `search_telemetry` table + campo em `/api/health`
3. **Fase 1.7a:** telemetria por agente (quem usa USER-PROFILE no boot, frequência)
4. **Fase 2.5:** graph-memory metrics (compression ratio, recall hits)
5. **Path A:** writer queue depth, backpressure events, IPC latency
6. **Fase 2:** graphify build metrics, chunks added per day

### SLOs (de `audits/sre-deepening-2026-04-18.md`)

- Availability ≥ **99.5%** (single VPS, não 99.9%)
- Search p95 ≤ **500ms** (hoje 862ms — meta atingida após Fase 1.6)
- Reflect cache hit rate ≥ **40%** over 7d
- Consolidation staleness < **72h**
- **Zero** partial writes (apenas Path A garante)

### Backup strategy

- Daily: `backup-all.sh` às 02:00 (7d retention)
- Pre-release snapshots: `backups/tier0-*`, `tier1-*`, `gaps-fix-*`, `nox-mem-pre-nightly-*`
- WAL checkpoint: */6h
- Path C introduzirá WAL shipping

### Canário não-negociável

Teste `match_type: "semantic"` em resultado de search é **o** canário de sanidade. Nunca remover. Se sumir, Layer 2 morreu. Canary script em `/root/.openclaw/scripts/semantic-canary.sh`.

---

## Decisões Ainda Válidas (filtradas do nox-neural-memory v12)

| # | Decisão | Motivo |
|---|---|---|
| 1 | Query Strategy — Nox decide pelo tipo | Sem custo duplo, auditável |
| 2 | graphify vs nox-mem KG — complementares | Camadas diferentes (docs vs memória operacional) |
| 3 | Vault separado do workspace (`/root/vault/` + symlink) | Workspace pode crescer sem poluir stats/backups |
| 4 | Cross-Agent via SOUL.md (não algorítmico) | Over-engineering para 6 agentes |
| 5 | Obsidian = painel visual, não memória | Memória vive em nox-mem.db + graph-memory.db + graph.json |
| 6 | KG extraction Gemini 2.5 Flash (não Ollama) | 500 RPM free, thinkingBudget:0, stable |
| 7 | graph-memory plugin complementa (não substitui) | Curto prazo vs longo prazo, DBs isolados |
| 8 | Estratégia de camadas hot/warm/cold | 20K-70K entities: busca direta inviável |
| 9 | Notion = Tarefas & Deals apenas | Memória migra para nox-mem + Obsidian |
| 10 | TTL + Invalidation: `superseded_by` imune a TTL | Sem isso, histórico se perde no Smart Forgetting |
| 11 | **NOVO (0.5)** `/api/health` via JOIN source-of-truth | COUNT isolado mente sobre órfãos |
| 12 | **NOVO (0.5)** Semantic canary diário | Fail-silent é o pior tipo de falha |
| 13 | **NOVO (0.5)** Port via env (`NOX_API_PORT`) | Chrome squatter em :18800 — nunca hardcode |

---

## Explicitamente NÃO FAZEMOS

| Item | Razão |
|---|---|
| Migrar nox-mem para Postgres/PGLite (gbrain engine) | Adicionaria daemon + autovacuum + backup. SQLite WAL atende <5ms para 1.951 chunks. Revisitar se >500K entities |
| Adotar git-as-source-of-truth (gbrain markdown) | Filosofias opostas de storage. Significaria reescrever nox-mem do zero. Features individuais portáveis; arquitetura não |
| 30 MCP tools (gbrain) | Mais tools = mais manutenção. Manter 16 atuais; capabilities via search quality |
| Memgraph / Neo4j | Over-engineering para 371 entities. Revisitar se >500K |
| Atomic hybrid query (CTE única) | Latência atual <100ms. Ganho marginal |
| Dashboard React como roadmap item | Já existe (`agent-hub-dashboard`). Não reverter para roadmap |
| Expertise profiling automático | Over-engineering para 6 agentes com papéis fixos |
| Text2Cypher | Sem graph DB, não há Cypher |
| Productizar nox-supermem em paralelo com evolução interna | Divergência acumulada já é 6 meses. Priorizar paridade antes |

---

## Ritual de Progressão

**Checkpoint por fase:**
1. Executar deliverables (checkboxes)
2. Rodar verificação (comandos listados na fase)
3. Validar exit criteria (medidos, não feelings)
4. Atualizar `docs/nox-neural-memory.md` e este plano marcando fase como ✅
5. Executar canary + morning report = tudo verde
6. Observar 24-48h antes de avançar próxima fase

**Checkpoint semanal:**
- Revisar métricas em `/api/health`
- Checar `morning-report` tendências (restart count, 429 count, hit rate)
- Ajustar prioridades com base em tráfego real

**Checkpoint mensal:**
- Revisar decisões nesta lista — alguma virou obsoleta?
- Reavaliar "NÃO FAZEMOS" — alguma premissa mudou?
- Estimar quando Fase P (productização) fica viável

---

## Links Canônicos

- Visão estratégica: `docs/nox-neural-memory.md` (v12)
- Handoff da sessão 2026-04-18: `plans/2026-04-18-tier0-tier1-session-log.md`
- Audits de hoje: `audits/audit-2026-04-18-db-gaps-remediation.md`, `audits/sre-deepening-2026-04-18.md`, `audits/perf-baseline-2026-04-18.md`
- Paper técnico (stale, refletir v3.0.0): `paper-tecnico-nox-mem.md`
- Ferramenta de check local: `scripts/check-nox-mem.sh`
- VPS canonical: `ssh root@100.87.8.44:/root/.openclaw/workspace/`
