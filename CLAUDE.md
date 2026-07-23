# Claude Code Workspace

> Setup pessoal do Toto. Source-of-truth em `~/Claude/`, sincronizado pra `~/.claude/` via `scripts/sync-all-to-home.sh` (launchd nightly).

> **Perfil do Toto + hard rule PT-BR ("você", nunca "tu/vc")** vivem em `~/.claude/CLAUDE.md` (global, carrega em toda sessão). Não duplicar aqui — editar lá.

---

## Collaboration Style

- **Default:** terso, direto, português "você" (não "tu", não "vc"). Ship a coisa. End-of-turn summary em 1-2 linhas.
- **Learning mode** on-demand via `/learn`: Claude entrega decisões de 5-10 linhas (business logic, trade-offs, UX) e adiciona insight blocks curtos alongside code. `/learn off` pra voltar ao default.
- Plugin `learning-output-style` é deprecated upstream (CC 2.0.30). Usar `/learn`.

### Idioma

Escreva em português, mas mantenha SEMPRE em inglês os termos técnicos, comandos/CLI, identificadores de código, nomes de produtos/ferramentas e jargão de engenharia (commit, push, merge, branch, diff, build, deploy, pull request, rate limit, embeddings, retrieval, etc.). NÃO traduza esses termos nem crie equivalentes em português. (A regra "você", nunca "tu/vc", continua valendo — vive no `~/.claude/CLAUDE.md` global.)

---

## Model & Swarm Strategy

**Princípio:** modelo mais leve possível; swarms paralelos pra trabalho independente; opus só pra decisões complexas.

| Tarefa | Modelo | Exemplos |
|---|---|---|
| Busca/lookup simples | `haiku` | `explore`, `*-low` |
| Dev padrão | `sonnet` | `executor`, `designer`, `code-reviewer` |
| Arquitetura/planning | `opus` | `architect`, `planner`, `analyst`, `critic` |

**Regras de ouro:**
1. Haiku primeiro — só escale se a tarefa exigir
2. Paralelize sempre que possível (tarefas independentes = swarm)
3. Opus só pra decisões de arquitetura, não operacional

**Padrões de swarm** (múltiplos Task() calls em 1 message):
- Revisão múltipla: `Task(explore, "auth")` + `Task(explore, "api")` + `Task(explore, "tests")`
- Validação: `Task(build-fixer)` + `Task(security-reviewer-low)` + `Task(tdd-guide-low)`

**⚠️ HARD RULE — Multi-agent + git = `isolation: "worktree"` mandatory** (lesson cravada 2026-05-20, hook installed 2026-05-21):

Parallel agents que possam executar `git checkout`, `git checkout -b`, `git stash`, `git reset` em working tree compartilhado **CONTAMINAM HEAD** da parent session. Resultado: commits da main session landed em branch errada, ~15-30min de git surgery pra recovery.

| Cenário | Action |
|---|---|
| Agent vai abrir PR (precisa branch novo + commit + push) | **`isolation: "worktree"`** mandatory na chamada Agent tool |
| Agent só lê/analisa (sem git mutation) | OK sem worktree |
| Agent escreve files fora do repo (memory, /tmp) | OK sem worktree |
| Múltiplos agents em paralelo no mesmo repo | TODOS com worktree, sem exceção |

Symptoms de violação: `git push` reclama de upstream errado, `git log` mostra commits em branch que não era a current, `git branch --show-current` retorna branch que o agent criou (não a sua).

**Defense em camadas (escalated 2026-05-21 após 3 violations em 1 dia despite worktree set; escalada novamente 2026-05-24 8× leaks):**

1. `isolation: "worktree"` no Agent tool spawn — primeira linha (FRAGILE, sparse-checkout in `.claude/worktrees/` causes HEAD desync)
2. Pre-commit hook global em `~/.git-hooks-global/pre-commit` — **FAIL-SAFE automático** que aborta commit se parent path está em branch != main (RELIABLE)
3. Pre-commit hook override: `COMMIT_TO_NON_MAIN_OK=1 git commit ...` quando feature branch em parent é intencional
4. Discipline: `git branch --show-current` antes de `git add` no main session (terceira linha)
5. **RECOMENDADO 2026-05-24:** Agents devem usar `/tmp/<task>-$(uuidgen)` com fresh `git clone --depth 5`, NÃO `.claude/worktrees/`. Bypassa sparse-checkout entirely + isolate melhor.

Memory: `[[multi-agent-branch-checkout-race]]` + `[[pre-commit-hook-blocks-non-main-commits]]` + `[[worktree-isolation-sparse-checkout-root-cause]]` (memoria-nox). Incidents: 2026-05-20 ~09h30 BRT + 2026-05-21 3× + 2026-05-24 8×.

---

## PR & Versioning Policy

