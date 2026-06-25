#!/usr/bin/env bash
# herdr-lazygit-focus — pula o foco pro pane FIXO do lazygit (col3) do space ativo.
# O lazygit virou pane permanente do layout; este atalho só MOVE O FOCO pra ele.
# Liga em prefix+shift+v. cwd do lazygit = repo do space (definido na criação do pane).
set -uo pipefail

WS=$(herdr workspace list 2>/dev/null | python3 -c "import json,sys
try: print(next((w['workspace_id'] for w in json.load(sys.stdin)['result']['workspaces'] if w.get('focused')), ''))
except Exception: print('')")
[ -z "$WS" ] && exit 0

# pane mais à ESQUERDA (claude/col2); o lazygit é o vizinho imediatamente à direita
LEFT=$(herdr pane list --workspace "$WS" 2>/dev/null | python3 -c "import json,sys,subprocess
try:
  ps=json.load(sys.stdin)['result']['panes']
  lay=json.loads(subprocess.run(['herdr','pane','layout','--pane',ps[0]['pane_id']],capture_output=True,text=True,timeout=6).stdout)['result']['layout']['panes']
  print(min(lay,key=lambda p:p['rect']['x'])['pane_id'])
except Exception: print('')")
[ -z "$LEFT" ] && exit 0

herdr pane focus --direction right --pane "$LEFT" 2>/dev/null
