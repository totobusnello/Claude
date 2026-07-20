#!/usr/bin/env bash
# Wrapper do LaunchAgent dev.herdr.server:
#  (1) sobe o watcher do monitor (garante o cockpit no pane direito do space focado, em background);
#  (2) sobe o server herdr.
#
# O sort alfabético dos spaces saiu em 2026-07-20 (Fase 1 da poda): com ~17 workspaces
# curados a ordenação deixou de pagar o restart do server que ela exigia.
# herdr-sort-spaces.py + herdr-auto-reorder.sh estão em ~/Claude-archive/_retired/scripts/.
# rotação do log do server (added 2026-07-20): sem daemon — roda a cada start.
# >10MB vira .1 (uma geração só). O server recria o arquivo ao subir.
LOG="$HOME/.config/herdr/herdr-server.log"
if [ -f "$LOG" ] && [ "$(stat -f%z "$LOG" 2>/dev/null || echo 0)" -gt 10485760 ]; then
  mv -f "$LOG" "$LOG.1" 2>/dev/null || true
fi
# watcher do monitor (mata instância anterior pra não acumular). Fail-open.
pkill -f "herdr-monitor-watch.sh" 2>/dev/null || true
nohup /bin/bash "$HOME/Claude/scripts/herdr-monitor-watch.sh" >/tmp/herdr-monitor-watch.log 2>&1 &
exec /opt/homebrew/bin/herdr server
