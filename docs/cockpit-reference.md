# Cockpit de Trabalho — Referência (herdr + work + cw)

> Ritual de trabalho montado em 2026-06-20. herdr = multiplexer de terminal pra agents.
> Abre o iTerm → `herdr` → `work` → cockpit montado com briefing por projeto.

---

## Iniciar / fechar

| Ação | Comando |
|---|---|
| Abrir/atachar o cockpit | `herdr` (num terminal de verdade, não no Claude) |
| **Detach** (sai, agents seguem vivos) | `ctrl+b` `q` |
| Reattach depois | `herdr` |
| **Fechar de vez** (mata server + todos os panes) | `herdr server stop` |
| Começar do zero (sem restaurar) | `herdr server stop && rm ~/.config/herdr/session.json` |
| Status do server/workspaces | `herdr status` · `work list` |

---

## Comandos `work` (montar workspaces)

| Comando | O que faz |
|---|---|
| `work` | **contextual ao cwd**: dentro de um projeto → só ele; numa raiz de projetos (ex: `~/Claude/Projetos`) → todos os filhos; em outro lugar → todos os conhecidos. Sempre **alfabético**. |
| `work all` | força todos os projetos conhecidos |
| `work <nome>` | abre/foca UM projeto (fuzzy: `work gordon`, `work galap`) |
| `work swarm <proj> N` | N git-worktrees isolados (cada agent no seu, sem contaminar HEAD) |
| `work vps` | abre o workspace **VPS** sozinho (também abre **automático** em todo `work`/`work all`) |

> O workspace **VPS** entra **sempre** no cockpit (1 pane de **saúde**, idempotente). Decisão 2026-06-20: trocado de 3 panes `journalctl -f` (firehose de heartbeat = ruído) por **sinal**. O pane mostra, com refresh 30s:
> - status dos 3 services systemd (🟢 active / 🔴 outro): `openclaw-gateway`, `nox-mem-api`, `nox-mem-watch`
> - só os **erros** das últimas 2h (`journalctl -p err`), não o stream inteiro
> Responde em 1 olhada "tá de pé? teve erro?". Dashboard visual continua no atalho **`openclaw-dash`** (→ `http://localhost:18790`), sob demanda. Tudo via `ssh root@187.77.234.79`.
| `work close <nome>` | fecha UM workspace (ex: `work close VPS`; fuzzy: `work close galap`). `herdr workspace close <id>` é o equivalente cru. |
| `work list` | lista workspaces abertos + status |

Cada workspace abre com **pane 1** (briefing de sessão + **`cw` já pronto no prompt** — só dar Enter pra cair no Claude orientado; não auto-lança) e **pane 2** estreito (~26%) = **terminal livre**: mostra `git status -sb` de relance e fica pronto pra `git diff` / testes / `gh` sem parar o Claude do lado. (Sem `tail -f` automático — agregava pouco numa sessão de agent e o git já está no statusline do Claude.)
Lista de projetos: derivada do `agent-orchestrator.yaml` + Gordon + CIO. Editar em `scripts/work.sh` → função `projects()`/`known_projects()`.

---

## `cw` — Claude já orientado pelo projeto

| Comando | Comportamento |
|---|---|
| `claude` | genérico/puro (intacto) |
| **`cw`** | **mostra** o briefing E o injeta no system-prompt do Claude. Obs: o system-prompt é invisível na tela (normal); pra confirmar que pegou, pergunte ao Claude "qual o foco e os agents deste projeto?". |
| **`wb`** | só **mostra** o briefing (agents/skills/plugins/MCPs/foco), sem abrir o Claude. `wb` (pasta atual) ou `wb <pasta>` |

> `cw` e `wb` são **scripts em `~/.local/bin`** (no PATH) — funcionam em **qualquer pane, sem `source`**. (Antes eram funções do `.zshrc`, que exigiam re-source em cada pane.)

**Fechar sessão ≠ fechar pasta:** `/exit` (ou `Ctrl+D`) **dentro do pane** encerra só o Claude e mantém o workspace na lateral. `work close <nome>` remove a pasta da lateral. Não confunda os dois.

