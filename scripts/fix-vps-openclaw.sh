#!/bin/bash
# Fix OpenClaw VPS: single token, remove secondary provider, migrate crons
# Run: ssh root@100.87.8.44 'bash -s' < scripts/fix-vps-openclaw.sh

set -e

echo "=== 1/4 Updating credentials ==="
cat > /root/.claude/.credentials.json << 'CREDS'
{
  "claudeAiOauth": {
    "accessToken": "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",
    "expiresAt": 1775605006297,
    "subscriptionType": "pro",
    "rateLimitTier": "default_claude_ai"
  }
}
CREDS
cp /root/.claude/.credentials.json /root/.claude/.credentials-pro.json
echo "  Done"

echo "=== 2/4 Cleaning auth profiles (keep only anthropic-max) ==="
python3 -c '
import json
with open("/root/.openclaw/openclaw.json") as f:
    config = json.load(f)
profiles = config.get("auth", {}).get("profiles", {})
to_remove = [k for k in profiles if "anthropic" in k and k != "anthropic-max:default"]
for k in to_remove:
    del profiles[k]
    print(f"  Removed: {k}")
if not to_remove:
    print("  Nothing to remove")
with open("/root/.openclaw/openclaw.json", "w") as f:
    json.dump(config, f, indent=2)
'
echo "  Done"

echo "=== 3/4 Migrating 14 crons from anthropic-secondary -> anthropic-max ==="
CRON_IDS=(
  83caeb07-9a8d-44b8-b4c9-fbc30251410f
  bd113906-1fcd-48b5-97dd-3b0de5b8d9e9
  86190729-166e-4545-ae49-de31cf7c961e
  5053cc02-9711-4888-8bcd-617b5d518356
  203a9886-70bf-423d-9598-2f7bf303a3c2
  bd1f92aa-b865-4354-9a3c-db8af9e36f32
  ee3139ea-7032-4751-ae89-44eb58d7e7e4
  92f04fc3-c212-482c-975f-adf5ed7cc3c5
  00d06b42-df92-448f-ad5a-d0a696d80b01
  8b8b8500-567e-4d63-842c-6ff2b73d45aa
  b1592ecb-e512-428e-81df-93d68147d5ca
  492b8b80-3a8f-4d3d-8cd7-ec11a6bc9a92
  9cef3c71-efce-4d18-a30d-bfafb0648a53
  83c41a34-ec53-44f0-9cb2-22e5a8584ef9
)

for id in "${CRON_IDS[@]}"; do
  echo -n "  $id ... "
  openclaw cron update "$id" --model anthropic-max/claude-sonnet-4-6 2>&1 | tail -1 || echo "FAILED"
done
echo "  Done"

echo "=== 4/4 Restarting gateway ==="
kill $(pgrep -f openclaw-gateway) 2>/dev/null || true
sleep 2
nohup openclaw-gateway > /dev/null 2>&1 &
sleep 3
echo "  Gateway PID: $(pgrep -f openclaw-gateway)"

echo ""
echo "=== COMPLETE ==="
echo "All crons migrated to anthropic-max, single token configured."
echo "Run 'openclaw cron list' to verify."
