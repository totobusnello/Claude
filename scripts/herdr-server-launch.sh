#!/usr/bin/env bash
# Wrapper do LaunchAgent dev.herdr.server:
#  (1) reordena os spaces alfabético (home no topo) ANTES de subir o server (aborta se já vivo);
#  (2) sobe o watcher do monitor (garante o cockpit no pane direito do space focado, em background);
#  (3) sobe o server herdr.
/opt/homebrew/bin/python3 "$HOME/Claude/scripts/herdr-sort-spaces.py" >/tmp/herdr-sort-spaces.log 2>&1 || true
# watcher do monitor (mata instância anterior pra não acumular). Fail-open.
pkill -f "herdr-monitor-watch.sh" 2>/dev/null || true
nohup /bin/bash "$HOME/Claude/scripts/herdr-monitor-watch.sh" >/tmp/herdr-monitor-watch.log 2>&1 &
exec /opt/homebrew/bin/herdr server
