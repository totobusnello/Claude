#!/usr/bin/env bash
# herdr-cockpit-open — abre o cockpit de agentes num pane à direita do pane atual.
# Reusa um shell já existente à direita; senão cria um split. Liga em prefix+shift+a.
set -uo pipefail

COCKPIT="$HOME/Claude/scripts/herdr-agent-cockpit.py"

field() {
  python3 -c "import json,sys
try: p=json.load(sys.stdin).get('result',{}).get('pane') or {}
except Exception: p={}
print(p.get('$1') or '')"
}

CURJ=$(herdr pane current --current 2>/dev/null)
CUR=$(printf '%s' "$CURJ" | field pane_id)
[ -z "$CUR" ] && exit 0

# vizinho à direita: só reusa se for um shell (sem agente claude); senão cria split
RJ=$(herdr pane neighbor --direction right --pane "$CUR" 2>/dev/null)
RID=$(printf '%s' "$RJ" | field pane_id)
RAG=$(printf '%s' "$RJ" | field agent)
if [ -z "$RID" ] || [ "$RAG" = "claude" ]; then
  RID=$(herdr pane split "$CUR" --direction right --ratio 0.40 --no-focus 2>/dev/null | field pane_id)
fi
[ -z "$RID" ] && exit 0

herdr pane run "$RID" "python3 $COCKPIT"
