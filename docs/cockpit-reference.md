# Cockpit de Trabalho — Referência (herdr + work + cw)

> Ritual de trabalho montado em 2026-06-20, **layout de 4 colunas + monitor de atividade adicionados em 2026-06-25**; **col 3 virou o `git-glance` (ahead/behind + ação) em 2026-06-29**.
> herdr = multiplexer de terminal pra agents. Abre o iTerm → `herdr` → `work` → cockpit montado com briefing por projeto.

---

## Layout de cada space (4 colunas)

Todo space montado fica **idêntico**, da esquerda pra direita:

| Col | O que é | Largura | Como |
|---|---|---|---|
| **1** | **spaces + agents** | ~13% | sidebar nativa do herdr (lista de workspaces + status dos agents) |
| **2** | **claude** (a sessão) | ~36% | pane do briefing → `cw` pronto no prompt; vira o Claude ao dar Enter |
| **3** | **git-glance** (FIXO) | ~29% | `herdr-git-glance.sh` no repo do space — sincronização git (ver abaixo) |
| **4** | **monitor / atividade ao vivo** | ~22% | `herdr-agent-cockpit.py` escopado no space (ver abaixo) |

**Regra: nenhum pane vazio.** As proporções são fixas e iguais em todo space (ratios de split `0.42` claude / `0.56` git-glance sobre a área de panes).

O layout é **garantido em todos os spaces** (os que já existem e os novos) e **persiste após reiniciar o herdr** — via o *watcher* (abaixo), que reconstrói `[claude | git-glance | monitor]` no boot e ao focar cada space (idempotente: só age se estiver fora do alvo).

> **Custo:** o git-glance é um loop `bash` leve (git local a cada 15s, alguns MB). Substituiu o lazygit fixo (~30 MB/space × 26 = ~780 MB) — ficou bem mais leve **e** mais útil. O lazygit cheio agora é **sob demanda** no `shift+v`.

---

## Monitor de atividade (col 4)

`herdr-agent-cockpit.py --workspace <id>` — painel ao vivo, refresh **4s**, `ctrl+c` cai num shell livre. Por space mostra:

- **status** do agente (idle/working/blocked) · **branch** · **badge git** · **ctx %** · harness/modelo
- **badge git** ao lado do nome: `●N` arquivos sujos · `↑N` ahead · `↓N` behind · `⚠` conflito (cache leve, trata sem-upstream)
- quando *working*: **tasks** com progresso (✔/▶/☐) + **árvore de agents** (`⏺ main → ◯ subagente`) com harness, modelo, tempo e tokens
- bloco **`─ git ─`** "ao vivo" (arquivos mudando no repo) — mantém o painel útil mesmo com o agente idle
- **glance global** (`↗ ativos em outros spaces`): o que está rodando nos demais agents

> O modelo Claude **exato de um subagente enquanto ele roda** não é exposto (statusline só tem `subagent_type`); o harness (claude/codex/kimi) é inferido e o modelo aparece quando o subagente **completa**.

---

## Sincronização git (col 3) — `git-glance`

`herdr-git-glance.sh` — painel **enxuto** por space, focado em decidir a **próxima ação**, não em mostrar o histórico:

- **STATUS grande** que responde "pra frente ou pra trás?" de imediato: `↑ PRA SUBIR` (push) · `↓ PRA DESCER` (pull) · `⇅ DIVERGIU` · `✓ EM DIA` — com a **ação ao lado**.
- **TODOS os commits pendentes** ahead/behind (cap 40 só pra não estourar num clone fresco) — você vê os commits a subir/descer, **sem** o histórico já sincronizado.
- **working tree** (arquivos modificados) + caminho pro commit.
- **Acionável** — teclas: `P` push · `p` pull (`--ff-only`) · `f` fetch · `r` refresh agora · `g` lazygit cheio (e `q` dentro dele volta pro painel) · `q` cai num shell livre.

> **Sem fetch automático** de propósito: o ahead/behind é lido do remote-tracking ref **local** (sem rede), então o painel **não dispara** o prompt do macOS *"iTerm deseja acessar dados de outros apps"* (TCC/Keychain via credential helper). Fetch só quando você aperta `f`.

> Redesenho **in-place** (cursor pro topo + sobrescreve linha a linha) em vez de `clear` — por isso **não pisca** mesmo refrescando a cada 15s.

Em pastas **protegidas pelo TCC** (`~/Desktop`, `~/Documents`, …) o layout vira `[claude | monitor]` **sem** git-glance, pra não rodar git em loop perto de áreas vigiadas.

---

## Comandos `work` (montar workspaces)

