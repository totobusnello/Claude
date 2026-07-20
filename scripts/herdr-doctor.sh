#!/bin/zsh
# herdr-doctor.sh — valida e reaplica as customizações à mão do herdr que um
# `herdr update`/reinstalação pode sobrescrever ou apagar. Idempotente.
#
# Protege: config.toml (keybindings prefix+shift+o/a/v/h, [ui], [ui.toast], [worktrees]),
# o plist do server (wrapper que sobe o watcher do monitor), os scripts referenciados
# e o hook da integração claude.
#
# 2026-07-20 (Fase 1 da poda): saíram daqui os LaunchAgents com.toto.herdr-sync-projects
# e com.toto.herdr-auto-reorder, junto com herdr-sort-spaces.py / herdr-auto-reorder.sh /
# herdr-sync-projects.sh — os 3 scripts viraram ~/Claude-archive/_retired/scripts/ e os
# 2 plists ~/Claude-archive/_retired/launchagents/. NÃO reintroduzir sem reverter a poda:
# o --fix fazia `launchctl bootstrap` deles, o que religaria o espelhamento automático
# dos 32 workspaces.
#
# Uso:
#   herdr-doctor.sh            # --check (default): só reporta; exit 1 se algo divergiu
#   herdr-doctor.sh --fix      # reaplica do snapshot expected/ + recarrega
#   herdr-doctor.sh --save     # re-snapshota expected/ com o estado atual (após mudança intencional)
set -u
export PATH="/Users/lab/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

UID_N="$(id -u)"
HERDR="$(command -v herdr)"
BASE="$HOME/Claude/scripts"
EXP="$BASE/herdr/expected"
CFG="$HOME/.config/herdr/config.toml"
PLIST="$HOME/Library/LaunchAgents/dev.herdr.server.plist"

MODE="check"
[[ "${1:-}" == "--fix" ]]  && MODE="fix"
[[ "${1:-}" == "--save" ]] && MODE="save"

ISSUES=0
ok()   { echo "  ✅ $*"; }
bad()  { echo "  ❌ $*"; ISSUES=$((ISSUES + 1)); }
warn() { echo "  ⚠️  $*"; }

echo "== herdr-doctor ($MODE) =="

# --- save: re-snapshot do estado atual ---
if [[ "$MODE" == "save" ]]; then
  mkdir -p "$EXP"
  cp "$CFG" "$EXP/config.toml"                     && echo "  salvo: config.toml"
  cp "$PLIST" "$EXP/dev.herdr.server.plist"        && echo "  salvo: dev.herdr.server.plist"
  echo "snapshots atualizados em $EXP"
  exit 0
fi

# --- 1. config.toml (keybindings + settings) ---
echo "[1] config.toml"
if [[ ! -f "$EXP/config.toml" ]]; then
  warn "sem snapshot — rode: herdr-doctor.sh --save"
elif diff -q "$EXP/config.toml" "$CFG" >/dev/null 2>&1; then
  ok "== expected (keybindings prefix+shift+o/a/v intactos)"
else
  bad "DIVERGIU do expected:"
  diff "$EXP/config.toml" "$CFG" | head -20 | sed 's/^/       /'
  if [[ "$MODE" == "fix" ]]; then
    cp "$CFG" "$CFG.bak-doctor"
    cp "$EXP/config.toml" "$CFG"
    if "$HERDR" server reload-config >/dev/null 2>&1; then
      echo "       -> restaurado + reload-config (sem restart) ✅"
    else
      warn "restaurado, mas reload-config falhou (server offline?)"
    fi
  fi
fi

# --- 2. plist do server (wrapper com o sort no boot) ---
echo "[2] dev.herdr.server.plist"
if [[ ! -f "$EXP/dev.herdr.server.plist" ]]; then
  warn "sem snapshot — rode: herdr-doctor.sh --save"
elif diff -q "$EXP/dev.herdr.server.plist" "$PLIST" >/dev/null 2>&1; then
  ok "== expected (aponta pro wrapper herdr-server-launch.sh)"
else
  bad "DIVERGIU (update pode ter apontado pro binário direto -> perde o sort no boot)"
  if [[ "$MODE" == "fix" ]]; then
    cp "$EXP/dev.herdr.server.plist" "$PLIST"
    warn "plist restaurado — vale no próximo restart: launchctl kickstart -k gui/$UID_N/dev.herdr.server (quando idle)"
  fi
fi

# --- 3. scripts referenciados (keybindings + automações) ---
echo "[3] scripts"
for s in work.sh herdr-cockpit-open.sh herdr-lazygit-open.sh \
         herdr-server-launch.sh \
         herdr-monitor-ensure.py herdr-monitor-watch.sh herdr-hunk-open.sh; do
  [[ -x "$BASE/$s" ]] && ok "$s" || bad "$s FALTANDO ou não-executável"
done

# --- 4. integração claude (hook de status) ---
echo "[4] integração claude"
if grep -q 'herdr-agent-state.sh' "$HOME/.claude/settings.json" 2>/dev/null; then
  ok "hook presente no settings.json"
else
  bad "hook ausente no settings.json"
fi
if [[ "$MODE" == "fix" ]]; then
  "$HERDR" integration install claude >/dev/null 2>&1 && echo "       -> integration install claude reaplicado"
fi

# --- 5. plugins (Fase 2) ---
# Plugins persistem no plugins.json (registry do herdr), não em snapshot nosso.
# Este bloco só ALERTA se sumirem/desabilitarem — o --fix não reinstala sozinho
# (reinstalar baixa código de terceiro; isso é decisão consciente, não auto-reparo).
echo "[5] plugins"
for p in herdr-file-viewer usagebar herdr-navigator; do
  line="$("$HERDR" plugin list 2>/dev/null | grep "^- $p ")"
  if [[ -z "$line" ]]; then
    bad "$p NÃO instalado — reinstalar à mão: herdr plugin install <owner>/<repo>"
  elif [[ "$line" == *disabled* ]]; then
    bad "$p instalado mas DESABILITADO — herdr plugin enable $p"
  else
    ok "$p"
  fi
done

# --- 6. wrapper do herdr update no zshrc (o gatilho do auto-fix) ---
echo "[6] wrapper 'herdr update' (~/.zshrc)"
if grep -q 'herdr update -> reaplica' "$HOME/.zshrc" 2>/dev/null; then
  ok "function herdr() presente — roda doctor --fix após cada update"
else
  bad "wrapper ausente no ~/.zshrc — 'herdr update' NÃO reaplica as customizações sozinho"
fi

echo ""
if [[ "$ISSUES" == 0 ]]; then
  echo "== tudo OK =="
  exit 0
else
  echo "== $ISSUES divergência(s) — rode: herdr-doctor.sh --fix =="
  [[ "$MODE" == "fix" ]] && exit 0 || exit 1
fi
