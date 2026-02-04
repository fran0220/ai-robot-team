#!/bin/bash
TASK_ID="$1"
KEY="$2"
OUTPUT="$3"
curl -s "https://api.zoo.dev/user/text-to-cad/$TASK_ID" -H "Authorization: Bearer $ZOO_API_KEY" | jq -r ".outputs[\"$KEY\"]" | base64 -d > "$OUTPUT"