`cw` = `claude --append-system-prompt "$(work-brief.mjs --prompt)"`. É orientação, não coleira — o Claude ainda escolhe a ferramenta por tarefa.
O **briefing** mostra: agents preferenciais (do `agentRules` do AO yaml, senão por stack), skills/plugins/MCPs, comando AO sugerido, e o **foco atual** (busca em cascata: `now.md` → `HANDOFF.md` → `STATUS.md` → `CLAUDE.md §Estado` → `CHANGELOG`…, mostra a fonte).

---

## Atalhos herdr (prefix = `ctrl+b`)

| Atalho | Ação |
|---|---|
| `ctrl+b` `v` / `-` | split vertical / horizontal |
| `ctrl+b` `shift+n` | novo workspace |
| `ctrl+b` `w` | trocar de workspace |
| `ctrl+b` `c` | nova tab |
| `ctrl+b` `z` | zoom no pane (foco total) |
| `ctrl+b` `q` | detach |
| `ctrl+b` `shift+o` | **montar o cockpit** (roda `work`) de dentro do herdr |
| `ctrl+b` `?` | ajuda de atalhos |

---

## Integrations (detecção de status dos agents)

`settings > integrations` (ou `herdr integration install <agent>`). Faz o herdr mostrar **blocked/working/done** real do agent.
- ✅ **claude** — instalado
- ✅ **codex** — instalado (2026-06-20)
- ✅ **kimi** — instalado (2026-06-20; kimi-code `0.18.0`, hook em `~/.kimi-code/hooks/herdr-agent-state.sh`)
- ⚠️ **OpenClaw NÃO está na lista.** O herdr suporta: pi, omp, claude, codex, copilot, devin, droid, kimi, **opencode** (≠ OpenClaw), kilo, hermes, qodercli, cursor. Você pode **rodar** OpenClaw num pane normalmente — só não terá o status automático dele.

---

## VPS / OpenClaw — conectar e enxergar o Claude de lá

O OpenClaw roda no VPS (Hostinger `187.77.234.79` / Tailscale `100.87.8.44`), usa o Claude via provider `anthropic/` (OAuth). Três formas de enxergar:

1. **Dashboard do gateway** (mais visual):
   ```bash
   openclaw-dash            # alias: túnel SSH -L 18790:127.0.0.1:18789
   # abre http://localhost:18790 no Chrome
   ```
2. **Sessão ao vivo (tmux)** — vê o Claude/bot rodando:
   ```bash
   ssh root@100.87.8.44      # Tailscale (ou 187.77.234.79)
   tmux ls                   # lista sessões
   tmux attach -t <sessão>   # attacha (ex: o bot do Telegram)
   ```
3. **herdr remoto** (se instalar herdr no VPS):
   ```bash
   herdr --remote root@100.87.8.44
   ```
   Traz panes do VPS pro seu cockpit. Requer `brew/curl install herdr` no VPS.

> O herdr **não** tem adapter de status pro OpenClaw — mas qualquer uma das 3 vias acima te dá visão do que está rodando lá.

---

## O que mais vale configurar

- **Instalar a integração `codex`** (você usa): `herdr integration install codex`.
- **Notificações** (`settings > toasts`): avisar quando um agent fica `blocked`/`done` — útil em swarm longo.
- **herdr permanente** (sobreviver reboot): configurar launchd pro `herdr server` (hoje some no reboot).
- **`work vps`**: comando pra abrir o VPS dentro do cockpit (SSH + túnel dashboard) — a pedir.
- **Integrar `herdr agent wait --status blocked` no AO**: o AO reage a agents travados automaticamente (próximo nível).

---

## Arquivos do setup

| Arquivo | Papel |
|---|---|
| `~/Claude/scripts/work.sh` | orquestrador do cockpit |
| `~/Claude/scripts/work-brief.mjs` | engine de briefing (+ modo `--prompt` pro `cw`) |
| `~/.zshrc` (bloco `herdr work cockpit`) | alias `work` + hook de papéis de pane (brief/gitlog/vps) |
| `~/.local/bin/cw` · `~/.local/bin/wb` | scripts no PATH (sem `source`): `cw` = claude+briefing, `wb` = só briefing |
| `~/.config/herdr/config.toml` | keybinding `prefix+shift+o` |
| `~/.claude/hooks/herdr-agent-state.sh` | integração de status do Claude |
