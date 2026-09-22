#!/usr/bin/env python3
"""
Moves the profile illustrations from the pink–violet accent to the sky one
(sky blue → indigo). See src/theme/tokens.ts, `palette.sky`.

The drawings are third-party art tinted in the reference app's accent.
Rather than redraw them, every saturated pixel whose hue sits in the
violet-to-pink arc (255° through 360° and on to 35°) is turned toward
indigo (240°) and, for the pinks, sky blue (197°); ink outlines and anything
mint or yellow are left alone. Run it on the originals: a second run finds
nothing left in the arc, so it cannot be re-tuned without
`git checkout -- assets/illustrations/profile` first.

    python3 scripts/recolor-illustrations.py
"""
from __future__ import annotations

import glob
import os

import numpy as np
from PIL import Image

ARC_START = 255.0  # violet
ARC_END = 35.0     # past red, into orange
ARC_LEN = (360.0 - ARC_START) + ARC_END


def recolor(path: str) -> int:
    im = Image.open(path).convert("RGBA")
    rgba = np.array(im)
    hsv = np.array(im.convert("RGB").convert("HSV")).astype(np.float32)
    h = hsv[..., 0] * 360.0 / 255.0
    s = hsv[..., 1] / 255.0
    v = hsv[..., 2] / 255.0
    alpha = rgba[..., 3]

    in_arc = ((h >= ARC_START) | (h < ARC_END)) & (s > 0.06) & (alpha > 0)
    if not in_arc.any():
        return 0

    t = ((h - ARC_START) % 360.0) / ARC_LEN  # 0 at violet, 1 at orange
    new_h = 240.0 - 43.0 * t                  # indigo → sky blue
    new_s = s                                 # sky keeps the pinks' saturation

    h2 = np.where(in_arc, new_h, h)
    s2 = np.where(in_arc, new_s, s)
    out = np.stack([h2 * 255.0 / 360.0, s2 * 255.0, v * 255.0], axis=-1)
    rgb = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "HSV").convert("RGB")
    result = np.dstack([np.array(rgb), alpha])
    Image.fromarray(result, "RGBA").save(path, optimize=True)
    return int(in_arc.sum())


if __name__ == "__main__":
    for path in sorted(glob.glob("assets/illustrations/profile/*.png")):
        changed = recolor(path)
        print(f"{os.path.basename(path)}: {changed} px")
