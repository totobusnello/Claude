#!/usr/bin/env bash
# Uninstall all plugins that are disabled in ~/.claude/settings.json's
# enabledPlugins map. Keeps enabled plugins untouched.
#
# Usage: bash scripts/uninstall-disabled-plugins.sh [--dry-run]
set -u

DRY=0
[[ "${1:-}" == "--dry-run" ]] && DRY=1

disabled=()
while IFS= read -r line; do
  disabled+=("$line")
done < <(python3 -c '
import json
s = json.load(open("/Users/lab/.claude/settings.json"))
for k, v in s.get("enabledPlugins", {}).items():
    if v is False: print(k)
')

echo "Found ${#disabled[@]} disabled plugins"
if [[ $DRY -eq 1 ]]; then
  printf '  %s\n' "${disabled[@]}"
  exit 0
fi

ok=0; fail=0; failed=()
for p in "${disabled[@]}"; do
  if claude plugin uninstall "$p" --scope user >/dev/null 2>&1; then
    echo "  ✓ $p"
    ok=$((ok+1))
  else
    echo "  ✘ $p"
    fail=$((fail+1))
    failed+=("$p")
  fi
done

echo
echo "Uninstalled: $ok"
echo "Failed:      $fail"
[[ $fail -gt 0 ]] && printf '  - %s\n' "${failed[@]}"
