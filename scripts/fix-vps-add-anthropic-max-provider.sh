#!/bin/bash
# Add anthropic-max provider to all agent models.json and openclaw.json
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-add-anthropic-max-provider.sh

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

# Update all agent models.json
for p in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f:
        d = json.load(f)
    d.setdefault("providers", {})["anthropic-max"] = provider
    # Remove ghost providers
    for ghost in ["anthropic-secondary", "anthropic-pro"]:
        d["providers"].pop(ghost, None)
    with open(p, "w") as f:
        json.dump(d, f, indent=2)
    print(f"  {p}: anthropic-max added")

# Update main openclaw.json
with open("/root/.openclaw/openclaw.json") as f:
    c = json.load(f)
c.setdefault("models", {}).setdefault("providers", {})["anthropic-max"] = provider
with open("/root/.openclaw/openclaw.json", "w") as f:
    json.dump(c, f, indent=2)
print("  openclaw.json: anthropic-max added")
print("All done")
PYEOF

# Restart gateway
pkill -f openclaw-gateway 2>/dev/null
sleep 3
source /root/.bashrc
export CLAUDE_CODE_OAUTH_TOKEN
nohup openclaw-gateway > /dev/null 2>&1 &
sleep 5
echo "Gateway PID: $(pgrep -f openclaw-gateway)"

# Test
openclaw agent --agent main --message "diga oi" --local 2>&1 | head -5
