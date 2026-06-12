#!/bin/bash
# =============================================================================
# Bidirectional sync: ~/Claude/Projetos/* <-> GitHub repos (totobusnello)
# Também atualiza os refs de submódulo do umbrella e sincroniza extensões
# para ~/.claude/
#
# v2 (2026-06-11) — hardening (lições do conserto de estrutura de submódulos):
#   P0  refs do umbrella: NUNCA mais `git add Projetos/` cego. Agora adiciona
#       SÓ os paths registrados em .gitmodules, e só se o submódulo já está
#       pushado. Guarda anti-dual-tracking aborta se gitlinks != mappings.
#   P1  pull fast-forward only (sem merge/rebase silencioso); push só em main;
#       falha de push é capturada e reportada (não some em /dev/null).
#   P1  pré-flight de auth: aborta cedo se não autentica no remote.
#   P2  git -C em vez de cd; lock (mkdir atômico) evita execução concorrente;
#       git submodule sync propaga URLs do .gitmodules pro .git/config.
#
# Schedule: launchd com.toto.sync-repo (domingo 23:00)
# Manual:   ~/Claude/scripts/sync-all-repos.sh [--dry-run] [--verbose]
#
# SETUP (uma vez):
#   launchctl unload ~/Library/LaunchAgents/com.toto.sync-repo.plist 2>/dev/null
#   launchctl load   ~/Library/LaunchAgents/com.toto.sync-repo.plist
# =============================================================================

# NB: sem `-e` (tratamos erro por repo, não queremos morrer no 1º git != 0) e
# sem `-u` (bash 3.2 do macOS + arrays vazios disparam "unbound"). Só pipefail.
set -o pipefail

# Nunca travar pedindo credencial (launchd não tem TTY): git falha rápido.
export GIT_TERMINAL_PROMPT=0

BASE_DIR="${HOME}/Claude"
LOG_DIR="${BASE_DIR}/logs"
LOG_FILE="${LOG_DIR}/sync.log"
SUMMARY_FILE="${LOG_DIR}/sync-last-summary.txt"
LOCK_DIR="${LOG_DIR}/.sync.lock"
REMOTE="origin"

DRY_RUN=false
VERBOSE=false

# Counters
PULLED=0
PUSHED=0
SKIPPED=0
ERRORS=0
DIRTY=0
FAILED_REPOS=()

# Repos pull-only (não pushar commits locais)
PULL_ONLY=("nox-workspace" "agent-orchestrator")

# ── Parse args ──
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --verbose) VERBOSE=true ;;
  esac
done

mkdir -p "$LOG_DIR"

# ── Helpers ──
log() {
  local msg="$(date '+%Y-%m-%d %H:%M:%S') $1"
  echo "$msg" >> "$LOG_FILE"
  $VERBOSE && echo "$msg"
  return 0
}

summary_line() { echo "$1" >> "$SUMMARY_FILE"; }

fail() { ERRORS=$((ERRORS + 1)); FAILED_REPOS+=("$1"); }

is_pull_only() {
  local n="$1" po
  for po in "${PULL_ONLY[@]}"; do [[ "$n" == "$po" ]] && return 0; done
  return 1
}

is_git_repo() { [[ -d "$1/.git" ]] || [[ -f "$1/.git" ]]; }
get_branch()  { git -C "$1" symbolic-ref --short HEAD 2>/dev/null || echo "detached"; }
is_dirty()    { [[ -n "$(git -C "$1" status --porcelain 2>/dev/null)" ]]; }

# Lock por mkdir (atômico; portável no macOS, diferente do flock do Linux).
acquire_lock() {
  if [[ -d "$LOCK_DIR" ]]; then
    local age=$(( $(date +%s) - $(stat -f %m "$LOCK_DIR" 2>/dev/null || echo 0) ))
    if [[ "$age" -gt 10800 ]]; then       # lock > 3h = processo morto, limpa
      rmdir "$LOCK_DIR" 2>/dev/null
    fi
  fi
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "ERRO: outro sync em andamento ($LOCK_DIR). Abortando." >&2
    exit 3
  fi
  trap 'rmdir "$LOCK_DIR" 2>/dev/null' EXIT
}

# Lista os paths de submódulo do .gitmodules preservando espaços/acentos (NUL).
list_submodule_paths() {
  git config -f "$BASE_DIR/.gitmodules" -z --get-regexp '\.path$' 2>/dev/null \
    | while IFS= read -r -d '' rec; do printf '%s\0' "${rec#*$'\n'}"; done
}

