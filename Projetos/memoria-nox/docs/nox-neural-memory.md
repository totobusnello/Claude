# Nox Neural Memory — Segundo Cérebro do Toto Busnello

> Documento de visão — v7 (2026-04-11)
> **Status:** Fase 1 concluída. Decisões de arquitetura fechadas. Estratégia hot/warm/cold definida.

---

## Visão Central

**Objetivo:** Qualquer documento, contrato, planilha, gravação, nota ou conversa gerada pelo Totó — em qualquer área de atuação — vira conhecimento consultável em segundos via WhatsApp.

*"Qual era o múltiplo de EBITDA do deal SME?"*
*"O que o Sorensen disse sobre o prazo do 20-F?"*
*"Qual a área do terreno da Sorocaba?"*

Nox responde na hora, com fonte citada.

---

## O que já temos (base)

| Componente | Status |
|---|---|
| `memory/*.md` — decisions, lessons, pending, wip, people, projects | ✅ Operacional |
| **nox-mem v3.2** — Hybrid search (FTS5 + Gemini embeddings + RRF fusion), 1880 chunks, 51 MB | ✅ Operacional |
| **Knowledge Graph v2** — 384 entidades, 537 relações, extração via Gemini 2.5 Flash | ✅ Operacional (migrado 2026-04-11) |
| **Semantic search** — sqlite-vec, 3588 vetores, Gemini embeddings 3072d | ✅ Operacional |
| **Agent Expertise Map** — `shared/agent-expertise.md`, roteamento via SOUL.md | ✅ Operacional |
| **HTTP API** — porta 18800, 6 endpoints JSON para dashboard | ✅ Operacional |
| **MCP Server** — 14 tools via JSON-RPC 2.0 stdio | ✅ Operacional |
| `end-of-day` (22h) — consolida, git push, Notion | ✅ Operacional |
| `wip.md` — where I left off | ✅ Criado (Fase 1) |
| `feedback/approved.json` + `rejected.json` | ✅ Criado (Fase 1) |
| L1 índices em decisions.md e lessons.md | ✅ Criado (Fase 1) |
| GitHub `totobusnello/nox-workspace` — backup automático | ✅ Operacional |
| Time de 6 agentes via Discord | ✅ Operacional |
| Tailscale Mac (`100.119.65.10`) ↔ VPS (`100.87.8.44`) | ✅ Operacional |

---

## Decisões de Arquitetura

### 0. Query Strategy — como o Nox decide qual sistema consultar

**Decisão: Opção B — Nox decide pelo tipo de pergunta (não busca nos dois simultaneamente).**

```
Pergunta sobre conversa/decisão/time    → nox-mem KG + FTS5 + hybrid search
Pergunta sobre documento/contrato/repo  → graphify query
Pergunta ambígua                        → nox-mem primeiro → se não achar → graphify
```

**Por que não buscar nos dois sempre:**
- Evita resultados contraditórios (dois grafos respondendo coisas diferentes)
- Sem custo duplo de API por query
- Lógica simples e auditável — Nox aprende a classificar pelo contexto

**Roteamento entre agentes:**
Sistema simples via `shared/agent-expertise.md` (lido no boot). Cada agente tem expertise declarada — Nox roteia manualmente com base no SOUL.md. Expertise profiling automático é over-engineering para um time de 6 agentes com papéis fixos.

---

### 1. graphify vs nox-mem KG — complementares, não substitutos

| Dimensão | nox-mem KG v2 | graphify |
|---|---|---|
| **Escopo** | Memória operacional (conversas, decisões, lessons dos agentes) | Documentos estáticos (repos, PDFs, PPTX, XLSX, imagens) |
| **Extração** | Gemini 2.5 Flash (migrado de Ollama 2026-04-11) | Claude Vision (multimodal) |
| **Storage** | SQLite (`kg_entities`, `kg_relations`) | `graph.json` + Obsidian vault + wiki/ |
| **Query** | `kg-query`, `kg-path` (BFS), MCP tools | `graphify query`, `graphify path`, `graphify explain` |

**Decisão:** Operam em camadas diferentes. graphify indexa DOCUMENTOS. nox-mem indexa MEMÓRIA OPERACIONAL. A ponte entre eles: nox-mem ingere `GRAPH_REPORT.md` como chunk consultável.

```
Camada 1: graphify  → indexa DOCUMENTOS (PPTX, PDF, XLSX, repos)
Camada 2: nox-mem   → indexa MEMÓRIA OPERACIONAL (conversas, decisões, lessons)
Camada 3: busca unificada → agente recebe resultados de ambos
```

### 2. Path do vault — separado com symlink

**Decisão:** `/root/vault/` separado do workspace OpenClaw, com symlink para integração.

**Motivo:** O workspace operacional tem 51 MB. rsync do HD Mac pode trazer GBs. Misturar polui stats, backups e consolidation.

```
/root/vault/                           ← dados brutos (potencialmente grande)
├── projetos/                          ← git clones dos repos
├── documentos/                        ← rsync do HD Mac
└── reunioes/                          ← transcrições Fathom

/root/.openclaw/workspace/vault → /root/vault   (symlink)
```

**Fluxo:**
```
Mac (rsync) → /root/vault/documentos/
GitHub (git pull) → /root/vault/projetos/
Fathom (API) → /root/vault/reunioes/
     ↓
graphify --watch /root/vault/ → graph.json + GRAPH_REPORT.md
     ↓
nox-mem ingest GRAPH_REPORT.md → chunks consultáveis pelo hybrid search
agentes leem GRAPH_REPORT.md no boot → contexto completo
```

