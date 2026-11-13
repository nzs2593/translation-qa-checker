from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "chrome-extension" / "icons"
OUT.mkdir(parents=True, exist_ok=True)
FONT = Path("C:/Windows/Fonts/segoeuib.ttf")

for size in (16, 32, 48, 128):
    scale = 4
    canvas_size = size * scale
    image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    margin = round(size * .125 * scale)
    radius = round(size * .22 * scale)
    draw.rounded_rectangle(
        (margin, margin, canvas_size - margin - 1, canvas_size - margin - 1),
        radius=radius,
        fill="#175CD3",
    )
    font = ImageFont.truetype(str(FONT), round(size * .56 * scale))
    draw.text(
        (canvas_size / 2, canvas_size / 2 - size * .02 * scale),
        "C",
        font=font,
        anchor="mm",
        fill="white",
        stroke_width=0,
    )
    image.resize((size, size), Image.Resampling.LANCZOS).save(OUT / f"icon-{size}.png")
