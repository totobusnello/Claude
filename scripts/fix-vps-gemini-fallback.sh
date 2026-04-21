#!/bin/bash
# Add Gemini 2.5 Flash as fallback and update Google AI Studio key
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-gemini-fallback.sh

python3 << 'PYEOF'
import json, glob

KEY = "AIzaSyBhTDf3ivXwkjFJj1LaeQaZDmADmSppQCA"

with open("/root/.openclaw/openclaw.json") as f:
    c = json.load(f)

# Set default fallback
c["agents"]["defaults"]["model"] = {
    "primary": "anthropic/claude-sonnet-4-6",
    "fallbacks": ["gemini-openai/gemini-2.5-flash"]
}
print("Defaults: anthropic primary, gemini fallback")

# Update gemini keys in providers
for prov in ["gemini-openai", "gemini", "google"]:
    if prov in c.get("models", {}).get("providers", {}):
        c["models"]["providers"][prov]["apiKey"] = KEY
        print(f"  {prov} key updated")

with open("/root/.openclaw/openclaw.json", "w") as f:
    json.dump(c, f, indent=2)

# Also update agent models.json
for p in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f: d = json.load(f)
    for prov in ["gemini-openai", "gemini", "google"]:
        if prov in d.get("providers", {}):
            d["providers"][prov]["apiKey"] = KEY
    with open(p, "w") as f: json.dump(d, f, indent=2)
print("All agent models.json updated")

# Update crons that use gemini to ensure correct key
print("Done")
PYEOF

systemctl restart openclaw-gateway 2>/dev/null
sleep 3
echo "Gateway restarted"
