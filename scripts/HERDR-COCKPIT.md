# herdr — cockpit de agentes, spaces auto-geridos, git/review

Setup pessoal sobre o **herdr 0.7.3** (terminal workspace manager pra AI coding agents, `brew`, https://herdr.dev). Server roda como LaunchAgent (`dev.herdr.server`, daemon). Config em `~/.config/herdr/`, estado runtime em `~/.config/herdr/session.json`.

**Prefix = `Ctrl+B`** (default do herdr, não customizado). Todo `prefix+X` abaixo = aperta Ctrl+B, solta, depois X. `Ctrl+B` então `?` = referência nativa completa.

Construído 2026-06-22 · atualizado **2026-07-20** (Fase 1 da poda: frota 32→17 workspaces curados; auto-sync + auto-reorder aposentados; `[worktrees]` nativo).

## Keybindings (`~/.config/herdr/config.toml`)

| Atalho | Abre | Papel |
|---|---|---|
| `prefix+shift+o` | `work.sh curated` | monta/foca os spaces da allowlist |
| `prefix+shift+a` | `herdr-cockpit-open.sh` | cockpit de agentes (split direita) |
| `prefix+shift+v` | `herdr-lazygit-open.sh` | lazygit cheio (operar git) |
| `prefix+shift+h` | `herdr-hunk-open.sh` | **hunk review** (diff do changeset) |
| `prefix+shift+f` | plugin `herdr-file-viewer` | **file viewer** git-aware (split) |
| `prefix+shift+e` | plugin `herdr-file-viewer` | file viewer em tab cheia |
| `prefix+shift+u` | plugin `usagebar` | usage/rate limits por provider |

**Nativos ocupados — NÃO rebindar:** `prefix+shift+` **d/g/n/p/r/t/w/x** (`close_workspace` / `new_worktree` / `new_workspace` / … / **`rename_tab`=shift+t**) e `prefix+g`/`alt+g`/`shift+l`. Por isso os custom usam **o/a/v/h/f/e/u**.

> ⚠️ `prefix+shift+t` parece livre e **não é** (`rename_tab`). Antes de criar bind novo:
> `herdr --default-config | grep -oE '"prefix\+shift\+[a-z]"' | sort -u`
> Livres hoje: **b, i, j, k, m, y, z**.

## 1. Layout de trabalho (`work.sh`)

`prefix+shift+o` (ou `work` no shell) monta cada workspace com **2 panes**:

```
[ claude ~65%  |  monitor ~35% ]
```

- **pane1 (claude):** briefing de sessão + shell pronto pra `cw`/`claude`.
- **pane2 (monitor):** o cockpit de agentes escopado no workspace (§2).

Roles via `HERDR_PANE_ROLE` (o herdr injeta na criação do pane; o `~/.zshrc` reage): `brief`, `monitor`, `vps`.

> **git-glance (col3) REMOVIDO em 19/07** pra dar ~⅓ mais largura ao claude (era `claude 42% | git-glance 32.5% | monitor 25.5%`, hoje `claude 65% | monitor 35%`). O panorama git fixo saiu; git/review agora são sob demanda (§3). O script `herdr-git-glance.sh` e o role `gitglance` no `~/.zshrc` ficam **dormentes** (chamáveis à mão se um dia precisar).
>
> ⚠️ **O layout tem DOIS donos — mexer nos dois.** O `work.sh` só cria workspaces **novos**; quem *reimpõe* o layout em todo workspace (a cada troca de foco e no boot do server, via `herdr-monitor-watch.sh` → `--all`) é o **`herdr-monitor-ensure.py`**. Na 1ª tentativa só o `work.sh` foi alterado, e no restart seguinte o `ensure.py` **recriou o git-glance nos 32 workspaces**. Ambos agora usam ratio `0.65`; o `ensure.py` fecha panes `gitglance` legados no rebuild.

Comandos úteis: `work <projeto>` (fuzzy), `work all`, `work curated` (só git repos/allowlist), `work swarm <proj> N` (N worktrees isolados), `work list`.

## 2. Cockpit de agentes (pane monitor)

Painel ao vivo: por workspace mostra **tasks** (✔ feito / ▶ fazendo+progresso / ☐ a fazer), branch, contexto%, e a **árvore de agentes** (`⏺ main → ◯ subagente`) com **harness** (claude/codex/kimi), tempo e tokens.

| Arquivo | Papel |
|---|---|
| `herdr-agent-cockpit.py` | O painel. `--workspace <id>` filtra pro projeto; `--once` imprime 1×; arg numérico = refresh seg (default 4). |
| `herdr-cockpit-open.sh` | Abre o cockpit num split à direita do pane atual (`prefix+shift+a`), **já escopado** no workspace daquele pane. Reusa shell existente à direita; senão cria split. |

**Fontes de dados:** `herdr agent list` (status/harness/workspace) + `herdr agent read <id> --source recent` (parse do render do Claude Code 2.1.x). Modelo do main vem de `[Opus 4.8 | API]` no statusline.

**Status working/idle/blocked** é alimentado pela **integração claude** — hook `~/.claude/hooks/herdr-agent-state.sh` (evento SessionStart, só age com `HERDR_ENV=1`), instalado via `herdr integration install claude` (idempotente). O herdr 0.7.3 usa 1 hook + infere o resto do output do pane.

**Gotcha:** o modelo Claude **exato de um subagente *enquanto ele roda*** NÃO é exposto (statusline só tem `subagent_type`; o transcript só guarda o modelo do main). O harness é inferido do type; o modelo só aparece quando o subagente **completa** (`Agent(...) Sonnet 4.6`).

## 3. Git & review (sob demanda)

Sem painel git fixo (git-glance saiu). Três caminhos:

| Como | Ferramenta | Pra quê |
|---|---|---|
| CLI / agente | `git`, `gh` | operar no dia a dia (commit/push) — **o caminho principal** |
| `prefix+shift+v` | lazygit (`herdr-lazygit-open.sh`) | operar interativo (stage/rebase) — fallback, pouco usado |
| `prefix+shift+h` | **hunk** (`herdr-hunk-open.sh`) | **revisar** o changeset (`hunk diff --watch`, com annotations de agente) |

Lazygit e hunk abrem split à direita + zoom (tela cheia); `q` sai, `; exit` fecha o pane e volta ao layout. O hunk (brew, `hunkdiff`) é review-first; o `delta` segue como git pager default, e `git hdiff`/`git hshow` chamam o hunk sob demanda em qualquer pane.

## 4. Spaces curados (frota enxuta, sob demanda) — reescrito 2026-07-20

**O modelo mudou.** Antes: espelhar `~/Claude/Projetos/*` inteiro na sidebar (32 workspaces, 64 panes permanentes) + reordenar alfabético de madrugada. O diagnóstico que matou isso: **47% da frota estava parada há 1+ mês** e o sidebar nativo do herdr — feito pra você bater o olho e ver quem está `blocked` — vira ruído com 32 linhas. O cockpit custom (§2) era a compensação.

Hoje: **~17 workspaces curados**, abertos porque há trabalho neles. O resto volta com `work <projeto>` em segundos.

**Aposentados** (em `~/Claude-archive/_retired/`):

| O quê | Por quê |
|---|---|
| `herdr-sync-projects.sh` + LaunchAgent `com.toto.herdr-sync-projects` | Espelhava todo subdir de `~/Claude/Projetos` → recriava o que você fechasse |
| `herdr-sort-spaces.py` + `herdr-auto-reorder.sh` + LaunchAgent `com.toto.herdr-auto-reorder` | Ordenar 32 spaces exigia **restart do server** (recria panes). Com 17, não paga |

⚠️ **Ao fechar workspaces, desligue o auto-sync ANTES** — ele era `WatchPaths` e recriava na hora. (Hoje já está desligado; a nota vale se alguém reverter.)

**O que ficou:** `herdr-monitor-watch.sh` + `herdr-monitor-ensure.py` — o enforcer do layout de 2 panes. Continua útil com 17.

**Ordem da sidebar:** sem sort automático, workspaces novos entram no fim. Para navegar sem depender de ordem, o caminho é fuzzy jump (avaliar o plugin `thanhdat77/herdr-navigator` na Fase 2), não reintroduzir o restart noturno.

**Worktrees agora são nativos** (`[worktrees] directory = "~/.herdr/worktrees"` no config):

```bash
herdr worktree create --branch feat/x --base main --focus
herdr worktree remove --workspace wN     # git worktree remove; nunca deleta a branch
```

A raiz fica **fora de qualquer repo** de propósito — worktree dentro do repo (`.claude/worktrees/`) usa sparse-checkout e causa HEAD desync entre agents paralelos: a raiz dos 8 leaks de 2026-05-24. Ver a hard-rule em `~/Claude/CLAUDE.md`.

## 4b. Plugins (Fase 2 — 2026-07-20, herdr 0.7.4)

Até 20/07 havia **zero** plugins instalados e ~1.258 linhas de script custom fazendo o papel deles. Curadoria por **maturidade**, não por afinidade:

| Plugin | Maturidade | Papel |
|---|---|---|
| `smarzban/herdr-file-viewer` | **173⭐**, v1.13.0, MIT, CI, binário assinado | Árvore + conteúdo git-aware, read-only: diffs, markdown renderizado, syntax highlight. **É o substituto sob demanda do git-glance fixo** removido em 19/07 |
| `senna-lang/herdr-agent-usage` (`usagebar`) | 4⭐, Go, CI | Context meters + janelas de rate limit no sidebar. Lê fontes locais de **Claude** (`~/.claude.json`), **Codex** (`~/.codex/sessions/`) e **Grok** — 3 dos 4 harnesses |

**`usagebar` exige herdr ≥ 0.7.4** (usa `[ui.sidebar.agents]`, que não existe na 0.7.3). Foi o motivo do upgrade 0.7.3→0.7.4. Instalação é **`brew upgrade herdr`** — o `herdr update` recusa em instalação Homebrew.

O plugin popula os tokens `$limit` / `$context` no `[ui.sidebar.agents]` do `config.toml`. Sem sessão Claude/Codex viva num pane, os tokens ficam vazios — os hooks rodam (exit 0), mas não há o que medir.

**Não instalar `0xGosu/herdr-auto-pilot`** — auto-prompta o agent no seu lugar ("Full-Self Prompting"). Colide com maker-checker e verification-first.

### Pendente: `thanhdat77/herdr-navigator` (fuzzy jump) precisa de Rust
Falhou o install: o manifest força `[[build]] cargo build --release` e não há `cargo` na máquina — **mesmo o repo publicando binário arm64 pré-compilado** na release (v0.3.3). Diferente do file-viewer, cujo script resolve prebuilt-vs-source sozinho. Para instalar: `brew install rust` (~1,3 GB) — destrava também os outros ~6 plugins Rust do ecossistema (leap, sidebar, board, deck-navigation).

## 5. Hardening pós-`herdr update`

O plist, o `config.toml` e os scripts são customizados à mão (não geridos pelo herdr) — um `herdr update` pode sobrescrevê-los.

- **`herdr-doctor.sh`** (`--check` / `--fix` / `--save`): valida e reaplica config.toml, plist do server, os 7 scripts vivos e a integração claude. Snapshots do estado bom em `~/Claude/scripts/herdr/expected/`. `--save` re-snapshota após mudança intencional.
  > ⚠️ **O doctor é um sistema imunológico — ele rejeita mudança que você não ensinar.** O `--fix` restaura o `config.toml` do snapshot e (até 20/07) fazia `launchctl bootstrap` dos LaunchAgents. Toda mudança intencional no config/plist exige `--save` depois, senão o próximo `herdr update` reverte via wrapper do `~/.zshrc`.
- **Wrapper no `~/.zshrc`:** a function `herdr()` intercepta **só** `herdr update` — roda o update e, se ok, chama `herdr-doctor.sh --fix` sozinho. Qualquer outro subcomando passa direto (`command herdr`). Vale só em shells novos.

## Reversão

- **hunk / git-glance:** restaurar o bloco git-glance **nos dois** — `work.sh` (workspaces novos) **e** `herdr-monitor-ensure.py` (enforcer: ratios `0.42`/`0.56`, `TARGETS` de 3 col, branch de 3 panes), via git history / `.bak-doctor`; depois `python3 herdr-monitor-ensure.py --all`. Remover o keybinding `prefix+shift+h` do config.toml; `herdr server reload-config`.
- **Cockpit:** remover `prefix+shift+a` do config.toml + `herdr server reload-config`.
- **Frota de 32 workspaces (desfazer a poda de 20/07):** restaurar os 3 scripts de `~/Claude-archive/_retired/scripts/` e os 2 plists de `~/Claude-archive/_retired/launchagents/` → `~/Library/LaunchAgents/`; `launchctl bootstrap gui/$(id -u) <plist>` nos dois; reintroduzir as refs no `herdr-doctor.sh` (lista de scripts + bloco LaunchAgents) e a linha do sort no `herdr-server-launch.sh`; `herdr-doctor.sh --save`. Backup do `session.json` de 32 workspaces em `~/Claude/scripts/herdr/backup-20260720-080922/`.
- **Wrapper update:** remover o bloco `# >>> herdr update -> reaplica >>>` do `~/.zshrc`.
- **Config/plist corrompidos:** `herdr-doctor.sh --fix` restaura do snapshot; `session.json.bak` restaura a ordem.
