# Claude Code Workspace

> ⚠️ **CRITICAL HARD RULE — escalated 3× (2026-04-25 + 2026-05-03 + 2026-05-04):** NUNCA "tu/te/ti/teu/tua/vc" em PT-BR. SEMPRE "você + 3ª pessoa". Pre-send mental grep mandatório TODA resposta. São Paulo register, não sul/Iberian. Cross-project, sem exceção.

> Setup pessoal do Toto. Source-of-truth em `~/Claude/`, sincronizado pra `~/.claude/` via `scripts/sync-all-to-home.sh` (launchd nightly).

---

## Perfil do Toto Busnello (atualizado 2026-05-05)

**Posição atual — NÃO está em função executiva C-level hoje:**

- **Nuvini** — advisor + board member (não-executivo)
- **FII Treviso** — empreendedor e líder
- **Fundo Exclusivo de Investimento Lombardia** — líder
- **Granix** — co-founder
- **Galapagos Capital** — advisor de AI + member do Comitê AI

**Histórico:** já passou por todas posições C-level (CEO, CFO, CTO, CPO, CMO) em sua trajetória. Por isso fluência em todas essas linguagens. Hoje opera no nível **board / advisor / empreendedor / líder de fundo**, não como operador executivo.

**Implicações de colaboração:**
- Tom: nivel board/strategy/capital allocation, não tactical/ops detail (a menos que ele desça)
- Lente: governance, M&A, LP relationships, fund management, portfolio strategy — não só tech/product
- Bandwidth: maior que CEO operacional típico — boards e advisory permitem deep-dives
- **Nunca chamá-lo de "CEO/CFO/CTO/CPO/CMO de outra empresa"** (framing antigo, errado desde 2026)
- Conflitos potenciais a mapear antes de discutir governance: FII Treviso, Fundo Lombardia, Granix podem ter overlap setorial com clientes/operações de outros projetos (especialmente Galapagos)

---

## Collaboration Style

- **Default:** terso, direto, português "você" (não "tu", não "vc"). Ship a coisa. End-of-turn summary em 1-2 linhas.
- **⚠️ HARD RULE PT-BR (escalated 2× — 2026-04-25 + 2026-05-03):** NUNCA use "tu/te/ti/teu/tua/tuas/teus/vc" em resposta nenhuma. Sempre "você + 3ª pessoa" (você diz/pode/quer, NÃO tu dizes/podes/queres). Aplica em TODOS projetos (memoria-nox, openclaw-vps, nox-supermem, granix, frooty, galapagos, etc). Pre-send mental grep mandatório. São Paulo register, não sul/Iberian.
- **Learning mode** on-demand via `/learn`: Claude entrega decisões de 5-10 linhas (business logic, trade-offs, UX) e adiciona insight blocks curtos alongside code. `/learn off` pra voltar ao default.
- Plugin `learning-output-style` é deprecated upstream (CC 2.0.30). Usar `/learn`.

---

## Model & Swarm Strategy

**Princípio:** modelo mais leve possível; swarms paralelos pra trabalho independente; opus só pra decisões complexas.

| Tarefa | Modelo | Exemplos |
|---|---|---|
| Busca/lookup simples | `haiku` | `explore`, `*-low` |
| Dev padrão | `sonnet` | `executor`, `frontend-agent`, `code-reviewer` |
| Arquitetura/planning | `opus` | `architect`, `planner`, `analyst`, `critic` |

**Regras de ouro:**
1. Haiku primeiro — só escale se a tarefa exigir
2. Paralelize sempre que possível (tarefas independentes = swarm)
3. Opus só pra decisões de arquitetura, não operacional

**Padrões de swarm** (múltiplos Task() calls em 1 message):
- Revisão múltipla: `Task(explore, "auth")` + `Task(explore, "api")` + `Task(explore, "tests")`
- Validação: `Task(build-fixer)` + `Task(security-reviewer-low)` + `Task(tdd-guide-low)`

**⚠️ HARD RULE — Multi-agent + git = `isolation: "worktree"` mandatory** (lesson cravada 2026-05-20):

Parallel agents que possam executar `git checkout`, `git checkout -b`, `git stash`, `git reset` em working tree compartilhado **CONTAMINAM HEAD** da parent session. Resultado: commits da main session landed em branch errada, ~15-30min de git surgery pra recovery.

