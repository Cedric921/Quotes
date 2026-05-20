#!/usr/bin/env python3
"""
Regenerate the iOS / Android app icon so the logo fills ~85% of the canvas.

The original 1200x1200 source had ~47% fill which caused the iOS app icon to
appear visually small after Apple applied its rounded-square mask. This script
detects the visible content via the white-pixel-difference bounding box,
crops to that, and re-centers it on a fresh opaque white canvas at 85% scale.

Usage:
    python3 apps/mobile/scripts/resize-app-icon.py
"""
from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]  # apps/mobile

SOURCES = [
    # (input, output, canvas_size, fill_ratio, background)
    (ROOT / "assets" / "icon.png", ROOT / "assets" / "icon.png", 1024, 0.85, (255, 255, 255, 255)),
    (ROOT / "assets" / "adaptive-icon.png", ROOT / "assets" / "adaptive-icon.png", 1024, 0.72, (255, 255, 255, 0)),
    (ROOT / "assets" / "images" / "app-icon-all.png", ROOT / "assets" / "images" / "app-icon-all.png", 1024, 0.85, (255, 255, 255, 255)),
    (ROOT / "assets" / "images" / "app-icon-android-legacy.png", ROOT / "assets" / "images" / "app-icon-android-legacy.png", 1024, 0.85, (255, 255, 255, 255)),
    (ROOT / "assets" / "images" / "app-icon-android-adaptive-foreground.png", ROOT / "assets" / "images" / "app-icon-android-adaptive-foreground.png", 1024, 0.72, (255, 255, 255, 0)),
]


def content_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    """Return the bounding box of non-white / non-transparent pixels."""
    rgba = img.convert("RGBA")
    # First trim by alpha if any pixel is transparent
    alpha_bbox = rgba.split()[-1].getbbox()
    # Composite onto white then diff against pure white to find visible content
    white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    composed = Image.alpha_composite(white, rgba).convert("RGB")
    diff = ImageChops.difference(composed, Image.new("RGB", rgba.size, (255, 255, 255)))
    white_bbox = diff.getbbox()
    # Use the tighter of the two bboxes
    if alpha_bbox is None:
        return white_bbox
    if white_bbox is None:
        return alpha_bbox
    return (
        max(alpha_bbox[0], white_bbox[0]),
        max(alpha_bbox[1], white_bbox[1]),
        min(alpha_bbox[2], white_bbox[2]),
        min(alpha_bbox[3], white_bbox[3]),
    )


def regenerate(src: Path, dst: Path, size: int, fill: float, bg: tuple[int, int, int, int]) -> None:
    if not src.exists():
        print(f"[skip] {src} (not found)")
        return

    img = Image.open(src).convert("RGBA")
    bbox = content_bbox(img)
    if bbox is None:
        print(f"[skip] {src} (no visible content)")
        return

    cropped = img.crop(bbox)
    # Make the crop square (longest side wins) on a transparent canvas to
    # preserve aspect ratio when we paste onto the final canvas.
    cw, ch = cropped.size
    side = max(cw, ch)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(cropped, ((side - cw) // 2, (side - ch) // 2), cropped)

    # Scale to the target fill ratio of the final canvas
    target_logo = int(size * fill)
    square = square.resize((target_logo, target_logo), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), bg)
    offset = (size - target_logo) // 2
    canvas.paste(square, (offset, offset), square)

    backup = src.with_suffix(src.suffix + ".bak")
    if not backup.exists():
        src.rename(backup)
        print(f"[backup] {src.name} -> {backup.name}")
    canvas.save(dst, format="PNG", optimize=True)
    print(f"[ok] {dst} ({size}x{size}, fill={fill:.0%}, bg_alpha={bg[3]})")


def main() -> int:
    for src, dst, size, fill, bg in SOURCES:
        regenerate(src, dst, size, fill, bg)
    return 0


if __name__ == "__main__":
    sys.exit(main())