### 3. Cross-Agent Intelligence — real vs aspiracional

**O que existe hoje:**
- Todos os 6 agentes leem o mesmo banco nox-mem (workspace compartilhado)
- Especialização via SOUL.md de cada agente — Nox roteia manualmente
- `shared/agent-expertise.md` — mapa de expertise por agente, lido no boot

**O que NÃO existe hoje (e não é necessário agora):**
- DBs isolados por agente ❌
- Expertise profiling automático ❌
- Roteamento algorítmico ❌

**Quando faz sentido evoluir:** time com 20+ agentes e sobreposição de especialidades. Hoje é over-engineering.

---

### 4. Obsidian — view-only primeiro

**Decisão:** Fase 5a = view-only. Fase 5b (escrita bidirecional) só após 2-4 semanas de validação.

**Motivo:** O sistema já tem 29 cron jobs e 6 serviços. Adicionar 25 comandos e 4 agentes do obsidian-second-brain cria risco de conflito. O nox-mem já consolida conhecimento — Obsidian como visualizador é ouro, como escritor duplica responsabilidade.

### 5. KG extraction — Gemini 2.5 Flash (migrado 2026-04-11)

**Decisão:** Ollama llama3.2:3b (local, inativo) → Gemini 2.5 Flash (API, grátis).

**Motivo:** Ollama estava `inactive (dead)` no systemd desde ~março. KG congelado em 384 entidades sem ninguém perceber (fail-silent no código). Gemini usa a mesma API key dos embeddings, tem 500 RPM free tier, e `thinkingBudget: 0` elimina tokens desperdiçados em reasoning.

**Resultado do primeiro build:** 1489 entities + 348 relations extraídas, mentions aumentaram 70-78%, +8 relações novas. Logging ativo com tag `[KG-LLM]` e alerta após 5 falhas consecutivas.

### 6. graph-memory — plugin de contexto inline para conversas