| Comando | O que faz |
|---|---|
| `work` | **contextual ao cwd**: dentro de um projeto → só ele; numa raiz (ex: `~/Claude/Projetos`) → **TODAS as pastas** (inclusive não-git); em outro lugar → todos os conhecidos. Sempre **alfabético**. |
| `work all` | força todos os projetos conhecidos do `agent-orchestrator.yaml` |
| `work curated` | **opt-in**: só git repos de verdade / submódulos (`~/Claude/.gitmodules`) OU allowlist `~/Claude/.herdr/spaces` (1 path/linha, prioridade se existir). Pastas soltas não viram space. |
| `work <nome>` | abre/foca UM projeto (fuzzy: `work gordon`, `work galap`) |
| `work swarm <proj> N` | N git-worktrees isolados (cada agent no seu, sem contaminar HEAD) |
| `work vps` | abre o workspace **VPS** sozinho (também abre **automático** em todo `work`/`work all`) |
| `work close <nome>` | fecha UM workspace (fuzzy). `herdr workspace close <id>` é o cru. |
| `work list` | lista workspaces abertos + status |

> **Default mostra TODAS as pastas** de `~/Claude/Projetos` de propósito — normalmente há mais pastas do que repos git. A curadoria (git/allowlist) é opt-in via `work curated`, nunca no fluxo normal.

O workspace **VPS** entra **sempre** no cockpit (1 pane de **saúde**, idempotente): status dos 3 services systemd (`openclaw-gateway`, `nox-mem-api`, `nox-mem-watch`) + só os **erros** das últimas 2h, refresh 30s, **reconexão automática** (sobrevive a sleep/wifi). Dashboard visual no atalho **`ocdash`** (→ `http://localhost:18790`), sob demanda.

Spaces ficam sempre em **ordem alfabética** (home no topo) — `herdr-sort-spaces.py` reordena o `session.json` antes do server subir (vale no próximo start; o herdr 0.7 não tem sort nativo).

---

## `cw` — Claude já orientado pelo projeto

| Comando | Comportamento |
|---|---|
| `claude` | genérico/puro (intacto) |
| **`cw`** | **mostra** o briefing E o injeta no system-prompt do Claude. Pra confirmar que pegou, pergunte ao Claude "qual o foco e os agents deste projeto?". |
| **`wb`** | só **mostra** o briefing (agents/skills/plugins/MCPs/foco), sem abrir o Claude. `wb` (pasta atual) ou `wb <pasta>` |

> `cw` e `wb` são **scripts em `~/.local/bin`** (no PATH) — funcionam em **qualquer pane, sem `source`**.

**Fechar sessão ≠ fechar pasta:** `/exit` (ou `Ctrl+D`) **dentro do pane** encerra só o Claude e mantém o workspace na lateral. `work close <nome>` remove a pasta da lateral.

`cw` = `claude --append-system-prompt "$(work-brief.mjs --prompt)"`. O **briefing** mostra: agents preferenciais (do `agentRules` do AO yaml, senão por stack), skills/plugins/MCPs, comando AO sugerido, e o **foco atual** (cascata: `now.md` → `HANDOFF.md` → `STATUS.md` → `CLAUDE.md §Estado` → `CHANGELOG`…).

---

## Atalhos herdr (prefix = `ctrl+b`)

| Atalho | Ação |
|---|---|
| `ctrl+b` `v` / `-` | split vertical / horizontal |
| `ctrl+b` `w` | trocar de workspace |
| `ctrl+b` `c` | nova tab · `z` zoom no pane · `q` detach |
| `ctrl+b` `shift+n` | novo workspace |
| `ctrl+b` `shift+o` | **montar o cockpit** (roda `work`) de dentro do herdr |
| `ctrl+b` `shift+a` | abrir o **cockpit de agentes** num pane à direita (escopado no space atual) |
| `ctrl+b` `shift+v` | **abrir o lazygit cheio** num split focado (sob demanda) — col 3 fixa já é o git-glance |
| `ctrl+b` `?` | ajuda de atalhos |

> `shift+g`/`alt+g`/`shift+l` e `g` são nativos do herdr (goto/new_worktree/swap_pane), por isso o lazygit cheio usa `shift+v`.

---

## Integrations (detecção de status dos agents)

`settings > integrations` (ou `herdr integration install <agent>`). Faz o herdr mostrar **blocked/working/done** real do agent.
- ✅ **claude** · ✅ **codex** · ✅ **kimi** (kimi-code, hook em `~/.kimi-code/hooks/herdr-agent-state.sh`)
- ⚠️ **OpenClaw NÃO está na lista.** O herdr suporta: pi, omp, claude, codex, copilot, devin, droid, kimi, **opencode** (≠ OpenClaw), kilo, hermes, qodercli, cursor. Dá pra **rodar** OpenClaw num pane — só sem status automático.

