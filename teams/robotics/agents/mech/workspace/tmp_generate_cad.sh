#!/bin/bash
set -euo pipefail
PROMPT="$1"
OUTPUT="$2"

echo "Submitting: $OUTPUT"
RESPONSE=$(curl -s -X POST "https://api.zoo.dev/ai/text-to-cad/step" \
  -H "Authorization: Bearer $ZOO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\"}")

TASK_ID=$(echo "$RESPONSE" | jq -r '.id')
if [ -z "$TASK_ID" ] || [ "$TASK_ID" = "null" ]; then
  echo "Failed to get task id: $RESPONSE" >&2
  exit 1
fi

echo "Task ID: $TASK_ID"
for i in {1..20}; do
  sleep 10
  RESULT=$(curl -s "https://api.zoo.dev/user/text-to-cad/$TASK_ID" \
    -H "Authorization: Bearer $ZOO_API_KEY")
  STATUS=$(echo "$RESULT" | jq -r '.status')
  echo "  Status: $STATUS"
  if [ "$STATUS" = "completed" ]; then
    echo "$RESULT" | jq -r '.outputs["source.step"]' | base64 -d > "$OUTPUT"
    echo "Saved: $OUTPUT ($(wc -c < "$OUTPUT") bytes)"
    exit 0
  elif [ "$STATUS" = "failed" ]; then
    echo "Generation failed" >&2
    echo "$RESULT" >&2
    exit 1
  fi
done

echo "Timeout waiting for generation" >&2
exit 1
