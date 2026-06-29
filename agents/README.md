# Agents Directory — Source-of-Truth

Setup do Toto. Sync pra `~/.claude/agents/` via `scripts/sync-all-to-home.sh` (launchd nightly).

## Estrutura

Duas coleções com propósitos distintos:

### `00-core/` — Núcleo personalizado (33 agents)

**Use isso primeiro.** Agents enxutos, opinionated, com **model routing** (variants `-low`/`-medium`/`-high` mapeadas pra haiku/sonnet/opus).

Cobertura: análise (analyst, planner, critic), execução (executor), arquitetura (architect), build (build-fixer), quality (code-reviewer), security (security-reviewer), TDD (tdd-guide), exploração (explore), pesquisa (researcher), QA (qa-tester), design (designer), ciência (scientist), vision, writer.

**Quando usar variants:**
- `-low` → tarefa trivial, lookup rápido (haiku)
- `-medium` ou base → padrão (sonnet)
- `-high` → arquitetura/decisão complexa (opus)

### `01-09-*/` — Catálogo de specialists (~46 mantidos)

Biblioteca importada de `awesome-claude-code-subagents` (ou similar). Use quando a tarefa exige expertise stack-specific que o core não cobre.

> **Podado em 2026-06-29** pra reduzir contexto: ~104 specialists órfãos (nenhuma referência no `agent-orchestrator.yaml` nem no fluxo) movidos pra `~/Claude-archive/_retired/agents/`. Mantidos os **38 citados pelo AO** (`react-specialist`, `nextjs-developer`, `python-pro`, `postgres-pro`, `devops-engineer`, `quant-analyst`, etc.) + `00-core` + `review`. Specialist arquivado volta sob demanda: `cp ~/Claude-archive/_retired/agents/<dir>/<nome>.md agents/<dir>/ && bash scripts/sync-all-to-home.sh`.

| Folder | Domínio | Exemplos |
|---|---|---|
| `01-core-development/` | dev geral | frontend-developer, backend-developer, fullstack-developer |
| `02-language-specialists/` | linguagens | rust-engineer, python-pro, golang-pro, swift-expert |
| `03-infrastructure/` | infra/cloud | cloud-architect, terraform-engineer, kubernetes-specialist |
| `04-quality-security/` | quality/security | security-auditor, penetration-tester, qa-expert |
| `05-data-ai/` | data/ML | data-engineer, ml-engineer, ai-engineer, llm-architect |
| `06-developer-experience/` | DX | dx-optimizer, build-engineer, refactoring-specialist |
| `07-specialized-domains/` | nichos | blockchain-developer, fintech-engineer, game-developer |
| `08-business-product/` | negócio | product-manager, business-analyst, market-researcher |
| `09-meta-orchestration/` | orquestração | workflow-orchestrator, agent-organizer, multi-agent-coordinator |
| `c-level/` | C-suite advisors | cs-cto-advisor, cs-ceo-advisor |
| `marketing/`, `product/`, `review/` | misc | cs-content-creator, cs-product-manager |

## Regra prática de routing

1. **Pergunta "qual agent pra essa task?"** — primeiro busca em `00-core/` (haiku/sonnet/opus apropriado)
2. **Se task exige stack profunda** (ex: "otimiza query Postgres", "audit Solidity contract") — vai pro folder numerado correspondente
3. **Se quer paralelismo barato** (busca/lookup) — `00-core/explore` (haiku) é mais barato que `research-analyst`

## Convenções

- **Frontmatter mínimo**: `name`, `description`, `model`, `tools`. Adicionar `skills:` quando agent depende de SKILL.md específica (auto-injeta no spawn). Adicionar `context: fork` quando subagent gera output pesado que polui main thread.
- **Tools restritivos**: reviewers só leem (`Read, Grep, Glob, Bash`); não dar Write/Edit pra agents de auditoria.
- **Modelo**: opus pra arquitetura/decisão; sonnet pra padrão; haiku pra busca/lookup. Variants `-low/-high` deixam essa escolha explícita.

## Sync

Editar source-of-truth aqui em `~/Claude/agents/`. Sync automático via launchd ou manual:
```bash
bash ~/Claude/scripts/sync-all-to-home.sh
```

---

Última reorganização: 2026-05-06 — `ralph-agents/` renomeado pra `00-core/`, duplicata `code-reviewer` resolvida (versão core opus venceu — two-stage spec-then-quality workflow).