# ── Sync de um repo ──
sync_repo() {
  local repo_path="${1%/}"
  local repo_name; repo_name=$(basename "$repo_path")

  if ! is_git_repo "$repo_path"; then
    SKIPPED=$((SKIPPED + 1)); summary_line "  --  $repo_name (não é git)"; return 0
  fi

  local branch; branch=$(get_branch "$repo_path")
  local pull_only_flag=""; is_pull_only "$repo_name" && pull_only_flag=" [pull-only]"
  local dirty_flag=""; is_dirty "$repo_path" && { dirty_flag=" [dirty]"; DIRTY=$((DIRTY + 1)); }

  git -C "$repo_path" fetch "$REMOTE" --prune --quiet 2>/dev/null || true

  local behind ahead
  behind=$(git -C "$repo_path" rev-list --count "HEAD..$REMOTE/$branch" 2>/dev/null || echo 0)
  ahead=$(git -C "$repo_path" rev-list --count "$REMOTE/$branch..HEAD" 2>/dev/null || echo 0)

  local pull_status="ok" push_status="ok"

  # ── PULL (somente fast-forward) ──
  if [[ "$behind" -gt 0 ]]; then
    if $DRY_RUN; then
      pull_status="would-pull:$behind"
    elif is_dirty "$repo_path"; then
      log "  SKIP $repo_name: $behind atrás, working tree sujo — não puxo"
      pull_status="dirty-skip"
    elif git -C "$repo_path" merge --ff-only "$REMOTE/$branch" --quiet 2>/dev/null; then
      log "  PULL $repo_name: +$behind (ff)"; pull_status="pulled"; PULLED=$((PULLED + 1))
    else
      log "  FAIL $repo_name: pull não-ff (divergiu) — resolver manualmente"
      pull_status="diverged"; fail "$repo_name(diverged)"
    fi
  fi

  # ── PUSH ──
  if [[ "$ahead" -gt 0 ]]; then
    if is_pull_only "$repo_name"; then
      log "  INFO $repo_name: $ahead commits locais (pull-only, não pusho)"
      push_status="pull-only:$ahead"
    elif [[ "$branch" != "main" ]]; then
      log "  SKIP $repo_name: $ahead à frente mas branch=$branch (não-main) — não pusho"
      push_status="nonmain-skip"; fail "$repo_name(branch=$branch)"
    elif $DRY_RUN; then
      push_status="would-push:$ahead"
    elif git -C "$repo_path" push "$REMOTE" "$branch" --quiet 2>/dev/null; then
      log "  PUSH $repo_name: +$ahead"; push_status="pushed"; PUSHED=$((PUSHED + 1))
    else
      log "  FAIL $repo_name: push falhou (auth/rede/protected?)"
      push_status="push-fail"; fail "$repo_name(push-fail)"
    fi
  fi

  local detail=""
  [[ "$behind" -gt 0 ]] && detail="${detail} pull:${behind}"
  [[ "$ahead"  -gt 0 ]] && detail="${detail} push:${ahead}"
  [[ -z "$detail" ]] && detail=" up-to-date"

  local icon="ok"
  [[ "$pull_status" == "pulled" || "$push_status" == "pushed" ]] && icon="sync"
  case "$pull_status$push_status" in
    *diverged*|*push-fail*|*nonmain-skip*) icon="FAIL" ;;
  esac

  summary_line "  ${icon}  ${repo_name} (${branch})${pull_only_flag}${dirty_flag} -${detail}"
}

