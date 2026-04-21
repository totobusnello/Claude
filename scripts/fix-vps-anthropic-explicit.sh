#!/bin/bash
# Add explicit anthropic provider with api: anthropic-messages format
# This fixes the "Cannot read properties of undefined (reading 'input')" error
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-anthropic-explicit.sh

python3 << 'PYEOF'
import json, glob

provider = {
    "api": "anthropic-messages",
    "models": [
        {"id": "claude-sonnet-4-6", "name": "Claude Sonnet 4.6", "contextWindow": 200000, "maxTokens": 16000},
        {"id": "claude-opus-4-6", "name": "Claude Opus 4.6", "contextWindow": 200000, "maxTokens": 16000},
        {"id": "claude-haiku-4-5", "name": "Claude Haiku 4.5", "contextWindow": 200000, "maxTokens": 8192}
    ]
}

# Add to openclaw.json
with open("/root/.openclaw/openclaw.json") as f: c=json.load(f)
c.setdefault("models",{}).setdefault("providers",{})["anthropic"] = provider
with open("/root/.openclaw/openclaw.json","w") as f: json.dump(c,f,indent=2)
print("openclaw.json: anthropic provider with api:anthropic-messages")

# Add to all agent models.json
for p in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f: d=json.load(f)
    d.setdefault("providers",{})["anthropic"] = provider
    with open(p,"w") as f: json.dump(d,f,indent=2)
    print(f"  {p}")

print("Done")
PYEOF

# Clear all sessions and restart
find /root/.openclaw/agents -name 'sessions.json' -delete 2>/dev/null
find /root/.openclaw/agents -name '*.jsonl' -delete 2>/dev/null
echo "sessions cleared"
pkill -f openclaw-gateway 2>/dev/null
sleep 2
nohup openclaw-gateway >/dev/null 2>&1 &
sleep 5
openclaw agent --agent main --message 'diga oi' --local 2>&1 | head -3
