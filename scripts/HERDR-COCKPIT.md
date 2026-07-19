# herdr — cockpit de agentes, spaces auto-geridos, git/review

Setup pessoal sobre o **herdr 0.7.3** (terminal workspace manager pra AI coding agents, `brew`, https://herdr.dev). Server roda como LaunchAgent (`dev.herdr.server`, daemon). Config em `~/.config/herdr/`, estado runtime em `~/.config/herdr/session.json`.

**Prefix = `Ctrl+B`** (default do herdr, não customizado). Todo `prefix+X` abaixo = aperta Ctrl+B, solta, depois X. `Ctrl+B` então `?` = referência nativa completa.

Construído 2026-06-22 · atualizado **2026-07-19** (auto-sync + auto-reorder + doctor + hunk; git-glance removido).

## Keybindings (`~/.config/herdr/config.toml`)

| Atalho | Abre | Papel |
|---|---|---|
| `prefix+shift+o` | `work.sh` | monta/foca workspaces |
| `prefix+shift+a` | `herdr-cockpit-open.sh` | cockpit de agentes (split direita) |
| `prefix+shift+v` | `herdr-lazygit-open.sh` | lazygit cheio (operar git) |
| `prefix+shift+h` | `herdr-hunk-open.sh` | **hunk review** (diff do changeset) |

Nativos ocupados (**não** rebindar): `prefix+g`/`shift+g`/`alt+g` (goto / new_worktree / swap_pane), `shift+l`. Por isso os custom usam letras livres (o/a/v/h).

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

## 4. Spaces auto-geridos (sync + ordem alfabética)

O herdr não escaneia o filesystem nem tem sort nativo (`herdr config` só `reset-keys`). Dois automatismos (19/07) resolvem:

**Auto-sync** — `herdr-sync-projects.sh` + LaunchAgent `com.toto.herdr-sync-projects` (`WatchPaths=~/Claude/Projetos`). Pasta nova → workspace criado **AO VIVO** (~10s, sem restart). Dedup por `identity_cwd` (não por label — labels são customizados). Log: `~/Library/Logs/herdr-sync-projects.log`.

**Auto-reorder** — `herdr-sort-spaces.py` (reordena alfabético, **home `~` cru fixo no topo**, locale-aware, atômico + `.bak`, fail-safe se server vivo) rodado por `herdr-auto-reorder.sh` + LaunchAgent `com.toto.herdr-auto-reorder` (**04:37**). Reordenar exige **restart do server** (relê `session.json` só no start; restart recria panes), então roda de madrugada com **3 gates**: server up · nenhum agente working/blocked · de fato desordenado (`--dry-run`). Forçar agora (se idle): `zsh herdr-auto-reorder.sh`. O sort roda também no boot via wrapper `herdr-server-launch.sh` (antes do server subir).

> Não existe reorder ao vivo — workspaces novos entram no **fim** da sidebar até o próximo reorder (madrugada ou boot). Restart manual: `launchctl kickstart -k gui/$(id -u)/dev.herdr.server` ⚠️ recria panes.

## 5. Hardening pós-`herdr update`

O plist, o `config.toml` e os scripts são customizados à mão (não geridos pelo herdr) — um `herdr update` pode sobrescrevê-los.

- **`herdr-doctor.sh`** (`--check` / `--fix` / `--save`): valida e reaplica config.toml, plist do server, scripts, LaunchAgents e a integração claude. Snapshots do estado bom em `~/Claude/scripts/herdr/expected/`. `--save` re-snapshota após mudança intencional.
- **Wrapper no `~/.zshrc`:** a function `herdr()` intercepta **só** `herdr update` — roda o update e, se ok, chama `herdr-doctor.sh --fix` sozinho. Qualquer outro subcomando passa direto (`command herdr`). Vale só em shells novos.

## Reversão

- **hunk / git-glance:** restaurar o bloco git-glance **nos dois** — `work.sh` (workspaces novos) **e** `herdr-monitor-ensure.py` (enforcer: ratios `0.42`/`0.56`, `TARGETS` de 3 col, branch de 3 panes), via git history / `.bak-doctor`; depois `python3 herdr-monitor-ensure.py --all`. Remover o keybinding `prefix+shift+h` do config.toml; `herdr server reload-config`.
- **Cockpit:** remover `prefix+shift+a` do config.toml + `herdr server reload-config`.
- **Auto-sync / auto-reorder:** `launchctl bootout gui/$(id -u)/com.toto.herdr-sync-projects` (e `…herdr-auto-reorder`).
- **Wrapper update:** remover o bloco `# >>> herdr update -> reaplica >>>` do `~/.zshrc`.
- **Config/plist corrompidos:** `herdr-doctor.sh --fix` restaura do snapshot; `session.json.bak` restaura a ordem.