# ── Atualizar refs de submódulo no umbrella (SEGURO — P0) ──
update_submodule_refs() {
  # Guarda anti-dual-tracking: gitlinks no index têm de bater com mappings.
  local gl mp
  gl=$(git -C "$BASE_DIR" ls-files --stage | grep -c '^160000')
  mp=$(git config -f "$BASE_DIR/.gitmodules" --get-regexp '\.path$' 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$gl" -ne "$mp" ]]; then
    log "  ABORT refs: $gl gitlinks != $mp mappings — risco de dual-tracking, NÃO commito"
    summary_line "  FAIL submodule refs: estrutura inconsistente ($gl != $mp) — revisar à mão"
    fail "umbrella(struct $gl!=$mp)"
    return 1
  fi

  # Adiciona SÓ submódulos registrados cujo HEAD avançou E já está pushado.
  local changed=0 path registered head up
  while IFS= read -r -d '' path; do
    [[ -e "$BASE_DIR/$path/.git" ]] || continue
    registered=$(git -C "$BASE_DIR" ls-files --stage -- "$path" | awk '{print $2; exit}')
    head=$(git -C "$BASE_DIR/$path" rev-parse HEAD 2>/dev/null)
    [[ -z "$head" || "$registered" == "$head" ]] && continue   # gitlink já aponta pro HEAD
    up=$(git -C "$BASE_DIR/$path" rev-parse '@{u}' 2>/dev/null || echo "")
    if [[ "$head" != "$up" ]]; then
      log "  SKIP ref $path: HEAD não pushado — mantenho o gitlink antigo"
      summary_line "  warn ref $path: submódulo não pushado, gitlink não atualizado"
      continue
    fi
    if $DRY_RUN; then
      log "  DRY  ref $path: atualizaria gitlink -> ${head:0:12}"
    else
      git -C "$BASE_DIR" add -- "$path" && changed=$((changed + 1))
    fi
  done < <(list_submodule_paths)

  if $DRY_RUN; then
    summary_line "  dry  submodule refs (só registrados+pushados seriam commitados)"
    return 0
  fi

  if git -C "$BASE_DIR" diff --cached --quiet 2>/dev/null; then
    summary_line "  ok   submodule refs inalterados"
    return 0
  fi

  local rb; rb=$(get_branch "$BASE_DIR")
  if git -C "$BASE_DIR" commit -m "chore: update submodule refs (weekly sync)" --quiet 2>/dev/null; then
    if [[ "$rb" == "main" ]] && git -C "$BASE_DIR" push "$REMOTE" "$rb" --quiet 2>/dev/null; then
      log "  PUSH umbrella: refs atualizados ($changed)"
      summary_line "  sync submodule refs commit+push ($changed)"
    else
      log "  FAIL umbrella: push dos refs falhou (branch=$rb)"
      summary_line "  FAIL submodule refs: commitado local, push falhou"
      fail "umbrella(push-fail)"
    fi
  fi
}

# ═══════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════

acquire_lock

> "$SUMMARY_FILE"  # truncate

log "========== Sync iniciado (dry=$DRY_RUN) =========="
summary_line "Sync Report — $(date '+%Y-%m-%d %H:%M')"
summary_line "==========================================="
summary_line ""

# Pré-flight de auth (read-only): aborta cedo se não autentica no remote.
if ! git -C "$BASE_DIR" ls-remote "$REMOTE" -h refs/heads/main >/dev/null 2>&1; then
  log "ABORT: sem acesso ao remote do umbrella (auth/rede)."
  echo "ERRO: falha de autenticação/rede no GitHub. Abortado." >&2
  summary_line "ABORTADO: sem acesso ao remote (auth/rede)"
  cat "$SUMMARY_FILE"
  exit 2
fi

# Propaga URLs do .gitmodules pro .git/config (idempotente).
$DRY_RUN || git -C "$BASE_DIR" submodule sync --quiet 2>/dev/null || true

# 1. Cada projeto
summary_line "Projects:"
for dir in "$BASE_DIR"/Projetos/*/; do
  [[ -d "$dir" ]] && sync_repo "$dir"
done

# 2. Refs de submódulo no umbrella
summary_line ""
summary_line "Workspace root:"
update_submodule_refs

# 3. Pull do próprio umbrella (depois dos refs), fast-forward only
rb=$(get_branch "$BASE_DIR")
git -C "$BASE_DIR" fetch "$REMOTE" --prune --quiet 2>/dev/null || true
root_behind=$(git -C "$BASE_DIR" rev-list --count "HEAD..$REMOTE/$rb" 2>/dev/null || echo 0)
if [[ "$root_behind" -gt 0 ]]; then
  if $DRY_RUN; then
    summary_line "  dry  umbrella: +$root_behind (puxaria ff)"
  elif git -C "$BASE_DIR" merge --ff-only "$REMOTE/$rb" --quiet 2>/dev/null; then
    summary_line "  pull umbrella: +$root_behind (ff)"
  else
    summary_line "  FAIL umbrella: pull não-ff (divergiu) — resolver à mão"
    fail "umbrella(diverged)"
  fi
fi

# 4. Sincroniza extensões -> ~/.claude/
summary_line ""
summary_line "Home sync:"
if [[ -x "$BASE_DIR/scripts/sync-all-to-home.sh" ]]; then
  if $DRY_RUN; then
    summary_line "  dry  sync-all-to-home.sh (pulado em dry-run)"
  elif "$BASE_DIR/scripts/sync-all-to-home.sh" >> "$LOG_FILE" 2>&1; then
    summary_line "  ok   agents/skills/commands -> ~/.claude/"
  else
    summary_line "  FAIL sync-all-to-home.sh"
    fail "home-sync"
  fi
else
  summary_line "  skip sync-all-to-home.sh não encontrado"
fi

# ── Summary final ──
summary_line ""
summary_line "-------------------------------------------"
summary_line "Pulled: $PULLED | Pushed: $PUSHED | Dirty: $DIRTY | Errors: $ERRORS | Skipped: $SKIPPED"
if [[ "${#FAILED_REPOS[@]}" -gt 0 ]]; then
  summary_line "FALHAS: ${FAILED_REPOS[*]}"
fi
summary_line "==========================================="

log "========== Sync completo (pull:$PULLED push:$PUSHED err:$ERRORS dirty:$DIRTY) =========="

cat "$SUMMARY_FILE"
exit "$ERRORS"
