# Claude Code Workspace

> Setup pessoal do Toto. Source-of-truth em `~/Claude/`, sincronizado pra `~/.claude/` via `scripts/sync-all-to-home.sh` (launchd nightly).

---

## Collaboration Style

- **Default:** terso, direto, português "você" (não "tu"). Ship a coisa. End-of-turn summary em 1-2 linhas.
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

## Hooks (em `.claude/settings.json` do projeto)

- **PermissionRequest** — auto-allow/deny via `hooks/permission-auto.mjs` (rm -rf, curl|bash, fork bombs → deny; git-read, gh-read, safe utils → allow)
- **SubagentStart** — injeta session brief (branch, commits, CLAUDE.md map) em agents heavy-tier via `hooks/subagent-start.mjs`

---

## Agent Orchestrator (AO)

CLI `ao` rodar de `~/Claude/`. Config em `agent-orchestrator.yaml` (7 projetos). Comandos: `ao status`, `ao spawn`, `ao batch-spawn`, `ao dashboard`. Auto-reage a CI failures, PR reviews, stuck agents.

---

## Useful Scripts

- `scripts/sync-all-to-home.sh` — skills/agents/commands → `~/.claude/`
- `scripts/add-model-to-agents.js` — adiciona `model:` frontmatter nos agents que faltam
- `scripts/purge-disabled-plugins.py` — remove plugins órfãos do `~/.claude/plugins/cache/`
- `scripts/clean-allowlist.py` — enxuga `permissions.allow` em `~/.claude/settings.json`
- `scripts/uninstall-disabled-plugins.sh` — batch uninstall via CLI

---

*Catalogo completo: `cat INDEX.md`. Detection guide: `cat docs/project-detection-guide.md`.*
