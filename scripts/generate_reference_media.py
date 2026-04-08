from __future__ import annotations

import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "reference"
WIDTH = 512
FPS = 30
DURATION_SECONDS = 1
FONT_PATHS = [
    Path("/Library/Fonts/SF-Compact-Display-Heavy.otf"),
    Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
]
RATIOS = [
    ("9:16", 9, 16),
    ("3:4", 3, 4),
    ("1:1", 1, 1),
    ("4:3", 4, 3),
    ("16:9", 16, 9),
]


def nearest_even(value: float) -> int:
    rounded = int(round(value))
    if rounded % 2 == 0:
        return rounded
    lower = rounded - 1
    upper = rounded + 1
    if abs(lower - value) <= abs(upper - value):
        return lower
    return upper


def resolve_font_path() -> Path:
    for path in FONT_PATHS:
        if path.exists():
            return path
    raise FileNotFoundError("No usable font file was found.")


def fit_font(text: str, width: int, height: int, font_path: Path) -> ImageFont.FreeTypeFont:
    draw = ImageDraw.Draw(Image.new("RGB", (width, height)))
    best_font: ImageFont.FreeTypeFont | None = None

    for size in range(min(width, height), 10, -2):
        font = ImageFont.truetype(str(font_path), size=size)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        if text_width <= width * 0.76 and text_height <= height * 0.28:
            best_font = font
            break

    if best_font is None:
        raise RuntimeError(f"Failed to fit text for {text}.")
    return best_font


def render_image(label: str, width: int, height: int, font_path: Path) -> Path:
    image = Image.new("RGB", (width, height), "black")
    draw = ImageDraw.Draw(image)
    font = fit_font(label, width, height, font_path)
    bbox = draw.textbbox((0, 0), label, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) / 2 - bbox[0]
    y = (height - text_height) / 2 - bbox[1]
    draw.text((x, y), label, font=font, fill="white")

    filename = label.replace(":", "x")
    output_path = OUTPUT_DIR / f"{filename}.png"
    image.save(output_path)
    return output_path


def render_video(image_path: Path) -> Path:
    video_path = image_path.with_suffix(".mp4")
    cmd = [
        "ffmpeg",
        "-y",
        "-loop",
        "1",
        "-framerate",
        str(FPS),
        "-i",
        str(image_path),
        "-t",
        str(DURATION_SECONDS),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        str(video_path),
    ]
    subprocess.run(cmd, check=True)
    return video_path


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    font_path = resolve_font_path()

    for label, width_ratio, height_ratio in RATIOS:
        height = nearest_even(WIDTH * height_ratio / width_ratio)
        image_path = render_image(label, WIDTH, height, font_path)
        video_path = render_video(image_path)
        print(f"{image_path.relative_to(ROOT)} -> {WIDTH}x{height}")
        print(f"{video_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
