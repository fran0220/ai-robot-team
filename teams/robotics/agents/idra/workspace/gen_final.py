#!/usr/bin/env python3
import base64
import json
import os
import sys
import time
from typing import Dict, Tuple

import requests

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("GEMINI_API_KEY not set", file=sys.stderr)
    sys.exit(1)

MODEL = "imagen-4.0-generate-001"
OUT_DIR = "/root/multiagent/team/shared/designs/concept/final"

PROMPTS: Dict[str, Tuple[str, str]] = {
    # Robot (plush emotional companion)
    "robot-front.png": (
        "Professional product render of a small 15-20cm tall plush emotional robot toy, front view. "
        "Soft fabric body with visible stitching, rounded cute proportions. Face is a glossy black screen panel "
        "with two large rounded-rectangle LED eyes glowing warm yellow. Subtle speaker grille and top touch area "
        "hinted. Clean white studio background, soft diffused lighting, high detail, photorealistic.",
        "1:1",
    ),
    "robot-side.png": (
        "Professional product render of a small 15-20cm tall plush emotional robot toy, side view. "
        "Soft fabric body with visible stitching, rounded cute proportions. Face is a glossy black screen panel "
        "with two large rounded-rectangle LED eyes glowing warm yellow. Show side speaker grille and slight top touch pad. "
        "Clean white studio background, soft diffused lighting, high detail.",
        "1:1",
    ),
    "robot-back.png": (
        "Professional product render of a small 15-20cm tall plush emotional robot toy, back view. "
        "Soft fabric body with visible stitching, rounded cute proportions. Minimal seam lines, hidden speaker vents near lower back. "
        "Clean white studio background, soft diffused lighting, high detail.",
        "1:1",
    ),
    "robot-3quarter.png": (
        "Professional product render of a small 15-20cm tall plush emotional robot toy, 3/4 view. "
        "Soft fabric body with visible stitching, rounded cute proportions. Face is a glossy black screen panel "
        "with two large rounded-rectangle LED eyes glowing warm yellow. Clean white studio background, soft diffused lighting, high detail.",
        "1:1",
    ),
    "robot-expressions.png": (
        "A 2x2 grid showing the same small 15-20cm plush emotional robot head, front view, four expressions: happy, sad, thinking, surprised. "
        "Black glossy screen panel face with two large warm yellow LED eyes; expressions conveyed by eye shape/angle and subtle glow. "
        "Soft fabric body edge with stitching. Clean white background, studio lighting, high detail.",
        "1:1",
    ),
    "robot-detail.png": (
        "Macro close-up product render of the plush emotional robot detailing: glossy black LED expression screen with warm yellow eyes, "
        "fine fabric weave and stitching, subtle speaker grille perforations, and a soft-touch top interaction zone. "
        "Clean studio background, high detail, photorealistic.",
        "1:1",
    ),

    # Go Module (realistic proportions)
    "go-module-front.png": (
        "Professional product render of a full-size Go board module, front view. Thin base 50x55cm, thickness 3-5cm, "
        "matte white/gray body with subtle metallic accents. Standard 19x19 Go board surface 42x45cm in warm light woodgrain. "
        "Slender single robotic arm emerging from the rear, high-tech minimal design. Clean studio background, soft lighting, photorealistic.",
        "1:1",
    ),
    "go-module-side.png": (
        "Professional product render of a full-size Go board module, side view. Thin base 50x55cm, thickness 3-5cm, "
        "matte white/gray body with subtle metallic accents. Standard 19x19 Go board surface 42x45cm in warm light woodgrain. "
        "Slender single robotic arm emerging from the rear, high-tech minimal design. Clean studio background, soft lighting, photorealistic.",
        "1:1",
    ),
    "go-module-back.png": (
        "Professional product render of a full-size Go board module, back view. Thin base 50x55cm, thickness 3-5cm, "
        "matte white/gray body with subtle metallic accents. Slender single robotic arm mount visible from the rear, high-tech minimal design. "
        "Clean studio background, soft lighting, photorealistic.",
        "1:1",
    ),
    "go-module-3quarter.png": (
        "Professional product render of a full-size Go board module, 3/4 view. Thin base 50x55cm, thickness 3-5cm, "
        "matte white/gray body with subtle metallic accents. Standard 19x19 Go board surface 42x45cm in warm light woodgrain. "
        "Slender single robotic arm emerging from the rear, high-tech minimal design. Clean studio background, soft lighting, photorealistic.",
        "1:1",
    ),
    "go-module-top.png": (
        "Top-down product render of a full-size Go board module. Standard 19x19 Go board surface 42x45cm in warm light woodgrain, "
        "thin matte white/gray base 50x55cm. Subtle robotic arm footprint visible near the rear edge. Clean studio background, high detail, photorealistic.",
        "1:1",
    ),
    "go-module-arm-detail.png": (
        "Close-up product render of the slender single robotic arm placing a Go stone on the board. High-tech minimal design, "
        "matte white/gray with metallic joints. Warm light woodgrain board with 19x19 grid lines. Clean studio background, high detail, photorealistic.",
        "1:1",
    ),

    # Full set
    "full-set-front.png": (
        "Professional product render of the full set, front view: a small 15-20cm plush emotional robot next to a full-size Go board module (50x55cm base). "
        "Emphasize correct size ratio: robot about one-third the board height. Robot has plush fabric with stitching and glossy black face screen with large warm yellow LED eyes. "
        "Go module is matte white/gray with light woodgrain board and slender rear robotic arm. Clean studio background, soft lighting, high detail.",
        "1:1",
    ),
    "full-set-scene.png": (
        "Lifestyle product photo of the full set on a desk: a small 15-20cm plush emotional robot beside a full-size Go board module (50x55cm base). "
        "Emphasize correct size ratio; include a human hand reaching toward the board for scale. Warm, natural indoor lighting, tidy workspace, photorealistic.",
        "4:3",
    ),
}


def generate(prompt: str, out_path: str, aspect: str, retries: int = 2) -> None:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:predict?key={API_KEY}"
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": aspect,
            "personGeneration": "allow_adult",
        },
    }
    last_err = None
    for attempt in range(retries + 1):
        try:
            resp = requests.post(url, json=payload, timeout=120)
            if resp.status_code != 200:
                last_err = RuntimeError(f"HTTP {resp.status_code}: {resp.text[:200]}")
                time.sleep(1)
                continue
            data = resp.json()
            b64 = data["predictions"][0]["bytesBase64Encoded"]
            raw = base64.b64decode(b64)
            with open(out_path, "wb") as f:
                f.write(raw)
            return
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            time.sleep(1)
    raise RuntimeError(f"Failed to generate {out_path}: {last_err}")


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for filename, (prompt, aspect) in PROMPTS.items():
        out_path = os.path.join(OUT_DIR, filename)
        print(f"Generating {filename} ...", flush=True)
        generate(prompt, out_path, aspect)


if __name__ == "__main__":
    main()
