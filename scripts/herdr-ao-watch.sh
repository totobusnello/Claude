#!/usr/bin/env bash
# herdr-ao-watch — avisa quando um agent do herdr TRAVA (status=blocked).
#
# É a forma multi-agent do `herdr agent wait --status blocked`: em vez de esperar
# UM alvo, faz poll de `herdr agent list` e, a cada NOVO blocked, dispara:
#   • notificação macOS (osascript)
#   • linha no terminal
#   • gancho opcional pro AO (ao send) — descomente quando quiser ligar de verdade
#
# Uso:  herdr-ao-watch.sh [intervalo_seg]      (default 20s)   ·   ctrl+c pra sair
# Rodar num pane do cockpit, ou virar launchd depois.
set -uo pipefail
INTERVAL="${1:-20}"
declare -A seen   # dedup: só alerta na transição p/ blocked

notify() { osascript -e "display notification \"$1\" with title \"herdr · agent blocked\" sound name \"Submarine\"" >/dev/null 2>&1; }

echo "👁  herdr-ao-watch — vigiando agents 'blocked' a cada ${INTERVAL}s (ctrl+c pra sair)"
while true; do
  while IFS=$'\t' read -r name status; do
    [ -z "$name" ] && continue
    if [ "$status" = blocked ]; then
      if [ -z "${seen[$name]:-}" ]; then
        seen[$name]=1
        echo "$(date +%H:%M:%S) 🚩 BLOCKED: $name — precisa de você"
        notify "$name travou — precisa de você"
        # --- gancho AO (opcional): se 'name' for uma sessão do AO, cutuque-a ---
        # ao send "$name" "você travou; resumindo contexto" 2>/dev/null || true
      fi
    else
      unset 'seen[$name]' 2>/dev/null || true   # destravou → rearmar p/ próximo bloqueio
    fi
  done < <(herdr agent list 2>/dev/null | python3 -c "
import json,sys
try: ags=json.load(sys.stdin)['result']['agents']
except Exception: ags=[]
for a in ags:
    n=(a.get('name') or a.get('label') or '').strip()
    s=(a.get('status') or '').strip()
    if n: print(f'{n}\t{s}')
")
  sleep "$INTERVAL"
done