> Objetivo: histórico legível e rastreável em todo repo, com atrito perto de zero. A eficiência vem de **automação** (squash + auto-merge + template), não de disciplina manual. Estabelecido 2026-07-23.

**Tiering — nem toda mudança vira PR:**

| Mudança | Rota |
|---|---|
| Typo, doc, config pessoal, `.remember`, memory | Commit direto na `main` |
| Feature / fix / refactor com lógica | Branch → PR → **squash-merge** |
| Multi-agent / paralelo no mesmo repo | Worktree → PR **sempre** (ver HARD RULE acima) |
| Toca produção/cliente (Galapagos, Viridi live) | PR + review adversarial (GLM/Grok/Kimi) antes do merge |

**Convenção:** Conventional Commits (`feat()/fix()/chore()/docs()/refactor()`) em TODOS os repos. É o **commit** que vira histórico — `git log --oneline` conta a história inteira. O PR é o container de contexto ("por quê") + gate de CI.

**Defaults por repo:** squash-merge only, auto-merge on green, delete-branch-on-merge, PR template de 3 linhas (o quê / por quê / como testei). Aplicar com `scripts/setup-repo-pr-defaults.sh <owner/repo>`.

**Cadência:** um PR por unidade de trabalho terminada. Nunca PR de 40 arquivos no fim da semana; nunca PR por micro-commit.

**Ferramental (`scripts/`):**
- `ship.sh "<msg>" [path...]` — branch → commit (`COMMIT_TO_NON_MAIN_OK=1`) → push → PR. `--merge` liga auto-merge squash on green; `--draft` abre draft. Add **seletivo**; recusa `add -A` cego se houver submódulo mexido.
- `bump-submodules.sh` — audita os pointers de submódulo do umbrella; `--bump` reconcilia os que já estão pushados (`--push` empurra o commit se em `main`). Trabalho *dentro* de submódulo é do `ship`, rodado lá dentro.
- `setup-repo-pr-defaults.sh <owner/repo>` — aplica squash-only + auto-merge + delete-on-merge + template a um repo (precisa admin no repo).

**Submódulos (`~/Claude/Projetos/*`):** PR no submódulo primeiro (`cd Projetos/<x> && ship ...`, merge lá), **depois** bump do pointer no umbrella (`bump-submodules.sh --bump` ou o `sync-all-repos.sh` semanal). Nunca `git add Projetos/` cego.

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

- **SessionStart** — `hooks/context-mode-cache-heal.mjs` + **`hooks/nox-mem-brief.sh`** (2026-06-04, Session Priming Loop: injeta brief por salience do nox-mem VPS, scope=basename do cwd, via `https://srv1465941.tail4caa5b.ts.net` + Bearer em `~/.config/nox-mem/token`; fail-open, ~130ms).
- **SessionEnd + PreCompact** — `hooks/nox-mem-ingest.sh <kind>` (2026-06-04): deposita digest (`.remember/now.md`) no nox-mem como chunk daily/90d, dedup por session_id(+seq no pre_compact), redaction server-side. Fail-open.
- **claude-mem aposentado (2026-06-11) e desinstalado (2026-06-29)** — histórico backfilled no nox-mem VPS antes de desligar. **Arquitetura de memória atual: nox-mem (long-term, VPS) + remember (captura, `.remember/now.md` alimenta o ingest) + MEMORY.md nativo (preferências/índice).** (core-memory.json migrado pra entity `person/Toto` no KG, id=36.)
- **`sandbox.filesystem.denyRead`** (added 2026-05-06): bloqueia leitura de `~/.ssh`, `~/.aws`, `~/.openclaw/.env`, `~/.gnupg`, `~/.config/gh/hosts.yml`
- **`ENABLE_TOOL_SEARCH=auto:30`** em `~/.zshrc` (added 2026-05-06): defere descrições de MCP tools até passarem de 30% do contexto. Reduz overhead de 14 MCPs no system prompt.

---

## Agents Directory (em `~/Claude/agents/` → sync pra `~/.claude/agents/`)

Duas coleções com propósitos distintos. **Detalhes em `agents/README.md`.**

- **`00-core/`** (33 agents) — núcleo personalizado com **model routing** (variants `-low/-medium/-high` = haiku/sonnet/opus). Use **primeiro** pra qualquer task: analyst, planner, executor, architect, code-reviewer, security-reviewer, tdd-guide, explore, designer, etc.
- **`01-09-*/`** (~46 mantidos — **podado 2026-06-29** pra reduzir contexto de sessão) — catálogo de specialists stack-specific. Mantidos os **38 citados pelo `agent-orchestrator.yaml`** (rust era órfão → arquivado; postgres-pro, react-specialist, python-pro, etc ficaram). ~104 órfãos em `~/Claude-archive/_retired/agents/`. Use **só quando** tarefa exige profundidade que o core não cobre; specialist arquivado volta sob demanda (ver `agents/README.md`).

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
