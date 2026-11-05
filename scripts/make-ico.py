"""Packs frontend/public/favicon.ico from the 16 and 32px PNGs.

Run after scripts/render-icons.js. Needs Pillow (`pip install pillow`).
"""
from pathlib import Path

from PIL import Image

public = Path(__file__).resolve().parent.parent / "frontend" / "public"
small = Image.open(public / "favicon-16x16.png").convert("RGBA")
large = Image.open(public / "favicon-32x32.png").convert("RGBA")
large.save(public / "favicon.ico", format="ICO", append_images=[small], sizes=[(32, 32), (16, 16)])
print("wrote favicon.ico")
