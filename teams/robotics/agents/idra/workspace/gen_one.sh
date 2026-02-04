#!/usr/bin/env bash
set -euo pipefail

API_KEY="${GEMINI_API_KEY}"
MODEL="imagen-4.0-generate-001"
OUT_DIR="/root/multiagent/team/shared/designs/concept/final"

prompt="$1"
out="$2"
aspect="${3:-1:1}"

mkdir -p "$OUT_DIR"

payload=$(jq -n --arg prompt "$prompt" --arg aspect "$aspect" '{instances:[{prompt:$prompt}], parameters:{sampleCount:1, aspectRatio:$aspect, personGeneration:"allow_adult"}}')

curl -s "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  | jq -r '.predictions[0].bytesBase64Encoded' \
  | base64 -d > "$out"
