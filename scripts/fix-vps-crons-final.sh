#!/bin/bash
# Migrate remaining crons: anthropic-max -> anthropic, gemini-openai -> gemini
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-crons-final.sh

echo "=== anthropic-max -> anthropic/claude-sonnet-4-6 ==="
for id in bd113906-1fcd-48b5-97dd-3b0de5b8d9e9 86190729-166e-4545-ae49-de31cf7c961e 5053cc02-9711-4888-8bcd-617b5d518356 203a9886-70bf-423d-9598-2f7bf303a3c2 bd1f92aa-b865-4354-9a3c-db8af9e36f32 ee3139ea-7032-4751-ae89-44eb58d7e7e4 92f04fc3-c212-482c-975f-adf5ed7cc3c5 00d06b42-df92-448f-ad5a-d0a696d80b01 8b8b8500-567e-4d63-842c-6ff2b73d45aa b1592ecb-e512-428e-81df-93d68147d5ca 83caeb07-9a8d-44b8-b4c9-fbc30251410f 492b8b80-3a8f-4d3d-8cd7-ec11a6bc9a92 9cef3c71-efce-4d18-a30d-bfafb0648a53 83c41a34-ec53-44f0-9cb2-22e5a8584ef9; do
  echo -n "  $id: "
  openclaw cron edit "$id" --model gemini/gemini-2.5-flash 2>&1 | tail -1
done

echo ""
echo "=== gemini-openai -> gemini ==="
for id in e138a055-b6d5-40dd-9dc1-4d87a2ad1b1c; do
  echo -n "  $id: "
  openclaw cron edit "$id" --model gemini/gemini-2.5-flash 2>&1 | tail -1
done

echo ""
echo "=== Verify ==="
openclaw cron list 2>&1 | grep -cE 'anthropic-max|gemini-openai'
echo "remaining bad refs (should be 0)"
