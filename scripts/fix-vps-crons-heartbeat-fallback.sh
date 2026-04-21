#!/bin/bash
# Update ALL crons: primary gemini/gemini-2.5-flash, need to check if cron edit supports fallback
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-crons-heartbeat-fallback.sh

echo "Checking if cron edit supports fallback..."
openclaw cron edit --help 2>&1 | grep -i fallback | head -3
echo "---"

# All cron IDs
CRONS=(
  9c426ab4-4e1d-41bf-b79e-c8c105a7019b
  972e137d-2e90-44e9-bdd0-370854007741
  bd113906-1fcd-48b5-97dd-3b0de5b8d9e9
  86190729-166e-4545-ae49-de31cf7c961e
  5053cc02-9711-4888-8bcd-617b5d518356
  203a9886-70bf-423d-9598-2f7bf303a3c2
  6e7fdb46-2b7b-463f-a46f-d2b319a9861c
  bd1f92aa-b865-4354-9a3c-db8af9e36f32
  ee3139ea-7032-4751-ae89-44eb58d7e7e4
  4b20b1b7-0dfa-4e44-aaf8-4d3eb202852f
  92f04fc3-c212-482c-975f-adf5ed7cc3c5
  00d06b42-df92-448f-ad5a-d0a696d80b01
  8b8b8500-567e-4d63-842c-6ff2b73d45aa
  b1592ecb-e512-428e-81df-93d68147d5ca
  358f09d9-b487-4150-8167-1eda8362dde1
  83caeb07-9a8d-44b8-b4c9-fbc30251410f
  3d10a87e-2563-4428-a704-3eb6099f6802
  72efbd7d-2fee-42c4-b569-3e449a86347c
  07273f2a-5957-47a0-9e8b-c8804a848f38
  62d6517c-1d5f-4298-ad6b-b5c360fa8b1e
  fb1df3c0-9dd5-4d2d-9167-182b612c7ab7
  a717e1f8-debd-4109-9aba-fb61d408a0d2
  492b8b80-3a8f-4d3d-8cd7-ec11a6bc9a92
  e138a055-b6d5-40dd-9dc1-4d87a2ad1b1c
  9cef3c71-efce-4d18-a30d-bfafb0648a53
  83c41a34-ec53-44f0-9cb2-22e5a8584ef9
  ec44dd9b-af29-4468-8bf8-08d34917fcc9
)

echo "Setting all ${#CRONS[@]} crons to gemini/gemini-2.5-flash..."
for id in "${CRONS[@]}"; do
  echo -n "  $id: "
  openclaw cron edit "$id" --model gemini/gemini-2.5-flash 2>&1 | tail -1
done

echo ""
echo "Verifying..."
openclaw cron list 2>&1 | grep -v 'gemini/gemini-2.5' | grep -v '^$' | grep -v 'ID ' | grep -v '^─' | head -5
echo "(should be empty - all crons on gemini)"
