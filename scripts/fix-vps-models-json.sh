#!/bin/bash
# Fix models.json in all agents - replace proxy apiKey with real token
# Run: ssh root@187.77.234.79 'bash -s' < scripts/fix-vps-models-json.sh

python3 << 'PYEOF'
import json, glob

t = "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"

# Update all agent models.json
for p in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f:
        d = json.load(f)
    changed = False
    for prov in ["anthropic-max", "anthropic"]:
        if prov in d.get("providers", {}):
            d["providers"][prov]["apiKey"] = t
            changed = True
            print(f"  {p}: {prov}")
    if changed:
        with open(p, "w") as f:
            json.dump(d, f, indent=2)

# Update main openclaw.json
with open("/root/.openclaw/openclaw.json") as f:
    c = json.load(f)
if "anthropic-max" in c.get("models", {}).get("providers", {}):
    c["models"]["providers"]["anthropic-max"]["apiKey"] = t
    with open("/root/.openclaw/openclaw.json", "w") as f:
        json.dump(c, f, indent=2)
    print("  openclaw.json: anthropic-max")

print("All done")
PYEOF

# Restart gateway
pkill -f openclaw-gateway
sleep 2
nohup openclaw-gateway > /dev/null 2>&1 &
sleep 4
echo "Gateway PID: $(pgrep -f openclaw-gateway)"
openclaw models 2>&1 | grep 'anthropic-max effective'
