#!/bin/zsh
# herdr-auto-reorder.sh — reordena a sidebar do herdr alfabético, de forma SEGURA.
#
# Reordenar exige RESTART do server (o session.json só é relido no start), e o
# restart recria os panes. Então só reinicia quando os 3 gates passam:
#   (1) server de pé;
#   (2) NENHUM agente em working/blocked (não perde trabalho ativo);
#   (3) a sidebar está DE FATO desordenada (senão não mexe).
# Roda de madrugada via launchd (com.toto.herdr-auto-reorder). O restart dispara
# o wrapper herdr-server-launch.sh, que já roda herdr-sort-spaces.py antes de subir.
#
# HERDR_REORDER_DRYRUN=1 -> avalia os gates e loga o que FARIA, sem reiniciar nada.
set -u
export PATH="/Users/lab/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

UID_N="$(id -u)"
PY="/opt/homebrew/bin/python3"
SORT_PY="$HOME/Claude/scripts/herdr-sort-spaces.py"
DRYRUN="${HERDR_REORDER_DRYRUN:-0}"
stamp() { echo "[herdr-reorder $(date '+%F %T')] $*" >&2; }

HERDR="$(command -v herdr)"
[[ -z "$HERDR" ]] && { stamp "herdr não encontrado — saindo"; exit 0; }

# gate 1: server de pé
if ! "$HERDR" status server >/dev/null 2>&1; then
  stamp "server offline — nada a reordenar"; exit 0
fi

# gate 2: trabalho ativo? qualquer agente working/blocked adia o reorder
busy="$("$HERDR" agent list 2>/dev/null | "$PY" -c '
import sys, json
try:
    ags = json.load(sys.stdin).get("result", {}).get("agents", [])
except Exception:
    ags = []
print(sum(1 for a in ags if a.get("agent_status") in ("working", "blocked")))
' 2>/dev/null || echo 0)"
if [[ "$busy" != "0" ]]; then
  stamp "adiado — $busy agente(s) working/blocked (tenta na próxima)"; exit 0
fi

# gate 3: está desordenado? dry-run do sort roda com server vivo e diz se há o que fazer
if "$PY" "$SORT_PY" --dry-run 2>/dev/null | grep -q "já em ordem alfabética"; then
  stamp "já ordenado — nada a fazer"; exit 0
fi

# passou nos 3 gates -> seguro reordenar
if [[ "$DRYRUN" == "1" ]]; then
  stamp "[DRYRUN] gates OK + desordenado -> FARIA 'launchctl kickstart -k gui/$UID_N/dev.herdr.server' (não executado)"
  exit 0
fi

stamp "reordenando — restart do server via kickstart (o wrapper roda o sort)…"
launchctl kickstart -k "gui/$UID_N/dev.herdr.server" 2>&1 | sed 's/^/  [kickstart] /' >&2
sleep 3
if "$HERDR" status server >/dev/null 2>&1; then
  stamp "server de volta — sidebar reordenada alfabético"
else
  stamp "ATENÇÃO: server não voltou após kickstart — checar dev.herdr.server"
fi
