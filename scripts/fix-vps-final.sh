#!/bin/bash
# FINAL FIX: Add "anthropic" provider (configure wizard changed default from anthropic-max to anthropic)
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-final.sh

python3 << 'PYEOF'
import json, glob

t = "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"
provider = {
    "baseUrl": "https://api.anthropic.com",
    "apiKey": t,
    "api": "anthropic-messages",
    "models": [
        {"id": "claude-sonnet-4-6", "name": "Claude Sonnet 4.6", "contextWindow": 200000, "maxTokens": 16000},
        {"id": "claude-opus-4-6", "name": "Claude Opus 4.6", "contextWindow": 200000, "maxTokens": 16000},
        {"id": "claude-haiku-4-5", "name": "Claude Haiku 4.5", "contextWindow": 200000, "maxTokens": 8192}
    ]
}

for p in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f: d=json.load(f)
    d.setdefault("providers",{})["anthropic"] = provider
    with open(p,"w") as f: json.dump(d,f,indent=2)
    print(f"  {p}")

with open("/root/.openclaw/openclaw.json") as f: c=json.load(f)
c.setdefault("models",{}).setdefault("providers",{})["anthropic"] = provider
with open("/root/.openclaw/openclaw.json","w") as f: json.dump(c,f,indent=2)
print("  openclaw.json")
print("Done - anthropic provider added")
PYEOF

# Restart
systemctl restart openclaw-gateway 2>/dev/null || (pkill -f openclaw-gateway; sleep 2; nohup openclaw-gateway >/dev/null 2>&1 &)
sleep 5

# Test
echo "=== Testing agent ==="
openclaw agent --agent main --message "diga oi" --local 2>&1 | grep -E 'model=|provider=|anthropic|oi|Oi|error=' | head -5
