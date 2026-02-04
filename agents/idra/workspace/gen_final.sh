#!/usr/bin/env bash
set -euo pipefail

API_KEY="${GEMINI_API_KEY}"
MODEL="imagen-4.0-generate-001"
OUT_DIR="/root/multiagent/team/shared/designs/concept/final"

mkdir -p "$OUT_DIR"

function gen_image() {
  local prompt="$1"
  local out="$2"
  local aspect="${3:-1:1}"
  local payload
  payload=$(jq -n --arg prompt "$prompt" --arg aspect "$aspect" '{instances:[{prompt:$prompt}], parameters:{sampleCount:1, aspectRatio:$aspect, personGeneration:"allow_adult"}}')
  curl -s "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    | jq -r '.predictions[0].bytesBase64Encoded' \
    | base64 -d > "$out"
}

# ---- Robot (plush emotional companion) ----
PROMPT_ROBOT_FRONT="Professional product render of a small 15–20cm tall plush emotional robot toy, front view. Soft fabric body with visible stitching, rounded cute proportions. Face is a glossy black screen panel with two large rounded-rectangle LED eyes glowing warm yellow. Subtle speaker grille and top touch area hinted. Clean white studio background, soft diffused lighting, high detail, photorealistic."
PROMPT_ROBOT_SIDE="Professional product render of a small 15–20cm tall plush emotional robot toy, side view. Soft fabric body with visible stitching, rounded cute proportions. Face is a glossy black screen panel with two large rounded-rectangle LED eyes glowing warm yellow. Show side speaker grille and slight top touch pad. Clean white studio background, soft diffused lighting, high detail."
PROMPT_ROBOT_BACK="Professional product render of a small 15–20cm tall plush emotional robot toy, back view. Soft fabric body with visible stitching, rounded cute proportions. Minimal seam lines, hidden speaker vents near lower back. Clean white studio background, soft diffused lighting, high detail."
PROMPT_ROBOT_3Q="Professional product render of a small 15–20cm tall plush emotional robot toy, 3/4 view. Soft fabric body with visible stitching, rounded cute proportions. Face is a glossy black screen panel with two large rounded-rectangle LED eyes glowing warm yellow. Clean white studio background, soft diffused lighting, high detail."
PROMPT_ROBOT_EXPRESS="A 2x2 grid showing the same small 15–20cm plush emotional robot head, front view, four expressions: happy, sad, thinking, surprised. Black glossy screen panel face with two large warm yellow LED eyes; expressions conveyed by eye shape/angle and subtle glow. Soft fabric body edge with stitching. Clean white background, studio lighting, high detail."
PROMPT_ROBOT_DETAIL="Macro close-up product render of the plush emotional robot detailing: glossy black LED expression screen with warm yellow eyes, fine fabric weave and stitching, subtle speaker grille perforations, and a soft-touch top interaction zone. Clean studio background, high detail, photorealistic."

# ---- Go Module (realistic proportions) ----
PROMPT_GO_FRONT="Professional product render of a full-size Go board module, front view. Thin base 50x55cm, thickness 3–5cm, matte white/gray body with subtle metallic accents. Standard 19x19 Go board surface 42x45cm in warm light woodgrain. Slender single robotic arm emerging from the rear, high-tech minimal design. Clean studio background, soft lighting, photorealistic."
PROMPT_GO_SIDE="Professional product render of a full-size Go board module, side view. Thin base 50x55cm, thickness 3–5cm, matte white/gray body with subtle metallic accents. Standard 19x19 Go board surface 42x45cm in warm light woodgrain. Slender single robotic arm emerging from the rear, high-tech minimal design. Clean studio background, soft lighting, photorealistic."
PROMPT_GO_BACK="Professional product render of a full-size Go board module, back view. Thin base 50x55cm, thickness 3–5cm, matte white/gray body with subtle metallic accents. Slender single robotic arm mount visible from the rear, high-tech minimal design. Clean studio background, soft lighting, photorealistic."
PROMPT_GO_3Q="Professional product render of a full-size Go board module, 3/4 view. Thin base 50x55cm, thickness 3–5cm, matte white/gray body with subtle metallic accents. Standard 19x19 Go board surface 42x45cm in warm light woodgrain. Slender single robotic arm emerging from the rear, high-tech minimal design. Clean studio background, soft lighting, photorealistic."
PROMPT_GO_TOP="Top-down product render of a full-size Go board module. Standard 19x19 Go board surface 42x45cm in warm light woodgrain, thin matte white/gray base 50x55cm. Subtle robotic arm footprint visible near the rear edge. Clean studio background, high detail, photorealistic."
PROMPT_GO_ARM_DETAIL="Close-up product render of the slender single robotic arm placing a Go stone on the board. High-tech minimal design, matte white/gray with metallic joints. Warm light woodgrain board with 19x19 grid lines. Clean studio background, high detail, photorealistic."

# ---- Full set ----
PROMPT_FULL_FRONT="Professional product render of the full set, front view: a small 15–20cm plush emotional robot next to a full-size Go board module (50x55cm base). Emphasize correct size ratio: robot about one-third the board height. Robot has plush fabric with stitching and glossy black face screen with large warm yellow LED eyes. Go module is matte white/gray with light woodgrain board and slender rear robotic arm. Clean studio background, soft lighting, high detail."
PROMPT_FULL_SCENE="Lifestyle product photo of the full set on a desk: a small 15–20cm plush emotional robot beside a full-size Go board module (50x55cm base). Emphasize correct size ratio; include a human hand reaching toward the board for scale. Warm, natural indoor lighting, tidy workspace, photorealistic."

# Generate images

gen_image "$PROMPT_ROBOT_FRONT" "$OUT_DIR/robot-front.png" "1:1"
gen_image "$PROMPT_ROBOT_SIDE" "$OUT_DIR/robot-side.png" "1:1"
gen_image "$PROMPT_ROBOT_BACK" "$OUT_DIR/robot-back.png" "1:1"
gen_image "$PROMPT_ROBOT_3Q" "$OUT_DIR/robot-3quarter.png" "1:1"
gen_image "$PROMPT_ROBOT_EXPRESS" "$OUT_DIR/robot-expressions.png" "1:1"
gen_image "$PROMPT_ROBOT_DETAIL" "$OUT_DIR/robot-detail.png" "1:1"

gen_image "$PROMPT_GO_FRONT" "$OUT_DIR/go-module-front.png" "1:1"
gen_image "$PROMPT_GO_SIDE" "$OUT_DIR/go-module-side.png" "1:1"
gen_image "$PROMPT_GO_BACK" "$OUT_DIR/go-module-back.png" "1:1"
gen_image "$PROMPT_GO_3Q" "$OUT_DIR/go-module-3quarter.png" "1:1"
gen_image "$PROMPT_GO_TOP" "$OUT_DIR/go-module-top.png" "1:1"
gen_image "$PROMPT_GO_ARM_DETAIL" "$OUT_DIR/go-module-arm-detail.png" "1:1"

gen_image "$PROMPT_FULL_FRONT" "$OUT_DIR/full-set-front.png" "1:1"
gen_image "$PROMPT_FULL_SCENE" "$OUT_DIR/full-set-scene.png" "4:3"

echo "Done." 
