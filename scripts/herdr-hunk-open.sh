#!/usr/bin/env bash
# herdr-hunk-open — abre o hunk (review-first diff viewer) CHEIO no repo do space
# ativo, SOB DEMANDA. Review do changeset linha a linha com anotações de agente.
# Complementa: git por CLI/agente (operar) · lazygit em prefix+shift+v (fallback).
# Ao sair do hunk (q), o pane fecha sozinho e o foco volta ao layout. Liga em prefix+shift+h.
set -uo pipefail

field() { python3 -c "import json,sys
try: p=json.load(sys.stdin).get('result',{}).get('pane') or {}
except Exception: p={}
print(p.get('$1') or '')"; }

CURJ=$(herdr pane current --current 2>/dev/null)
CUR=$(printf '%s' "$CURJ" | field pane_id)
CWD=$(printf '%s' "$CURJ" | field cwd)
[ -z "$CUR" ] && exit 0
[ -d "$CWD" ] || CWD="$HOME"

# split à direita, focado, no cwd do space; zoom = tela cheia pro hunk ter espaço de verdade
RID=$(herdr pane split "$CUR" --direction right --ratio 0.5 --cwd "$CWD" --focus 2>/dev/null | field pane_id)
[ -z "$RID" ] && exit 0
herdr pane zoom "$RID" --on >/dev/null 2>&1 || true
herdr pane run "$RID" "hunk diff --watch; exit"   # ao sair do hunk (q) → fecha o pane → volta ao layout
