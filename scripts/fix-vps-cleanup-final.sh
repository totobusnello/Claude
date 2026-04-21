#!/bin/bash
# Final cleanup: dead providers, tmp files, nox-mem duplicates, stale sessions
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-cleanup-final.sh

echo "=== 1/5 Remove dead providers from all configs ==="
python3 << 'PYEOF'
import json, glob

DEAD = ["anthropic-secondary", "anthropic-pro", "anthropic-max", "gemini-openai"]

for p in ["/root/.openclaw/openclaw.json"] + glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f: d=json.load(f)
    # Find providers dict (different structure for openclaw.json vs models.json)
    if "models" in d and "providers" in d["models"]:
        provs = d["models"]["providers"]
    elif "providers" in d:
        provs = d["providers"]
    else:
        continue
    removed = [k for k in DEAD if k in provs]
    for k in removed:
        del provs[k]
    if removed:
        with open(p, "w") as f: json.dump(d, f, indent=2)
        print(f"  {p}: removed {removed}")
print("  Done")
PYEOF

echo ""
echo "=== 2/5 Remove 16 tmp files ==="
find /root/.openclaw/agents -name '*.tmp' -delete 2>/dev/null
echo "  Done"

echo ""
echo "=== 3/5 Kill duplicate nox-mem-watch processes ==="
# Should be 1 watcher + 1 inotifywait, not 2+2
WATCH_PIDS=$(pgrep -f nox-mem-watch.sh | tail -n +3)
if [ -n "$WATCH_PIDS" ]; then
    echo "  Killing extra watchers: $WATCH_PIDS"
    kill $WATCH_PIDS 2>/dev/null
else
    echo "  No duplicates"
fi

echo ""
echo "=== 4/5 Trim large session stores ==="
echo "  Before:"
du -sh /root/.openclaw/agents/main/sessions/
# Keep only last 20 sessions in sessions.json
python3 << 'PYEOF'
import json, os
p = "/root/.openclaw/agents/main/sessions/sessions.json"
if os.path.exists(p):
    with open(p) as f: d=json.load(f)
    if isinstance(d, list) and len(d) > 20:
        old = len(d)
        d = d[-20:]
        with open(p, "w") as f: json.dump(d, f, indent=2)
        print(f"  sessions.json: {old} -> {len(d)} entries")
    elif isinstance(d, dict):
        print(f"  sessions.json: dict format, {len(d)} keys")
    else:
        print(f"  sessions.json: {len(d)} entries (ok)")
PYEOF
# Remove old jsonl files (keep last 5 per agent)
for agent_dir in /root/.openclaw/agents/*/sessions/; do
    count=$(ls -1 "$agent_dir"*.jsonl 2>/dev/null | wc -l)
    if [ "$count" -gt 5 ]; then
        to_delete=$((count - 5))
        ls -1t "$agent_dir"*.jsonl | tail -$to_delete | xargs rm -f
        echo "  $agent_dir: removed $to_delete old session files"
    fi
done
echo "  After:"
du -sh /root/.openclaw/agents/*/sessions/ 2>/dev/null

echo ""
echo "=== 5/5 Summary ==="
echo "Processes:"
ps aux | grep -E 'openclaw-gateway|claude' | grep -v grep | wc -l
echo "active processes"
echo ""
echo "Crons with errors (need attention):"
openclaw cron list 2>&1 | grep error | awk '{print $2}'