**Decisão:** Adicionar [graph-memory](https://github.com/adoresever/graph-memory) como plugin OpenClaw para compressão de contexto e recall automático em conversas.

**O que faz:** Extrai triples (subject-relation-object) das conversas em tempo real, comprime contexto ~75% (95K→24K tokens), e injeta knowledge recall automaticamente antes de cada resposta. Cross-session: lembra de sessões anteriores sem intervenção manual.

**Por que complementa o nox-mem (não substitui):**
- nox-mem = memória de **longo prazo** (chunks, KG, documentos) — batch, cron
- graph-memory = memória de **curto prazo** (conversas ativas) — inline, real-time
- Operam em DBs separados (`graph-memory.db` vs `nox-mem.db`), hooks diferentes, zero conflito

**Custo:** ~1 call LLM a cada 7 turnos de conversa (não por mensagem). Extraction usa provider padrão do gateway. Embeddings via Gemini endpoint OpenAI-compatible.

**Riscos analisados e resolvidos:**
| Risco | Severidade | Mitigação |
|---|---|---|
| Custo LLM por mensagem | Baixo — 1 call/7 turnos | Usa provider padrão (Sonnet via RelayPlane) |
| Conflito com nox-mem | Mínimo — DBs e hooks isolados | Nenhuma ação necessária |
| Mais um SQLite | Baixo — auto-mantido, <50MB | Adicionar ao backup script |

### 7. Estratégia de camadas — hot/warm/cold

**Decisão:** Não buscar em todos os sistemas a cada pergunta. Usar cache hierárquico como CPU L1/L2/L3.

**Contexto:** Com GitHub + HD + Fathom indexados, o sistema pode chegar a 20K-70K entidades. Buscar em 70K entidades a cada mensagem no WhatsApp seria lento e caro. A solução é camadas com granularidades diferentes.

```
┌─────────────────────────────────────────────────────────────┐
│ Pergunta chega (WhatsApp/Discord)                           │
│                                                             │
│ L1 — HOT (real-time, <100ms)                                │
│ ├── graph-memory: triples da conversa ativa + recall        │
│ ├── nox-mem hybrid search: chunks mais relevantes           │
│ └── Tamanho: <5K entidades ativas                           │
│                        ↓ se L1 não achar                    │
│ L2 — WARM (on-demand, <2s)                                  │
│ ├── nox-mem KG completo: todas entidades com decay          │
│ ├── graphify GRAPH_REPORT.md: resumo do grafo documental    │
│ └── Tamanho: 5K-20K entidades                               │
│                        ↓ se L2 não achar                    │
│ L3 — COLD (batch, minutos)                                  │
│ ├── graphify query no graph.json completo                   │
│ ├── Busca direta no vault (/root/vault/)                    │
│ └── Tamanho: 20K-70K entidades                              │
└─────────────────────────────────────────────────────────────┘
```

**Medidas de proteção para não ficar pesado:**
1. **TTL agressivo** — decay -0.1/30d, prune threshold 0.3. Entidades sem menção em 90 dias são removidas
2. **Graph traversal max depth=2** — nunca depth=3+ (explode exponencialmente com nós centrais como "Toto" que tem 700+ mentions)
3. **Extração incremental** — só chunks novos/modificados (SHA256 cache). Nunca re-extrair todo o vault
4. **Vectorização lazy** — vetorizar os 1000 chunks mais acessados primeiro, expandir sob demanda
5. **GRAPH_REPORT.md como cache** — agentes leem resumo no boot (20 top entities), não fazem query no grafo completo
6. **DBs separados por camada** — graph-memory.db (hot), nox-mem.db (warm), graphify graph.json (cold). Nunca mergear tudo num banco só

---

## Fontes de Conhecimento

### 1. Projetos (GitHub — prioridade máxima)
- **Local Mac:** `~/claude/projetos/` — cada subpasta = um projeto
- **GitHub:** `github.com/totobusnello/<repo>` — um repo por projeto, maioria privado
- **Conteúdo:** PPTX, PDF, XLSX, DOCX, MD, código
- **Sync para VPS:** git clone + pull automático (cron horário)

### 2. Documentos pessoais (HD Mac — resto do HD)
- **Localização:** `~/Documents/`, `~/Downloads/`, outras pastas
- **Tipos:** PPTX, PDF, XLSX, DOCX, fotos, vídeos
- **Sync para VPS:** rsync via Tailscale (agendado ou sob demanda)

### 3. Reuniões (Fathom)
- **Ferramentas:** Zoom + Fathom, Google Meet + Fathom
- **O que gera:** transcrições automáticas por reunião, com speakers identificados
- **Sync para VPS:** Fathom API → cron noturno → vault
- **Pré-requisito:** Confirmar capabilities da Fathom API antes de comprometer fase

### 4. Conversas do time (já na VPS)
- **WhatsApp/Discord:** daily notes em `memory/YYYY-MM-DD.md`
- **Consolidação:** nox-mem consolidate (23h)

---

## Arquitetura Final

```
┌─────────────────────────────────────────────────────────────────┐
│                      FONTES (Mac + Nuvem)                        │
│                                                                   │
│  GitHub repos (totobusnello/*)    Fathom (transcrições)          │
│  HD Mac (PPTX/PDF/XLSX/DOCX)     WhatsApp/Discord               │
└──────────┬─────────────────┬───────────────────┬────────────────┘
           │ git pull (1h)   │ rsync (diário)    │ Fathom API (noturno)
           ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS — Hub Central                              │
│                                                                   │
│  /root/vault/              (dados brutos, separado do workspace) │
│    ├── projetos/           ← git clone de cada repo              │
│    ├── documentos/         ← rsync do HD Mac                     │
│    └── reunioes/           ← transcrições Fathom                 │
│                                                                   │
│  /root/.openclaw/workspace/vault → /root/vault (symlink)         │
│                                                                   │
│  EXTRAÇÃO DE CONHECIMENTO:                                       │
│  ├── graphify (Claude Vision) → graph.json + GRAPH_REPORT.md    │
│  ├── nox-mem KG (Gemini 2.5 Flash) → kg_entities + kg_relations │
│  └── nox-mem embeddings (Gemini) → vec_chunks (3072d)            │
│                                                                   │
│  BUSCA UNIFICADA:                                                │
│  ├── Layer 1: FTS5 BM25 (keyword) ──────────── [fts]            │
│  ├── Layer 2: Gemini semantic (vector) ─────── [semantic]        │
│  ├── Layer 3: RRF fusion ──────────────────── [hybrid]           │
│  └── Layer 4: graphify query (documentos) ── [graph]             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                       AGENTES                                     │
│                                                                   │
│  Boot: leem GRAPH_REPORT.md antes de qualquer busca              │
│  On-demand: graphify query "pergunta" → subgrafo + fonte         │
│  On-demand: nox-mem search "query" → hybrid search               │
│                                                                   │
│  Nox → responde Totó no WhatsApp com fonte citada                │
│  Lex → consulta contratos e cláusulas                            │
│  Atlas → research parte do conhecimento acumulado                │
│  Forge → histórico técnico + decisões de arquitetura             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    VISUALIZAÇÃO                                   │
│                                                                   │
│  Obsidian 3D (view-only) ← graphify vault via rsync             │
│  Dashboard React ← nox-mem HTTP API (:18800)                     │
│  WhatsApp/Discord ← agentes com contexto completo               │
│  graph.html — grafo interativo no browser                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sincronização Mac → VPS

### Projetos (GitHub — automático)
```bash
# Na VPS: clonar todos os repos do totobusnello (uma vez)
gh repo list totobusnello --limit 100 --json name,isPrivate \
  | python3 -c "import json,sys; [print(r['name']) for r in json.load(sys.stdin)]" \
  | xargs -I{} gh repo clone totobusnello/{} /root/vault/projetos/{}

# Cron horário na VPS: atualizar todos
find /root/vault/projetos/ -maxdepth 1 -type d | xargs -I{} git -C {} pull
```

### HD Mac (rsync via Tailscale)
```bash
# Script no Mac: ~/sync-vault.sh
#!/bin/bash
rsync -avz --delete \
  --exclude='*.DS_Store' \
  --exclude='node_modules/' \
  --include='*.pdf' \
  --include='*.pptx' \
  --include='*.xlsx' \
  --include='*.docx' \
  --include='*.png' \
  --include='*.jpg' \
  --include='*/' \
  --exclude='*' \
  ~/Documents/ \
  root@100.87.8.44:/root/vault/documentos/

# Agendar via launchd (diário às 2h) ou rodar manualmente quando quiser
```

### Reuniões (Fathom API)
```bash
# Cron noturno na VPS: puxa transcrições novas do Fathom
# Pré-requisito: validar Fathom API capabilities (endpoints, auth, rate limits)
# Script salva cada call em /root/vault/reunioes/YYYY-MM-DD-titulo.md
```

---

## Interface Visual — Obsidian 3D (view-only)

**Obsidian é o visualizador do segundo cérebro.** Fase inicial = somente leitura.

### Preview real — seus projetos como grafo

> Gerado a partir dos repos reais: `totobusnello/sao-thiago-fii`, `Area-Campolim-Sorocaba`, `Area-Manuel_Nobrega`, `Future-Farm`, `GalapagosApp`, `Granix-App`, `biolab-ai`, `nox-workspace`

![Grafo 3D dos projetos do Toto](grafo-toto-preview.jpg)

*Nós identificados nos seus repos: Nuvini, FII São Thiago, Área Sorocaba, Manuel Nóbrega, Future Farm, GalapagosApp, Granix, Biolab AI — conectados a documentos reais (PDFs, XLSX, DOCX, apresentações, análises)*

---

### O que você vê na tela

```
┌──────────────────────────────────────────────────┐
│     OBSIDIAN 3D GRAPH  —  o cérebro do Toto       │
│                                                  │
│    • Nuvini ●────● SME Deal ●─── R$174M       │
│       │              │                         │
│    ● Sorensen    ● SEC Filing                  │
│       │              │                         │
│    ● 20-F       ● Due Diligence               │
│                                                  │
│    ● FII Treviso ●── Contrato ●──● 2.400m²      │
│       │                                         │
│    ● Aeronaves ●────● Estrutura Fundo          │
│                                                  │
│  [ Clusters coloridos por área ]                │
│  Azul=Financeiro  Verde=Imóveis  Roxo=Pessoas   │
└──────────────────────────────────────────────────┘
```

**Cada nó é um conceito.** Cada aresta é uma relação.
Você clica em "Nuvini" → vê todos os deals, pessoas e documentos conectados.
Você clica em "Sorensen" → vê tudo que ele aparece: reuniões, contratos, decisões.

### Views disponíveis

| View | O que mostra | Como acessa |
|---|---|---|
| **3D Graph** | Galáxia completa rotacionável — todo o conhecimento | Plugin 3D Graph (BRAT) |
| **Local Graph** | Vizinhança de um nó (ex: tudo ligado a "SME Deal") | Clica num nó → Local Graph |
| **Canvas** | Quadro visual por projeto — timeline, tarefas, decisões | Plugin Canvas |
| **Dataview** | Tabelas SQL-like ("contratos assinados em 2025") | Plugin Dataview |
| **Graph Analysis** | Força dos clusters, nós mais centrais | Plugin Graph Analysis |

### Como o vault chega no Mac

```
VPS: graphify gera vault Obsidian em /root/vault/obsidian/
        ↓ Tailscale (100.87.8.44)
Mac: rsync noturno copia vault para ~/ObsidianVault/
        ↓
Tela: galáxia 3D interativa com todo o conhecimento (read-only)
```

### Plugins necessários (instalação única no Mac)

1. **BRAT** (Community Plugins) → adiciona `3D Graph v2.4.1`
2. **Dataview** → Community Plugins → Browse → Dataview
3. **Canvas** → já nativo no Obsidian 1.11+
4. **Graph Analysis** → Community Plugins → Browse

**Setup total:** ~20 minutos após vault gerado.

---

## Fases de Execução

### ✅ Fase 1 — Quick Wins (CONCLUÍDA — 2026-04-11)
- [x] `wip.md`, `feedback/approved.json`, `feedback/rejected.json`
- [x] L1 índices em decisions.md e lessons.md
- [x] Documento de visão no GitHub

### ✅ Fase 1.5 — KG Extraction Migration (CONCLUÍDA — 2026-04-11)
- [x] Diagnosticar Ollama inativo no systemd
- [x] Migrar `kg-llm.ts` de Ollama para Gemini 2.5 Flash
- [x] Adicionar logging com tag `[KG-LLM]` e alerta após 5 falhas
- [x] Configurar `thinkingBudget: 0` + `responseMimeType: "application/json"` + schema nativo
- [x] Build + teste real: 10 entidades, 6 relações extraídas com sucesso
- [x] Rodar `kg-build --limit 1000`: 1489 entities + 348 relations processadas
- [x] Resultado: mentions aumentaram 70-78%, +8 relações novas, KG descongelado

---

### Fase 1.7 — Reasoning Traces + Multi-Stage Extraction (aguardando OK)
**Objetivo:** Agentes gravam como chegaram nas respostas. Extração de entidades fica mais eficiente.
**Tempo estimado:** 1-2h

**Reasoning Traces (~50 linhas em TypeScript):**
- Novo tipo de chunk `reasoning_trace` no nox-mem
- Quando agente responde query complexa (WhatsApp/Discord), grava: query → fontes consultadas → dados extraídos → resposta
- Queries similares futuras encontram o trace via hybrid search e respondem mais rápido
- Nox pode responder "como você chegou nessa resposta?" com fonte

**Multi-Stage Extraction (~30 linhas em `kg-llm.ts`):**
- Antes de chamar Gemini 2.5 Flash, rodar regex para entidades óbvias:
  - Nomes próprios (palavras com maiúscula que não iniciam frase)
  - Valores monetários (R$, US$, €)
  - Datas (DD/MM/YYYY, mês por extenso)
  - Emails, URLs, telefones
- Se regex extrair ≥3 entidades de um chunk simples, pula call Gemini
- Se chunk for complexo (poucas entidades por regex), chama Gemini normalmente
- **Ganho:** Reduz 30-40% das calls Gemini no `kg-build` semanal

**Ontology Grounding (mudança de prompt, zero código novo):**
- Em vez de "extraia entidades genéricas", o prompt define campos por tipo:
  - `project`: name, value (R$), status, key_person, ebitda_multiple
  - `person`: name, role, organization, relationship_to_toto
  - `document`: name, type (contrato/apresentação/análise), date, parties
  - `decision`: what, who_decided, date, outcome
- Gemini 2.5 Flash com `responseSchema` já suporta isso nativamente
- **Ganho:** Nox responde "Nuvini: R$174M, 8x EBITDA, Sorensen" ao invés de "Nuvini é um project"

**Conflict Detection (query SQL no kg-build, ~20 linhas):**
- Quando `kg-build` encontra entidades com mesmo nome mas atributos conflitantes, loga o conflito
- Exemplo: doc 2024 diz "FII São Thiago = 2400m²", transcrição 2026 diz "renegociamos para 3200m²"
- Conflitos são marcados para revisão — Nox avisa "há informação conflitante sobre isso"
- Crítico quando graphify + HD + Fathom trouxerem dados de épocas diferentes

**Invalidation Chains (2 campos novos em kg_entities, ~15 linhas):**
- Adicionar `valid_until` + `superseded_by` na tabela `kg_entities`
- Quando entidade é atualizada, a antiga recebe `valid_until = now()`, nova referencia a antiga
- Nox responde com dados mais recentes e pode dizer "isso mudou desde março"
- Histórico preservado — nunca deletar, só invalidar

**Source Text Preservation (1 campo novo no schema):**
- Guardar raw text original junto com entidades extraídas (`source_text` na kg_entities)
- Quando extração não cobre a pergunta, fallback para busca no verbatim
- Custo: mais storage, zero LLM. MemPalace prova que raw + bom retrieval = 96.6% accuracy

**Hierarchical Tagging — scope/category/topic (mudança de prompt):**
- 3 campos de metadata por entidade, inspirado no palace structure (+34% retrieval accuracy)
- `scope`: projeto ou pessoa (ex: `nuvini`, `fii-sao-thiago`, `toto`)
- `category`: tipo de conhecimento (ex: `decisions`, `contracts`, `people`)
- `topic`: subtópico específico (ex: `pricing`, `ebitda`, `terreno`)
- Hybrid search filtra por scope/category antes de buscar — reduz espaço de busca
- Prompt do Gemini pede para classificar cada entidade nos 3 níveis

**Smart Forgetting (TTL inteligente, ~10 linhas no extractor):**
- Quando Gemini extrai entidade com data ("reunião amanhã", "prazo sexta", "evento 15/04"), calcular TTL relativo
- Fatos temporais: TTL = data + 7 dias (margem). Fatos permanentes: TTL = 90 dias (atual)
- Evita poluição do KG com informação expirada — "prova amanhã" de 3 meses atrás some automaticamente

**User Profile Cache (`USER-PROFILE.md`, gerado pelo cron):**
- Resumo auto-gerado do Toto: top facts, projetos ativos, preferências, decisões recentes
- Injetado no boot de todo agente — Nox sabe quem é o Toto sem re-ler chunks
- Evolução do `KG-SUMMARY.md` (que só tem stats) para perfil de contexto rico
- Gerado semanalmente após kg-build (mesmo cron)

**Resultado:** Memória de raciocínio + economia de API + entidades ricas + detecção de contradições + versionamento de fatos + auto-esquecimento inteligente + perfil de usuário persistente.

**Nota:** Se a Fase 1.7 ficar grande na execução, quebrar em 1.7a (core: reasoning + multi-stage + ontology) e 1.7b (quality: conflicts + invalidation + forgetting + user profile).

**Inspiração:** [neo4j-labs/agent-memory](https://github.com/neo4j-labs/agent-memory) (reasoning traces, multi-stage extraction) + [topoteretes/cognee](https://github.com/topoteretes/cognee) (ontology grounding) + [kraklabs/mie](https://github.com/kraklabs/mie) (conflict detection, invalidation chains) + [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) (smart forgetting, user profiles) + [MemPalace/mempalace](https://github.com/MemPalace/mempalace) (verbatim preservation, hierarchical tagging — 96.6% LongMemEval).

---

### Fase 2 — Graphify + GitHub Projetos (aguardando OK)
**Objetivo:** Primeiro grafo real sobre os projetos do Totó.
**Tempo estimado:** 2-3h

**Passos:**
1. `pip install graphifyy` na VPS
2. `graphify install --platform claw` (escreve no AGENTS.md)
3. Criar `/root/vault/` + symlink no workspace
4. Clonar repos prioritários do GitHub na VPS (`/root/vault/projetos/`)
5. `/graphify /root/vault/projetos/` — primeiro grafo
6. Analisar GRAPH_REPORT.md: quais são os god nodes? Quais conexões surpresa?
7. Cron horário: `git pull` em todos os repos
8. Cron diário 23h30: `graphify --update /root/vault/` (rebuild incremental)
9. Agentes passam a ler GRAPH_REPORT.md no boot
10. nox-mem ingest GRAPH_REPORT.md (ponte graphify → hybrid search)

**Resultado:** Nox sabe o que está em todos os projetos do Totó. Primeira query real.

---

### Fase 2.5 — graph-memory Plugin (aguardando OK)
**Objetivo:** Agentes ganham memória de curto prazo — compressão de contexto e recall automático em conversas via WhatsApp/Discord.
**Tempo estimado:** 30 min (plugin install + config)

**Passos:**
1. `pnpm openclaw plugins install graph-memory` na VPS
2. Configurar no `openclaw.json`:
   - `compactTurnCount: 7` (extrai triples a cada 7 turnos)
   - `recallMaxNodes: 6` (injeta até 6 nós de recall)
   - `recallMaxDepth: 2` (max 2 hops no grafo)
   - LLM: usa provider padrão do gateway (Sonnet via RelayPlane)
   - Embeddings: Gemini via endpoint OpenAI-compatible (já pago)
3. Adicionar `graph-memory.db` ao backup script
4. Testar: conversa longa no WhatsApp → verificar compressão e recall
5. Monitorar por 1 semana antes de considerar concluído

**Resultado:** Nox no WhatsApp lembra o que conversou ontem. Contexto de 174 mensagens cabe em 24K tokens.

---

### Fase 3 — HD Mac via rsync (aguardando OK)
**Objetivo:** Documentos pessoais (PPTX, PDF, XLSX, DOCX) indexados.
**Tempo estimado:** 1h setup + tempo do rsync inicial (depende do volume)

**Passos:**
1. Script `sync-vault.sh` no Mac (rsync via Tailscale para `/root/vault/documentos/`)
2. Definir pastas prioritárias (quais `~/Documents/` primeiro?)
3. Primeiro rsync manual
4. graphify processa os novos arquivos (`--update`)
5. launchd no Mac: sync diário às 2h

**Nota:** fotos e vídeos pesados → filtrar por extensão, só PPTX/PDF/XLSX/DOCX no primeiro round.

---

### Fase 3.5 — Fathom API (paralela, opcional, aguardando OK)
**Objetivo:** Reuniões indexadas automaticamente, sem esforço.
**Não bloqueia Fase 4.** Se API Fathom não existir ou for limitada, projeto continua.
**Tempo estimado:** 3-4h

**Pré-requisito:** Validar Fathom API capabilities antes de comprometer esta fase.
- [ ] Fathom tem API REST pública? Quais endpoints?
- [ ] Auth token disponível? Rate limits?
- [ ] Export de transcrições com speakers identificados?

**Passos:**
1. Validar API (pré-requisitos acima)
2. Script Python: puxa calls novas desde última execução → salva como .md em `/root/vault/reunioes/`
3. Cron noturno 1h: roda o script
4. graphify --update processa as transcrições novas

**Resultado:** Reunião de hoje → indexada amanhã cedo → Nox responde "o que foi decidido na call de quinta?"

---

### Fase 4 — Obsidian View-Only (aguardando OK)
**Objetivo:** Visualizar a galáxia de conhecimento no Mac sem risco.
**Tempo estimado:** 1h

**Passos:**
1. graphify gera `graphify-out/obsidian/` como vault pronto
2. rsync do vault da VPS para o Mac (`~/ObsidianVault/`)
3. Instalar plugins (BRAT + 3D Graph, Dataview) — 20 min
4. Cron noturno: VPS → Mac via Tailscale

**Resultado:** Galáxia 3D interativa, zero risco de corrupção de dados.

**Alternativa leve:** [Memory-Knowledge-Graph-3D](https://github.com/TheSethRose/Memory-Knowledge-Graph-3D) — visualização 3D no browser via JSON, sem instalar Obsidian. Pode rodar na VPS (acessível via Tailscale) ou local (`npm start`). Útil para preview rápido antes do setup completo do Obsidian, ou se Obsidian se provar pesado demais.

### Fase 4b — Obsidian Write (futuro, condicional)
**Pré-requisito:** 2-4 semanas usando Obsidian view-only. Só avançar se sentir falta de escrita.

**Se aprovada:**
- Começar com 1 comando (`/obsidian-save`) antes de 25
- Avaliar conflito com consolidation do nox-mem
- Agente noturno para reconciliar

---

### Fase 5 — openclaw-memory-sync (aguardando OK)
**Objetivo:** Sync bidirecional Obsidian ↔ OpenClaw.
**Tempo estimado:** 1h

Plugin Obsidian que conecta na porta 18789 (gateway) e sincroniza a cada 5 minutos:
- Memórias do OpenClaw → notas Obsidian
- Notas Obsidian → contexto dos agentes

---

## Decisões Fechadas (2026-04-11)

| Decisão | Escolha | Motivo |
|---|---|---|
| Query strategy | Opção B — Nox decide pelo tipo | Sem custo duplo, sem conflito, auditável |
| Dashboard React | Mover para Evoluções Futuras | Sem fase definida, não pertence na arquitetura atual |
| Cross-Agent | Expertise via SOUL.md + agent-expertise.md | Over-engineering para 6 agentes |
| Sequência crons | graphify (23h30) → precompact (23h45) | Constraint explícita documentada |
| Fathom | Fase 3.5 paralela, não sequencial | Não bloqueia o resto do projeto |
| Obsidian | View-only primeiro, 2-4 semanas antes de escrita | Evita conflito com nox-mem consolidation |
| graph-memory | Plugin complementar (Fase 2.5) | Memória curto prazo (conversas) vs nox-mem longo prazo (documentos) |
| Estratégia de camadas | Hot/warm/cold com DBs separados | Com 20K-70K entidades, buscar em tudo a cada pergunta é inviável |
| Memgraph | Evolução futura (>500K entidades) | Over-engineering severo para 384 entidades atuais |

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| **Storage VPS** — rsync do HD Mac traz GBs | Disco cheio, backups lentos | `/root/vault/` separado, filtro por extensão, monitorar `df -h` |
| **Custo API Gemini** — graphify usa Claude Vision por arquivo | Billing inesperado | Usar free tier, monitorar RPM, processar em batches |
| **Fathom API** — pode não existir ou ser limitada | Fase 4 inviável | Validar capabilities ANTES de implementar |
| **Single point of failure** — tudo na VPS | Perda total se VPS cair | Backups diários (já existem), vault no GitHub, rsync bidirecional |
| **Dois sistemas de grafo** — graphify + nox-mem KG | Dados inconsistentes | Query strategy Opção B (Nox decide), GRAPH_REPORT.md como ponte |
| **inotifywait + symlinks** — watcher pode não seguir symlinks | Vault não monitorado | Testar com `-r` na Fase 2, fallback: cron em vez de watch |
| **Escala 20K-70K entidades** — graph traversal fica lento | Queries >2s no WhatsApp | Camadas hot/warm/cold, TTL 90d, max depth=2, extração incremental |
| **KG extraction batch** — 50K docs via Gemini = horas | Custo API, rate limit | SHA256 cache (só novos), vectorização lazy (top 1000 primeiro) |

---

## Métricas de Sucesso por Fase

| Fase | Métrica | Meta |
|---|---|---|
| ✅ 1 | Arquivos criados, índices funcionais | Concluído |
| ✅ 1.5 | KG extraction rodando, logging ativo | Concluído (1489 extrações) |
| 1.7 | Reasoning traces gravando, regex reduzindo calls Gemini | ≥30% menos calls Gemini no kg-build |
| 2 | `graphify query` retorna resultados reais dos repos | ≥ 80% queries com resposta |
| 2.5 | Compressão de contexto ativa, recall cross-session funcionando | <30K tokens em conversa de 7+ rounds |
| 3 | Documentos do HD consultáveis via Nox | ≥ 50 docs indexados na primeira rodada |
| 3.5 | Reuniões da última semana consultáveis | ≤ 24h delay entre reunião e indexação |
| 4 | Obsidian rodando no Mac com grafo visual | Setup completo, vault atualizado diariamente |
| 4b | Nox escreve no vault sem conflitos | Zero corrupção em 2 semanas |
| 5 | Sync bidirecional < 5 min delay | Entidade criada no OpenClaw aparece no Obsidian em 5 min |

---

## Referências Estudadas

| Repo | O que traz | Status |
|---|---|---|
| [glaucobrito/unified-memory-ai-agents](https://github.com/glaucobrito/unified-memory-ai-agents) | wip.md, feedback loop, L0/L1/L2, auto-precompact — 33 dias em produção | Aplicado (Fase 1) |
| [safishamsi/graphify](https://github.com/safishamsi/graphify) | Grafo semântico multimodal — 71.5x menos tokens, suporte OpenClaw nativo | Fase 2 |
| [adoresever/graph-memory](https://github.com/adoresever/graph-memory) | KG context engine — compressão 75%, recall automático cross-session, PageRank, community detection | Fase 2.5 |
| [eugeniughelbur/obsidian-second-brain](https://github.com/eugeniughelbur/obsidian-second-brain) | 25 comandos, vault auto-reescrevente, 4 agentes agendados, preset executive | Fase 4b (condicional) |
| [openclaw/openclaw#22958](https://github.com/openclaw/openclaw/issues/22958) | Feature request oficial: Obsidian como memória externa do OpenClaw | Referência |
| [YearsAlso/openclaw-memory-sync](https://github.com/YearsAlso/openclaw-memory-sync) | Plugin Obsidian ↔ OpenClaw sync bidirecional, porta 18789 plug-and-play | Fase 5 |
| [neo4j-labs/agent-memory](https://github.com/neo4j-labs/agent-memory) | 3 camadas (short/long/reasoning), POLE+O model, multi-stage extraction, MCP 16 tools | Fase 1.7 (ideias) |
| [topoteretes/cognee](https://github.com/topoteretes/cognee) | Knowledge engine, ontology grounding, remember/recall API, outcome tracking, Claude Code hooks | Fase 1.7 (ontology) |
| [kraklabs/mie](https://github.com/kraklabs/mie) | Single binary Go, conflict detection, invalidation chains, typed nodes, cross-agent daemon | Fase 1.7 (conflicts, versioning) |
| [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) | #1 em 3 benchmarks, smart forgetting, user profiles ~50ms, contradiction resolution, connectors | Fase 1.7 (forgetting, profiles) |
| [MemPalace/mempalace](https://github.com/MemPalace/mempalace) | 96.6% LongMemEval, raw verbatim storage, palace structure (+34% retrieval), zero API, local only | Fase 1.7 (source_text, scope/category/topic) |
| [memgraph/memgraph](https://github.com/memgraph/memgraph) | Graph DB in-memory C++, Cypher, 40+ algoritmos MAGE, vector+text indexes, GraphRAG atômico | Evolução futura |
| Guia @brunobracaioli | Tutorial prático graphify + métrica 71.5x confirmada | Referência |

---

## Evoluções Futuras (não prioritárias agora)

Ideias estudadas que fazem sentido quando o sistema crescer, mas são over-engineering hoje.

### Graph database dedicado (Memgraph ou Neo4j)
**Quando:** KG ultrapassar 500K entidades com queries multi-hop complexas em real-time.
**O que traz:** Cypher query language, 40+ algoritmos nativos (PageRank, community detection, GNNs, link prediction), vector+text indexes em query única, sub-millisecond traversals.
**Por que não agora:** Com 384 entidades, SQLite responde em <5ms. Memgraph é in-memory (consome 500MB-1GB+ RAM), precisa Docker, é mais um serviço para manter. Ferrari para percurso de 5km.
**Gatilho:** Se graph traversal depth=2 começar a demorar >2s ou se precisar de algoritmos que SQLite não suporta (link prediction, temporal graphs).

### Atomic hybrid query (CTE no SQLite)
**Quando:** Latência do hybrid search ultrapassar 500ms.
**O que traz:** Combinar FTS5 + vector + RRF fusion numa única CTE (Common Table Expression) do SQLite, ao invés de 3 queries separadas em TypeScript.
**Por que não agora:** 3 queries separadas rodam em <100ms total. O ganho seria marginal.

### Obsidian escrita bidirecional
**Quando:** Após 2-4 semanas usando Obsidian view-only (Fase 4). Só se sentir falta.
**O que traz:** Vault que cresce sozinho, agente noturno reconcilia, /obsidian-save, /obsidian-challenge.
**Por que não agora:** Duplica responsabilidade com nox-mem consolidation. Risco de conflito alto.

### Text2Cypher para queries naturais
**Quando:** Se migrar para Memgraph/Neo4j.
**O que traz:** "Quais projetos o Sorensen participou?" → Cypher automático → resultado do grafo.
**Por que não agora:** Sem graph database, não há Cypher. O hybrid search do nox-mem já cobre 80% desses casos.

### Self-Evolving Hooks — Feedback Loop Automático (spec: 2026-04-12)
**Quando:** Implementável agora — complementa nox-mem com aprendizado local.
**O que traz:** 3 hooks no Claude Code local (Mac) que capturam correções do usuário e transformam em regras permanentes automaticamente. O sistema aprende com "não faz assim" sem intervenção manual.
**Fonte:** [buildthisnow.com/blog/real-examples/self-evolving-hooks](https://www.buildthisnow.com/blog/real-examples/self-evolving-hooks)
**Spec detalhado:** `specs/2026-04-12-self-evolving-hooks.md`

**Arquitetura (3 hooks):**
1. **`on-stop.js`** (Stop hook) — Quando sessão encerra, captura transcript: mensagens humanas, agentes rodados, skills lidas → salva JSONL em `.claude/learning/sessions/`
2. **`dream.js`** (Background worker) — A cada 4h+ com 3+ sessões novas, spawna `claude -p --model haiku` que analisa padrões de correções e escreve regras em `.claude/learning/global.md` ou por agente/skill. Max 5 regras/run. 1 sessão = ruído, 2+ = regra.
3. **`subagent-start.js`** (PreToolUse: Agent) — Injeta regras aprendidas no boot de cada subagent.

**Bridge Local → VPS:** O dream worker pode opcionalmente ingerir regras no nox-mem via HTTP API (:18800), fechando o loop: correções no Mac → regras para agentes na VPS.

**Princípios:** User é ground truth (não avaliador AI), captura raw / interpreta depois, noise filtering (2+ sessões), auto-limitação (max 5 regras/run, cooldown 4h).

**Por que é relevante agora:** O nox-mem resolve memória para agentes VPS, mas no Claude Code local as correções se perdem. Este é o elo que faltava — feedback loop automático sem esforço manual. Custo: ~$0.01/dream run (Haiku).

---

## Ganhos Esperados por Fase

| Fase | Ganho principal |
|---|---|
| ✅ 1 | Boot -60% tokens. Feedback loop. Continuidade entre sessões. |
| ✅ 1.5 | KG vivo novamente. Extração via Gemini 2.5 Flash. Logging ativo. |
| 1.7 | Agentes aprendem com decisões passadas. 30-40% menos calls Gemini. |
| 2 | Projetos consultáveis. Primeiro "pergunta qualquer coisa" real. |
| 2.5 | Nox lembra conversas anteriores no WhatsApp. Contexto comprimido 75%. |
| 3 | HD completo indexado. Documentos de todas as áreas disponíveis. |
| 3.5 | Reuniões indexadas automaticamente. Zero esforço manual. |
| 4 | Galáxia 3D visual no Mac. Obsidian como painel de controle. |
| 4b | Vault que cresce sozinho (condicional). |
| 5 | Loop fechado: Obsidian ↔ OpenClaw em tempo real. |
| SEH | Claude Code local aprende com correções. Bridge Mac→VPS. |

---

## Próximos Passos — Aguardando OK do Totó

**Para começar Fase 2 hoje:**
- [ ] OK do Totó para executar
- [ ] Confirmar quais repos priorizar (Nuvini? FII? todos?)
- [ ] gh auth na VPS tem acesso aos repos privados? (verificar)

**Para Fase 3:**
- [ ] OK do Totó
- [ ] Definir pastas do HD Mac para incluir no primeiro rsync

**Para Fase 4:**
- [ ] OK do Totó
- [ ] Validar Fathom API capabilities
- [ ] Auth token do Fathom (Settings → API)

---

*Documento vivo — atualizado após cada fase concluída.*
*Última atualização: 2026-04-12 v8 — Self-Evolving Hooks (feedback loop automático) adicionado como evolução futura com spec detalhado, bridge Mac→VPS via HTTP API.*