| Cenário | Action |
|---|---|
| Agent vai abrir PR (precisa branch novo + commit + push) | **`isolation: "worktree"`** mandatory na chamada Agent tool |
| Agent só lê/analisa (sem git mutation) | OK sem worktree |
| Agent escreve files fora do repo (memory, /tmp) | OK sem worktree |
| Múltiplos agents em paralelo no mesmo repo | TODOS com worktree, sem exceção |

Symptoms de violação: `git push` reclama de upstream errado, `git log` mostra commits em branch que não era a current, `git branch --show-current` retorna branch que o agent criou (não a sua).

Memory: `[[multi-agent-branch-checkout-race]]` (memoria-nox). Incident reference: `docs/INCIDENTS.md` 2026-05-20 ~09h30 BRT.

---

## Skills vs Agents

- **Skills** ativam automaticamente por keyword (ver `docs/project-detection-guide.md` → Skill Activation Keywords)
- **Agents** são chamados explicitamente: `"Use o agent <nome> para ..."`

Exemplos: `"Use o rust-engineer pra otimizar isso"`, `"Peça ao code-reviewer pra analisar esse PR"`, `"Use workflow-orchestrator pra coordenar essa feature"`.

---

## Project Detection

Ao abrir projeto novo, detectar stack via config files + estrutura + imports, sugerir 2-3 agents + skills úteis.

**Detalhes em `docs/project-detection-guide.md`** — tabelas de detection, task-type → agents, PowerPoint templates, MCP audit, workspace structure.

---

## Hooks & Settings (em `~/.claude/settings.json`)

- **PermissionRequest** — auto-allow/deny via `hooks/permission-auto.mjs` (rm -rf, curl|bash, fork bombs → deny; git-read, gh-read, safe utils → allow)
- **SubagentStart** — injeta session brief (branch, commits, CLAUDE.md map) em agents heavy-tier via `hooks/subagent-start.mjs`
- **`sandbox.filesystem.denyRead`** (added 2026-05-06): bloqueia leitura de `~/.ssh`, `~/.aws`, `~/.openclaw/.env`, `~/.gnupg`, `~/.config/gh/hosts.yml`
- **`ENABLE_TOOL_SEARCH=auto:30`** em `~/.zshrc` (added 2026-05-06): defere descrições de MCP tools até passarem de 30% do contexto. Reduz overhead de 14 MCPs no system prompt.

---

## Agents Directory (em `~/Claude/agents/` → sync pra `~/.claude/agents/`)

Duas coleções com propósitos distintos. **Detalhes em `agents/README.md`.**

- **`00-core/`** (32 agents) — núcleo personalizado com **model routing** (variants `-low/-medium/-high` = haiku/sonnet/opus). Use **primeiro** pra qualquer task: analyst, planner, executor, architect, code-reviewer, security-reviewer, tdd-guide, explore, designer, etc.
- **`01-09-*/`** (148 agents) — catálogo de specialists stack-specific (rust-engineer, postgres-pro, payment-integration, etc). Use **só quando** tarefa exige profundidade que o core não cobre.

**Frontmatter patterns** (added 2026-05-06):
- `skills: [name1, name2]` em subagent → injeta SKILL.md full no spawn (não só ref). Aplicado em `code-reviewer`, `architect`, `tdd-guide`, `security-reviewer`, `frontend-developer`.
- `context: fork` em SKILL.md → roda em subagent isolado, não polui main thread. Aplicado em `tob-codeql`, `tob-semgrep`, `deep-research`, `fulltest-skill`, `llm-eval`.

---

## Agent Orchestrator (AO)

CLI `ao` rodar de `~/Claude/`. Config em `agent-orchestrator.yaml` — **22 projetos** com `agentRules` específicos por stack. Comandos: `ao status`, `ao spawn`, `ao batch-spawn`, `ao dashboard`. Auto-reage a CI failures, PR reviews, stuck agents.

---

## Useful Scripts

- `scripts/sync-all-to-home.sh` — skills/agents/commands → `~/.claude/`
- `scripts/add-model-to-agents.js` — adiciona `model:` frontmatter nos agents que faltam
- `scripts/purge-disabled-plugins.py` — remove plugins órfãos do `~/.claude/plugins/cache/`
- `scripts/clean-allowlist.py` — enxuga `permissions.allow` em `~/.claude/settings.json`
- `scripts/uninstall-disabled-plugins.sh` — batch uninstall via CLI

---

*Catalogo completo: `cat INDEX.md`. Detection guide: `cat docs/project-detection-guide.md`.*
