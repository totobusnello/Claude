#!/bin/bash
# Migrate all crons from gemini-openai to gemini (native API)
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-crons-gemini-native.sh

CRON_IDS=(
  9c426ab4-4e1d-41bf-b79e-c8c105a7019b
  972e137d-2e90-44e9-bdd0-370854007741
  6e7fdb46-2b7b-463f-a46f-d2b319a9861c
  4b20b1b7-0dfa-4e44-aaf8-4d3eb202852f
  358f09d9-b487-4150-8167-1eda8362dde1
  3d10a87e-2563-4428-a704-3eb6099f6802
  72efbd7d-2fee-42c4-b569-3e449a86347c
  07273f2a-5957-47a0-9e8b-c8804a848f38
  62d6517c-1d5f-4298-ad6b-b5c360fa8b1e
  fb1df3c0-9dd5-4d2d-9167-182b612c7ab7
  a717e1f8-debd-4109-9aba-fb61d408a0d2
  ec44dd9b-af29-4468-8bf8-08d34917fcc9
)

echo "Migrating ${#CRON_IDS[@]} crons from gemini-openai to gemini native..."
for id in "${CRON_IDS[@]}"; do
  echo -n "  $id: "
  openclaw cron edit "$id" --model gemini/gemini-2.5-flash 2>&1 | tail -1
done

echo ""
echo "Testing health monitor cron..."
openclaw cron run 9c426ab4-4e1d-41bf-b79e-c8c105a7019b 2>&1 | head -3
sleep 10
echo "Checking result..."
openclaw cron runs 9c426ab4-4e1d-41bf-b79e-c8c105a7019b 2>&1 | head -5
