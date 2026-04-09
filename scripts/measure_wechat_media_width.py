#!/usr/bin/env /usr/local/bin/python3
from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


KNOWN_RATIO_LABELS = ("9:16", "3:4", "1:1", "4:3", "16:9")


@dataclass(frozen=True)
class MediaCard:
    x: int
    y: int
    w: int
    h: int
    area: int
    occupancy: float

    @property
    def aspect(self) -> float:
        return self.w / self.h


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Measure WeChat image/video message width as a ratio of the chat window width "
            "from a screenshot."
        )
    )
    parser.add_argument(
        "--image",
        type=Path,
        default=Path("reference/长图拼接.JPEG"),
        help="Screenshot path used for measurement.",
    )
    parser.add_argument(
        "--ratios",
        nargs="*",
        default=list(KNOWN_RATIO_LABELS),
        help="Aspect ratios to estimate, e.g. 9:16 1:1 16:9.",
    )
    parser.add_argument(
        "--dark-threshold",
        type=int,
        default=40,
        help="RGB threshold used to detect black media cards.",
    )
    return parser.parse_args()


def load_rgb(image_path: Path) -> np.ndarray:
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")
    return np.array(Image.open(image_path).convert("RGB"))


def detect_chat_window_bounds(rgb: np.ndarray) -> tuple[int, int]:
    gray = rgb.mean(axis=2)
    non_black_fraction = (gray > 8).mean(axis=0)
    active_cols = np.where(non_black_fraction > 0.02)[0]
    if active_cols.size == 0:
        return 0, rgb.shape[1] - 1
    return int(active_cols[0]), int(active_cols[-1])


def detect_media_cards(
    rgb: np.ndarray,
    chat_width: int,
    dark_threshold: int,
) -> list[MediaCard]:
    mask = (
        (rgb[:, :, 0] < dark_threshold)
        & (rgb[:, :, 1] < dark_threshold)
        & (rgb[:, :, 2] < dark_threshold)
    ).astype(np.uint8)

    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    count, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)

    cards: list[MediaCard] = []
    for component_id in range(1, count):
        x, y, w, h, area = stats[component_id]
        if w < chat_width * 0.15:
            continue
        if h < chat_width * 0.08:
            continue

        aspect = w / h
        if not (0.45 <= aspect <= 2.1):
            continue

        occupancy = area / (w * h)
        if occupancy < 0.83:
            continue

        cards.append(MediaCard(int(x), int(y), int(w), int(h), int(area), float(occupancy)))

    cards.sort(key=lambda card: card.y)
    return cards


def parse_ratio(value: str) -> float:
    text = value.strip()
    if ":" in text:
        left, right = text.split(":", 1)
        return float(left) / float(right)
    return float(text)


def fit_width_rule(
    cards: list[MediaCard], chat_width: int
) -> tuple[float, float, float, float, float]:
    if not cards:
        raise RuntimeError("No media cards detected, cannot fit width rule.")

    aspects = np.array([card.aspect for card in cards], dtype=float)
    widths = np.array([card.w / chat_width for card in cards], dtype=float)

    square_index = int(np.argmin(np.abs(aspects - 1.0)))
    square_width = float(widths[square_index])
    max_width = float(widths.max())
    min_width = float(widths.min())

    portrait_candidates = [(a, w) for a, w in zip(aspects, widths) if a < 1.0]
    landscape_candidates = [(a, w) for a, w in zip(aspects, widths) if a > 1.0]

    low_knee = max((a for a, w in portrait_candidates if w >= square_width - 0.003), default=0.75)
    high_knee = min((a for a, w in landscape_candidates if w >= max_width - 0.003), default=4 / 3)

    return min_width, square_width, max_width, max(low_knee, 0.01), max(high_knee, 0.01)


def estimate_width_ratio(
    aspect: float,
    min_width: float,
    square_width: float,
    max_width: float,
    low_knee: float,
    high_knee: float,
) -> float:
    tolerance = 0.015
    if aspect <= low_knee:
        return float(max(min_width, min(max_width * aspect, square_width)))
    if aspect < high_knee - tolerance:
        return float(square_width)
    return float(max_width)


def guess_label(aspect: float) -> str:
    options = [(label, parse_ratio(label)) for label in KNOWN_RATIO_LABELS]
    return min(options, key=lambda item: abs(item[1] - aspect))[0]


def main() -> None:
    args = parse_args()
    rgb = load_rgb(args.image)
    left, right = detect_chat_window_bounds(rgb)
    chat_width = right - left + 1

    cards = detect_media_cards(rgb, chat_width=chat_width, dark_threshold=args.dark_threshold)
    if not cards:
        raise RuntimeError("No media cards detected. Try increasing --dark-threshold.")

    min_width, square_width, max_width, low_knee, high_knee = fit_width_rule(cards, chat_width)

    print(f"image={args.image}")
    print(f"chat_window_width_px={chat_width} (x-range: {left}..{right})")
    print("")
    print("Measured cards from screenshot:")
    print("label  aspect(w/h)  width_ratio(chat)  bbox(w x h)")
    for card in cards:
        label = guess_label(card.aspect)
        width_ratio = card.w / chat_width
        print(
            f"{label:>5}  {card.aspect:>11.4f}  {width_ratio:>17.4f}  "
            f"{card.w:>4} x {card.h:<4}"
        )

    print("")
    print("Fitted width rule (ratio of chat width):")
    print(f"min_width={min_width:.4f}, square_width={square_width:.4f}, max_width={max_width:.4f}")
    print(f"low_knee_aspect={low_knee:.4f}, high_knee_aspect={high_knee:.4f}")
    print("")
    print("Estimated width ratio by requested aspect:")
    print("input_ratio  aspect(w/h)  estimated_width_ratio(chat)")
    for ratio_text in args.ratios:
        aspect = parse_ratio(ratio_text)
        estimated = estimate_width_ratio(
            aspect=aspect,
            min_width=min_width,
            square_width=square_width,
            max_width=max_width,
            low_knee=low_knee,
            high_knee=high_knee,
        )
        print(f"{ratio_text:>10}  {aspect:>11.4f}  {estimated:>27.4f}")


if __name__ == "__main__":
    main()
