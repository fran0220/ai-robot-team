#!/bin/bash
set -euo pipefail
TASK_ID="$1"
OUTPUT="$2"

for i in {1..30}; do
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
  sleep 10
done

echo "Timeout waiting for generation" >&2
exit 1
