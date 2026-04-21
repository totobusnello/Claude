#!/bin/bash
# Restore openclaw native anthropic auth (mode: token) like pre-proxy setup
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-restore-native.sh

set -e

TOKEN="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"

echo "=== 1/4 Restoring credentials with Max metadata ==="
cat > /root/.claude/.credentials.json << CREDS
{
  "claudeAiOauth": {
    "accessToken": "$TOKEN",
    "expiresAt": 1807125006297,
    "scopes": ["user:file_upload","user:inference","user:mcp_servers","user:profile","user:sessions:claude_code"],
    "subscriptionType": "max",
    "rateLimitTier": "default_claude_max_20x"
  }
}
CREDS
cp /root/.claude/.credentials.json /root/.claude/.credentials-pro.json
echo "  Done"

echo "=== 2/4 Restoring auth profiles (anthropic mode:token) ==="
python3 << 'PYEOF'
import json

with open("/root/.openclaw/openclaw.json") as f:
    config = json.load(f)

# Restore auth profiles to native token mode (like pre-proxy backup)
profiles = config.get("auth", {}).get("profiles", {})

# Remove all anthropic-* profiles
to_remove = [k for k in profiles if "anthropic" in k]
for k in to_remove:
    del profiles[k]
    print(f"  Removed: {k}")

# Add back native token profiles (as in backup)
profiles["anthropic:default"] = {"provider": "anthropic", "mode": "token"}
profiles["anthropic-max:default"] = {"provider": "anthropic-max", "mode": "token"}
print("  Added: anthropic:default (mode: token)")
print("  Added: anthropic-max:default (mode: token)")

# Remove custom anthropic-max from models.providers (use built-in)
provs = config.get("models", {}).get("providers", {})
if "anthropic-max" in provs:
    del provs["anthropic-max"]
    print("  Removed custom anthropic-max provider (will use built-in)")
if "anthropic" in provs:
    del provs["anthropic"]
    print("  Removed custom anthropic provider (will use built-in)")

with open("/root/.openclaw/openclaw.json", "w") as f:
    json.dump(config, f, indent=2)
print("  Config saved")
PYEOF

echo "=== 3/4 Updating agent auth-profiles to token mode ==="
python3 << 'PYEOF'
import json, glob

for p in glob.glob("/root/.openclaw/agents/*/agent/auth-profiles.json"):
    with open(p) as f:
        d = json.load(f)
    profiles = d.get("profiles", {})
    changed = False
    for k in list(profiles.keys()):
        if "anthropic" in k:
            profiles[k] = {"type": "token", "provider": k.split(":")[0]}
            changed = True
    if changed:
        with open(p, "w") as f:
            json.dump(d, f, indent=2)
        print(f"  {p}: switched to token mode")

# Also clean models.json - remove custom anthropic providers
for p in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f:
        d = json.load(f)
    provs = d.get("providers", {})
    removed = False
    for prov in ["anthropic-max", "anthropic"]:
        if prov in provs:
            del provs[prov]
            removed = True
            print(f"  {p}: removed custom {prov} provider")
    if removed:
        with open(p, "w") as f:
            json.dump(d, f, indent=2)
PYEOF

echo "=== 4/4 Restarting gateway ==="
pkill -f openclaw-gateway 2>/dev/null || true
sleep 3
nohup openclaw-gateway > /dev/null 2>&1 &
sleep 5
echo "  Gateway PID: $(pgrep -f openclaw-gateway)"
openclaw models 2>&1 | grep -i 'anthropic.*effective'
echo ""
echo "=== DONE ==="
