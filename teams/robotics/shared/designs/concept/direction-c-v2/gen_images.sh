#!/usr/bin/env bash
set -euo pipefail

API_KEY="$GEMINI_API_KEY"
MODEL="imagen-4.0-generate-001"

function gen_image() {
  local prompt="$1"
  local out="$2"
  curl -s "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"instances\":[{\"prompt\":\"${prompt}\"}],\"parameters\":{\"sampleCount\":1,\"aspectRatio\":\"1:1\",\"personGeneration\":\"allow_adult\"}}" \
    | jq -r '.predictions[0].bytesBase64Encoded' \
    | base64 -d > "${out}"
}

# Prompts
PROMPT_ROBOT_FRONT="Professional product render of a small 15-20cm tall plush emotional robot toy, front view. Soft fabric body with visible stitching and plush texture, cute proportions. Face is a black glossy screen panel with two large rounded-rectangle LED eyes glowing warm yellow, friendly and lively. Minimal clean studio background, soft diffused lighting, high detail."
PROMPT_ROBOT_3Q="Professional product render of a small 15-20cm tall plush emotional robot toy, 3/4 view. Soft fabric body with visible stitching and plush texture, cute proportions. Face is a black glossy screen panel with two large rounded-rectangle LED eyes glowing warm yellow, friendly and lively. Minimal clean studio background, soft diffused lighting, high detail."
PROMPT_EXPRESS="A 2x2 grid of the same small 15-20cm plush emotional robot toy head, front view, showing four expressions: happy, sad, thinking, surprised. Soft fabric body with visible stitching and plush texture. Black glossy screen panel face with two large rounded-rectangle LED eyes glowing warm yellow, expressions conveyed by eye shape/angle and subtle glow. Clean white background, studio lighting, high detail."
PROMPT_GO_MODULE="Professional product render of a full-size 45-50cm Go board module with high-tech industrial design. Matte white/light gray plastic body, subtle silver metal accents. Go board surface in warm light woodgrain or beige. Integrated precise mechanical robotic arm in clean industrial style (no fabric), minimal Apple-like design. Studio lighting, clean background, high detail."
PROMPT_GO_ARM="Close-up product render of a precise industrial robotic arm for a Go board module. High-tech, minimal Apple-like industrial design, matte white/light gray plastic with silver metal accents. No fabric. Studio lighting, clean background, high detail."
PROMPT_FULL_SET="Professional product render showing a full set: a small 15-20cm plush emotional robot toy next to a full-size 45-50cm Go board module. Emphasize correct size ratio (toy much smaller than the board). Robot has plush fabric with stitching, black face screen with two large warm yellow LED rounded-rectangle eyes. Go module is high-tech industrial design, matte white/light gray plastic, silver metal accents, light woodgrain or beige board surface, precise robotic arm. Clean studio background, soft lighting, high detail."

OUT_DIR="/root/multiagent/team/agents/idra/workspace/designs/concept/direction-c-v2"

gen_image "$PROMPT_ROBOT_FRONT" "$OUT_DIR/robot-front-v2.png"
gen_image "$PROMPT_ROBOT_3Q" "$OUT_DIR/robot-3quarter-v2.png"
gen_image "$PROMPT_EXPRESS" "$OUT_DIR/expressions.png"
gen_image "$PROMPT_GO_MODULE" "$OUT_DIR/go-module-tech.png"
gen_image "$PROMPT_GO_ARM" "$OUT_DIR/go-module-arm-tech.png"
gen_image "$PROMPT_FULL_SET" "$OUT_DIR/full-set-scale.png"

