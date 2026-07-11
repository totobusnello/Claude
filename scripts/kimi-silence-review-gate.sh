#!/usr/bin/env bash
# kimi-silence-review-gate.sh — reaplica o patch que silencia o Stop hook do kimi-plugin-cc
# quando o review gate está desligado (evita "Stop says: review-gate skipped: disabled" a cada turno).
#
# Idempotente e fail-open: roda em SessionStart (async) via ~/.claude/settings.json. Varre TODAS as
# versões do plugin no cache (o brew/marketplace troca o dir a cada update, o que apaga o patch) e
# insere o curto-circuito logo após a linha do export KIMI_PLUGIN_CC_WORKSPACE_CWD. Se o upstream
# reescrever o script e a âncora sumir, não faz nada (o aviso volta — sinal pra revisar o patch).
#
# Contexto/histórico: memória claude "kimi-review-gate-silenciado" (2026-07-11).
set -uo pipefail

MARKER='Patch local (Toto)'
ANCHOR='export KIMI_PLUGIN_CC_WORKSPACE_CWD='

PATCH_BLOCK='
# Patch local (Toto): sai em silêncio quando o review gate está desligado, em vez de
# emitir '"'"'Stop says: review-gate skipped: disabled'"'"' a cada turno. Se habilitar via
# /kimi:setup --enable-review-gate, o grep passa e o fluxo normal segue. Reaplicado
# automaticamente por ~/Claude/scripts/kimi-silence-review-gate.sh (SessionStart hook).
GATE_CFG="${CLAUDE_PLUGIN_DATA:-}/kimi-plugin-cc/config.json"
if ! grep -qs '"'"'"reviewGateEnabled"[[:space:]]*:[[:space:]]*true'"'"' "${GATE_CFG}"; then
  exit 0
fi'

for f in "$HOME"/.claude/plugins/cache/*/kimi/*/scripts/review-gate-hook.sh; do
  [ -f "$f" ] || continue
  grep -q "$MARKER" "$f" 2>/dev/null && continue
  grep -q "$ANCHOR" "$f" 2>/dev/null || continue
  PATCH_BLOCK="$PATCH_BLOCK" ANCHOR="$ANCHOR" python3 - "$f" <<'PYEOF' || continue
import os, sys
path = sys.argv[1]
anchor = os.environ["ANCHOR"]
patch = os.environ["PATCH_BLOCK"]
lines = open(path).readlines()
out = []
for line in lines:
    out.append(line)
    if line.startswith(anchor):
        out.append(patch + "\n")
open(path, "w").writelines(out)
PYEOF
done
exit 0
