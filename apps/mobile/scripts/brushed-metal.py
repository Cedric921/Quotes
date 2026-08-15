#!/usr/bin/env python3
"""
Draws the brushed-metal textures the v2 `base` surface is made of.

  assets/images/brushed-silver.png       the ground under every base screen
  assets/images/brushed-silver-card.png  the fill of cards, rows and options

Diffuse, not directional: several soft highlights blended into the silver,
the way light pools on a sheet of aluminium, over a fine diagonal grain.
A single left-to-right gradient read as a lit slab; the client wanted the
mixed, mottled look of the reference. Deterministic — same seed, same file.

    python3 scripts/brushed-metal.py
"""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageFilter

# Palette (see src/theme/tokens.ts): silver300 · silver100 · white
DARK = np.array([0xD3, 0xDA, 0xE3], dtype=np.float32)
SILVER = np.array([0xE6, 0xEA, 0xEF], dtype=np.float32)
WHITE = np.array([0xFF, 0xFF, 0xFF], dtype=np.float32)


def pools(w: int, h: int, spots: list[tuple[float, float, float, float]], rng) -> np.ndarray:
    """
    Soft elliptical pools, each (cx, cy, radius, strength) in 0–1 units.
    Positive strength is a reflection, negative a shadowed band; they
    overlap, which is what makes the sheet read as mixed rather than lit
    from one side.
    """
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    x /= w
    y /= h
    light = np.zeros((h, w), dtype=np.float32)
    for cx, cy, r, k in spots:
        # A slight tilt per pool so no two reflections share an axis.
        a = rng.uniform(-0.6, 0.6)
        dx, dy = x - cx, y - cy
        u = dx * np.cos(a) - dy * np.sin(a)
        v = dx * np.sin(a) + dy * np.cos(a)
        d2 = (u / r) ** 2 + (v / (r * 1.6)) ** 2
        light += k * np.exp(-d2 * 2.2)
    return np.clip(light, -1, 1)


def grain(w: int, h: int, rng, strength: float) -> np.ndarray:
    """Fine diagonal brushing: 1-D noise stretched along a 30° line."""
    n = rng.normal(0, 1, h + w).astype(np.float32)
    y, x = np.mgrid[0:h, 0:w]
    idx = ((x * 0.5 + y * 0.87)).astype(np.int64) % (h + w)
    g = n[idx]
    g = (g - g.min()) / (g.max() - g.min()) - 0.5
    return g * strength


def render(w: int, h: int, spots, seed: int, grain_strength: float, base_mix: float) -> Image.Image:
    rng = np.random.default_rng(seed)
    light = pools(w, h, spots, rng)
    base = SILVER + (WHITE - SILVER) * base_mix
    lit = np.maximum(light, 0)[..., None]
    shaded = np.maximum(-light, 0)[..., None]
    rgb = base[None, None, :] + (WHITE - base) * lit + (DARK - base) * shaded
    rgb += grain(w, h, rng, grain_strength)[..., None] * 255
    img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    return img.filter(ImageFilter.GaussianBlur(0.8))


if __name__ == "__main__":
    # Ground: a phone-shaped sheet with reflections top-left, mid-right,
    # low-left and at the foot — the reference's four light pools.
    ground = render(
        640, 1280,
        spots=[
            (0.12, 0.06, 0.42, 0.90),
            (0.98, 0.40, 0.38, 0.85),
            (0.05, 0.66, 0.30, 0.60),
            (0.78, 0.97, 0.42, 0.90),
            (0.55, 0.26, 0.40, -0.55),
            (0.35, 0.50, 0.45, -0.60),
            (0.92, 0.72, 0.30, -0.45),
            (0.20, 0.88, 0.30, -0.40),
        ],
        seed=7, grain_strength=0.022, base_mix=0.10,
    )
    ground.save("assets/images/brushed-silver.png", optimize=True)

    # Card: wide and short, lighter overall, with two pools so a row reads
    # as a lit strip of the same metal rather than a flat white pill.
    card = render(
        900, 300,
        spots=[
            (0.10, 0.20, 0.38, 0.95),
            (0.85, 0.85, 0.40, 0.85),
            (0.50, 0.55, 0.35, -0.45),
            (0.70, 0.10, 0.25, -0.30),
        ],
        seed=11, grain_strength=0.018, base_mix=0.40,
    )
    card.save("assets/images/brushed-silver-card.png", optimize=True)
    print("wrote brushed-silver.png and brushed-silver-card.png")
