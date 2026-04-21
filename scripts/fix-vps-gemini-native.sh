#!/bin/bash
# Switch fallback from gemini-openai to gemini (native API)
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-gemini-native.sh

python3 << 'PYEOF'
import json
with open("/root/.openclaw/openclaw.json") as f: c=json.load(f)
c["agents"]["defaults"]["model"] = {
    "primary": "anthropic/claude-sonnet-4-6",
    "fallbacks": ["gemini/gemini-2.5-flash"]
}
with open("/root/.openclaw/openclaw.json","w") as f: json.dump(c,f,indent=2)
print("fallback: gemini/gemini-2.5-flash (native)")
PYEOF

find /root/.openclaw/agents -name 'sessions.json' -delete 2>/dev/null
find /root/.openclaw/agents -name '*.jsonl' -delete 2>/dev/null
echo "sessions cleared"
systemctl restart openclaw-gateway 2>/dev/null
sleep 5
openclaw agent --agent main --message 'diga oi' --local 2>&1 | head -3
