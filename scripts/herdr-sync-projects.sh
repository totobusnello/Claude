#!/bin/zsh
# herdr-sync-projects.sh
# Espelha ~/Claude/Projetos/* na sidebar do herdr: cria um workspace (AO VIVO,
# via socket — sem restart, não mata panes) pra cada subdir que ainda não tem.
# Idempotente + fail-open. Dedup por PATH (identity_cwd no session.json), NÃO por
# label — labels são customizados (ex: openclaw-vps -> "VPS"), comparar por label
# criaria duplicatas.
#
# Uso: à mão (`zsh herdr-sync-projects.sh`) OU como launchd WatchPaths em
# ~/Claude/Projetos (dispara quando um subdir é criado/removido).
# Override da raiz: HERDR_SYNC_ROOT=/outro/path zsh herdr-sync-projects.sh
set -u

export PATH="/Users/lab/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
ROOT="${HERDR_SYNC_ROOT:-$HOME/Claude/Projetos}"
SESSION_JSON="$HOME/.config/herdr/session.json"
LOCK="/tmp/herdr-sync-projects.lock"
stamp() { echo "[herdr-sync $(date '+%F %T')] $*" >&2; }

HERDR="$(command -v herdr)"
[[ -z "$HERDR" ]] && { stamp "herdr não encontrado — saindo"; exit 0; }

# lock: WatchPaths pode disparar em rajada; serializa execuções
if ! mkdir "$LOCK" 2>/dev/null; then
  stamp "já rodando (lock) — saindo"; exit 0
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

# server precisa estar de pé (senão o create falha)
if ! "$HERDR" status server >/dev/null 2>&1; then
  stamp "herdr server offline — saindo"; exit 0
fi

# paths já cobertos (identity_cwd -> realpath). session.json persiste ao vivo.
existing="$(python3 - "$SESSION_JSON" <<'PY'
import json, sys, os
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(0)
for w in d.get("workspaces", []):
    p = w.get("identity_cwd")
    if p:
        print(os.path.realpath(os.path.expanduser(p)))
PY
)"

created=0
for dir in "$ROOT"/*(/N); do          # zsh: (/) só diretórios, N = nullglob
  rp="${dir:A}"                        # realpath
  grep -qxF "$rp" <<< "$existing" && continue
  label="${dir:t}"                     # basename
  if "$HERDR" workspace create --cwd "$rp" --label "$label" --no-focus >/dev/null 2>&1; then
    stamp "+ workspace '$label'"
    existing+=$'\n'"$rp"               # evita recriar no mesmo run
    created=$((created + 1))
  else
    stamp "FALHA ao criar '$label'"
  fi
done
stamp "concluído — $created workspace(s) novo(s)"
