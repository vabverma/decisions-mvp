#!/usr/bin/env python3
"""
Handbag Series — Label + Stitch Script
Adds price tier caption to each clip, then stitches into one master video.

DROP YOUR 5 CLIPS HERE (rename to match):
  clip1.mp4  →  Polène Cyme Mini / $500
  clip2.mp4  →  Strathberry Midi / $1,000
  clip3.mp4  →  Loewe Puzzle / $2,500
  clip4.mp4  →  The Row Margaux / $5,000
  clip5.mp4  →  Hermès Kelly / $10,000

OUTPUT:
  labeled/clip1_labeled.mp4  (and 2-5)
  handbag_master.mp4  (all 5 stitched)

USAGE:
  python3 handbag_label_stitch.py
"""

import subprocess
import sys
import os
from PIL import Image, ImageDraw, ImageFont

# ── CONFIG ────────────────────────────────────────────────────────────────────

CLIPS = [
    {"file": "clip1.mp4", "name": "Polène Cyme Mini", "price": "$500"},
    {"file": "clip2.mp4", "name": "Strathberry Midi",  "price": "$1,000"},
    {"file": "clip3.mp4", "name": "Loewe Puzzle",      "price": "$2,500"},
    {"file": "clip4.mp4", "name": "The Row Margaux",   "price": "$5,000"},
    {"file": "clip5.mp4", "name": "Hermès Kelly",      "price": "$10,000"},
]

VIDEO_W, VIDEO_H = 1080, 1920   # 9:16 TikTok
OUTPUT_DIR = "labeled"
MASTER_OUTPUT = "handbag_master.mp4"

# ── HELPERS ───────────────────────────────────────────────────────────────────

def get_font(size):
    """Try system fonts, fall back to default."""
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def make_overlay(name, price, width=VIDEO_W, height=VIDEO_H):
    """
    Create a transparent PNG with a label pill at the bottom of the frame.
    Returns the path to the saved PNG.
    """
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    font_name  = get_font(52)
    font_price = get_font(72)

    # Measure text
    name_bbox  = draw.textbbox((0, 0), name,  font=font_name)
    price_bbox = draw.textbbox((0, 0), price, font=font_price)

    name_w  = name_bbox[2]  - name_bbox[0]
    price_w = price_bbox[2] - price_bbox[0]
    block_w = max(name_w, price_w) + 80
    name_h  = name_bbox[3]  - name_bbox[1]
    price_h = price_bbox[3] - price_bbox[1]
    block_h = name_h + price_h + 40  # padding between lines

    # Position: centered horizontally, 120px from bottom
    x = (width - block_w) // 2
    y = height - block_h - 120

    # Dark pill background
    pad = 24
    pill = [x - pad, y - pad, x + block_w + pad, y + block_h + pad]
    draw.rounded_rectangle(pill, radius=20, fill=(0, 0, 0, 175))

    # Bag name (smaller, lighter weight appearance)
    name_x = x + (block_w - name_w) // 2
    draw.text((name_x, y), name, font=font_name, fill=(200, 200, 200, 255))

    # Price (larger, white, bold)
    price_x = x + (block_w - price_w) // 2
    draw.text((price_x, y + name_h + 16), price, font=font_price, fill=(255, 255, 255, 255))

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{name.replace(' ', '_')}_overlay.png")
    img.save(out_path, "PNG")
    return out_path


def label_clip(clip_file, overlay_png, out_file):
    """Use ffmpeg overlay filter to composite text PNG onto the video clip."""
    cmd = [
        "ffmpeg", "-y",
        "-i", clip_file,
        "-i", overlay_png,
        "-filter_complex", "[0:v][1:v]overlay=0:0[outv]",
        "-map", "[outv]",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR labeling {clip_file}:\n{result.stderr[-500:]}")
        return False
    return True


def stitch_clips(labeled_files, output):
    """Concatenate all labeled clips into one master video."""
    # Write ffmpeg concat list
    list_path = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(list_path, "w") as f:
        for path in labeled_files:
            abs_path = os.path.abspath(path)
            f.write(f"file '{abs_path}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", list_path,
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-pix_fmt", "yuv420p",
        output
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR stitching:\n{result.stderr[-500:]}")
        return False
    return True


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("\n── Handbag Series: Label + Stitch ──\n")

    labeled_files = []
    missing = []

    for clip in CLIPS:
        src = clip["file"]
        if not os.path.exists(src):
            missing.append(src)
            continue

        print(f"[1/3] Creating overlay for {clip['name']} ({clip['price']})...")
        overlay = make_overlay(clip["name"], clip["price"])

        out_name = src.replace(".mp4", "_labeled.mp4")
        out_path = os.path.join(OUTPUT_DIR, out_name)
        print(f"[2/3] Labeling clip → {out_path}")

        ok = label_clip(src, overlay, out_path)
        if ok:
            labeled_files.append(out_path)
            print(f"      ✓ Done\n")
        else:
            print(f"      ✗ Failed — skipping\n")

    if missing:
        print(f"⚠  Missing clips (rename and re-run): {', '.join(missing)}\n")

    if len(labeled_files) == 0:
        print("No labeled clips to stitch. Exiting.")
        sys.exit(1)

    print(f"[3/3] Stitching {len(labeled_files)} clips → {MASTER_OUTPUT}")
    ok = stitch_clips(labeled_files, MASTER_OUTPUT)
    if ok:
        print(f"      ✓ Master video ready: {MASTER_OUTPUT}")
    else:
        print(f"      ✗ Stitch failed — check labeled clips individually")

    print("\n── Done ──\n")


if __name__ == "__main__":
    main()
