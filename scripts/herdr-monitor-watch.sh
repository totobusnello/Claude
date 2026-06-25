#!/usr/bin/env bash
# herdr-monitor-watch — garante o MONITOR no pane direito do space FOCADO, sempre que o
# foco muda. Roda em background (lançado pelo herdr-server-launch.sh). Fail-open.
#
# Uso:  herdr-monitor-watch.sh [intervalo_seg]   (default 1.5s)   ·   ctrl+c sai
set -uo pipefail
INTERVAL="${1:-1.5}"
ENSURE="$HOME/Claude/scripts/herdr-monitor-ensure.py"
last=""

# no boot/start: espera o server responder (o watcher sobe ANTES do server no launch) e os
# panes assentarem, então garante o monitor em TODOS os spaces de uma vez (cobre pós-reboot).
for _ in $(seq 1 90); do herdr workspace list >/dev/null 2>&1 && break; sleep 1; done
sleep 4
python3 "$ENSURE" --all >/dev/null 2>&1 || true

focused_ws() {   # workspace FOCADO globalmente (workspace list.focused, não o pane do cliente)
  herdr workspace list 2>/dev/null | python3 -c "import json,sys
try: print(next((w['workspace_id'] for w in json.load(sys.stdin)['result']['workspaces'] if w.get('focused')), ''))
except Exception: print('')"
}

while true; do
  cur="$(focused_ws)"
  if [ -n "$cur" ] && [ "$cur" != "$last" ]; then   # só age na TRANSIÇÃO de foco
    python3 "$ENSURE" "$cur" >/dev/null 2>&1 || true
    last="$cur"
  fi
  sleep "$INTERVAL"
done