---

## VPS / OpenClaw — conectar e enxergar o Claude de lá

OpenClaw roda no VPS (Hostinger `187.77.234.79` / Tailscale `100.87.8.44`), Claude via provider `anthropic/` (OAuth). Três formas:

1. **Dashboard** (mais visual): `ocdash` (1 passo: túnel SSH + Chrome + derruba o túnel no ctrl+c).
2. **Sessão ao vivo (tmux):** `ssh root@100.87.8.44` → `tmux ls` → `tmux attach -t <sessão>`.
3. **herdr remoto:** `herdr --remote root@100.87.8.44` (requer herdr instalado no VPS).

> O herdr **não** tem adapter de status pro OpenClaw — mas qualquer uma das 3 vias dá visão do que roda lá.

---

## Persistência & boot

- **herdr permanente** — launchd `~/Library/LaunchAgents/dev.herdr.server.plist` aponta pro wrapper `herdr-server-launch.sh`, que no boot: (1) reordena os spaces alfabético, (2) sobe o **watcher do monitor** em background, (3) sobe o `herdr server`. Ressuscita em crash (`KeepAlive`).
- **Watcher** `herdr-monitor-watch.sh` — garante o layout `[claude | git-glance | monitor]` no boot (`relayout --all`, com wait-for-server) e ao focar cada space. Fail-open, idempotente (só age se o layout estiver fora do alvo; nunca toca o pane do claude).
- **`herdr-ao-watch.sh`** — poll multi-agent que notifica (macOS) a cada novo `blocked`. Rode num pane quando quiser.

---

## Arquivos do setup

| Arquivo | Papel |
|---|---|
| `~/Claude/scripts/work.sh` | orquestrador do cockpit (monta os spaces; curadoria opt-in) |
| `~/Claude/scripts/work-brief.mjs` | engine de briefing (+ modo `--prompt` pro `cw`) |
| `~/Claude/scripts/herdr-agent-cockpit.py` | **monitor de atividade** (col 4): agents/tasks/badges git/glance |
| `~/Claude/scripts/herdr-monitor-ensure.py` | **relayout** idempotente: garante `[claude\|git-glance\|monitor]` num space |
| `~/Claude/scripts/herdr-git-glance.sh` | **col 3** (FIXO): painel git ahead/behind + ação (sem fetch auto, redesenho in-place) |
| `~/Claude/scripts/herdr-monitor-watch.sh` | **watcher**: aplica o relayout ao focar + no boot |
| `~/Claude/scripts/herdr-lazygit-open.sh` | keybind `shift+v` → abre o **lazygit cheio** num split (sob demanda) |
| `~/Claude/scripts/herdr-cockpit-open.sh` | keybind `shift+a` → abre o cockpit num split à direita |
| `~/Claude/scripts/herdr-sort-spaces.py` | reordena os spaces alfabético (roda antes do server) |
| `~/Claude/scripts/herdr-server-launch.sh` | wrapper do LaunchAgent: sort + watcher + server |
| `~/Claude/scripts/herdr-ao-watch.sh` | notifica a cada agent `blocked` |
| `~/.zshrc` (bloco `herdr work cockpit`) | alias `work` + hook de papéis de pane (**brief / gitglance / monitor / vps**) |
| `~/.local/bin/cw` · `~/.local/bin/wb` | scripts no PATH: `cw` = claude+briefing, `wb` = só briefing |
| `~/.config/herdr/config.toml` | keybinds `prefix+shift+o` (work) · `shift+a` (cockpit) · `shift+v` (lazygit cheio sob demanda) |
| `~/Claude/.herdr/spaces` | allowlist opcional de spaces curados (1 path/linha) — usada só por `work curated` |
| `~/.claude/hooks/herdr-agent-state.sh` | integração de status do Claude |

---

## Iniciar / fechar

| Ação | Comando |
|---|---|
| Abrir/atachar o cockpit | `herdr` (num terminal de verdade, não no Claude) |
| **Detach** (agents seguem vivos) | `ctrl+b` `q` · reattach: `herdr` |
| **Fechar de vez** (mata server + panes) | `herdr server stop` |
| Reativar sem reboot | `launchctl load ~/Library/LaunchAgents/dev.herdr.server.plist` |
| Começar do zero | `herdr server stop && rm ~/.config/herdr/session.json` |
| Status | `herdr status` · `work list` |
