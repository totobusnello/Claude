# herdr — cockpit de agentes + spaces alfabéticos

Setup pessoal sobre o **herdr 0.7.0** (terminal workspace manager pra AI coding agents, `brew`, https://herdr.dev). Server roda como LaunchAgent (`dev.herdr.server`, daemon). Config em `~/.config/herdr/`, estado runtime em `~/.config/herdr/session.json`.

Construído em 2026-06-22.

## 1. Cockpit de agentes (painel direito)

Painel ao vivo: por workspace mostra **tasks** (✔ feito / ▶ fazendo+progresso / ☐ a fazer), branch, contexto%, e a **árvore de agentes** (`⏺ main → ◯ subagente`) com **harness** (claude/codex/kimi), tempo e tokens.

| Arquivo | Papel |
|---|---|
| `herdr-agent-cockpit.py` | O painel. `--workspace <id>` filtra pro projeto; `--once` imprime 1×; arg numérico = refresh seg (default 4). |
| `herdr-cockpit-open.sh` | Abre o cockpit num split à direita do pane atual, **já escopado** no workspace daquele pane. Reusa um shell existente à direita; senão cria split. |

**Keybinding** (`~/.config/herdr/config.toml`): `prefix+shift+a` → `bash ~/Claude/scripts/herdr-cockpit-open.sh`.

**Fontes de dados:** `herdr agent list` (status/harness/workspace) + `herdr agent read <id> --source recent` (parse do render do Claude Code 2.1.x: tasks, statusline, árvore de agentes). Modelo do main vem de `[Opus 4.8 | API]` no statusline.

**Gotcha:** o modelo Claude **exato de um subagente *enquanto ele roda*** NÃO é exposto (statusline só tem `subagent_type`; o transcript só guarda o modelo do main). O harness (claude/codex/kimi) é inferido do type; o modelo só aparece quando o subagente **completa** (`Agent(...) Sonnet 4.6`).

## 2. Spaces sempre em ordem alfabética (home no topo)

O herdr 0.7.0 **não tem** sort nativo (sem setting, sem `herdr workspace reorder`, `herdr config` só `reset-keys`). A ordem da sidebar = ordem do array `workspaces` em `session.json` (por criação → novos caem no fim).

| Arquivo | Papel |
|---|---|
| `herdr-sort-spaces.py` | Reordena `workspaces` alfabético por `custom_name` (locale-aware p/ acentos), **home `~` cru fixo no topo**. Recalcula `active`/`selected` por `id`. Atômico + `.bak`. **Fail-safe: aborta se o server estiver vivo.** `--dry-run` mostra a ordem. |
| `herdr-server-launch.sh` | Wrapper do LaunchAgent: roda o sort (`\|\| true`) e então `exec herdr server`. **Fail-open** — server sobe mesmo se o sort falhar. |

**Plist** (`~/Library/LaunchAgents/dev.herdr.server.plist`): `ProgramArguments` → `/bin/bash` + `herdr-server-launch.sh` (em vez de `herdr server` direto).

**Por que não aplica ao vivo:** o server mantém `session.json` em memória e só relê **ao iniciar**. Reiniciar o server descarta os panes ativos. Logo o sort roda **antes** do server subir (via wrapper) e vale **no próximo start** (reboot, ou restart manual sem trabalho ativo):

```bash
launchctl kickstart -k gui/$(id -u)/dev.herdr.server   # ⚠️ reinicia os panes
```

Workspaces novos entram no fim durante a sessão; reordenam no próximo start.

## Reversão

- Cockpit: remover o bloco `prefix+shift+a` do `config.toml` + `herdr server reload-config`.
- Sort: no plist, voltar `ProgramArguments` pra `/opt/homebrew/bin/herdr` + `server`. Restaurar `session.json.bak` se preciso.

## Pós-upgrade do herdr

O plist e o `config.toml` são customizados à mão (não auto-gerenciados pelo herdr neste setup). Conferir se um `herdr update` não os sobrescreveu — reaplicar o wrapper/keybinding se sumirem.
