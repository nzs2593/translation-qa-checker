from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "chrome-extension" / "icons"
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / "assets" / "QAform-01.png"
source = Image.open(SOURCE).convert("RGBA")

for size in (16, 32, 48, 128):
    # Keep the approved artwork intact; Chrome's store icon needs 16 px padding.
    margin = size // 8 if size == 128 else 0
    artwork_size = size - 2 * margin
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    image.alpha_composite(source.resize((artwork_size, artwork_size), Image.Resampling.LANCZOS), (margin, margin))
    image.save(OUT / f"icon-{size}.png")
