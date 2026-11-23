from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = Path("/Users/alexanderokonkwo/Desktop/CPP_Stacked_2C_Green_RGB-500px.png")
OUTPUT_PATH = ROOT / "output" / "previews" / "name-card-front-proposal.png"

WIDTH = 2200
HEIGHT = 850

CPP_GREEN = "#005030"
CPP_GOLD = "#FFB71B"
BLACK = "#111111"
BACKGROUND = "#F8FAF7"
MUTED = "#41544C"

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"


def fit_logo(path: Path, max_width: int, max_height: int) -> Image.Image:
    logo = Image.open(path).convert("RGBA")
    logo.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    return logo


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    image = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle(
        (28, 28, WIDTH - 28, HEIGHT - 28),
        radius=46,
        fill=BACKGROUND,
        outline=CPP_GREEN,
        width=6,
    )

    logo = fit_logo(LOGO_PATH, max_width=350, max_height=450)
    logo_x = 350 - logo.width // 2
    logo_y = HEIGHT // 2 - logo.height // 2
    image.paste(logo, (logo_x, logo_y), logo)

    divider_x = 720
    draw.rounded_rectangle(
        (divider_x, 170, divider_x + 10, HEIGHT - 170),
        radius=5,
        fill=CPP_GOLD,
    )

    content_center_x = (divider_x + WIDTH - 28) // 2
    name_font = ImageFont.truetype(FONT_BOLD, 100)
    subtitle_font = ImageFont.truetype(FONT_BOLD, 31)

    draw.text(
        (content_center_x, 382),
        "Alexander Okonkwo",
        font=name_font,
        fill=BLACK,
        anchor="mm",
    )

    draw.rounded_rectangle(
        (content_center_x - 115, 490, content_center_x + 115, 499),
        radius=4,
        fill=CPP_GOLD,
    )

    draw.text(
        (content_center_x, 570),
        "2026 CPP Summer Bridge Program",
        font=subtitle_font,
        fill=MUTED,
        anchor="mm",
    )


    image.save(OUTPUT_PATH, quality=95)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
