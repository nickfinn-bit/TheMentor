# Generates the share image and the icon set from the existing logo files.
#
#   python tools/build-brand-assets.py
#
# Outputs:
#   images/og-image.png              1200x630 link-preview card
#   images/icons/favicon-16.png      browser tab
#   images/icons/favicon-32.png      browser tab, 2x
#   images/icons/favicon-180.png     iOS home screen (apple-touch-icon)
#   images/icons/favicon-192.png     Android / web app manifest
#   images/icons/favicon-512.png     web app manifest
#
# Sources are left untouched.

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MARK = os.path.join(ROOT, 'images', 'icons', 'the-insight-mentor-logo.png')
WORDMARK = os.path.join(ROOT, 'images', 'icons', 'the-insight-mentor-logo-name.png')

MAROON = (126, 22, 51)
PAPER = (250, 248, 247)
INK = (28, 23, 25)

SERIF_CANDIDATES = [
    r'C:\Windows\Fonts\georgia.ttf',
    r'C:\Windows\Fonts\times.ttf',
    r'C:\Windows\Fonts\constan.ttf',
]


def serif(size):
    for path in SERIF_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def trim_alpha(im):
    """Crop away fully transparent margins so the mark fills its box."""
    im = im.convert('RGBA')
    box = im.split()[-1].getbbox()
    return im.crop(box) if box else im


def build_og():
    W, H = 1200, 630
    MARGIN_X = 88
    card = Image.new('RGB', (W, H), PAPER)
    draw = ImageDraw.Draw(card)

    # A maroon band down the left edge — the same device the site uses for
    # the founder blockquote and the section rules.
    draw.rectangle([0, 0, 14, H], fill=MAROON)

    word = trim_alpha(Image.open(WORDMARK))
    target_w = 470
    word = word.resize(
        (target_w, round(word.height * target_w / word.width)), Image.LANCZOS)

    tagline = 'University admissions consulting'
    subline = 'for students aiming at the best universities in the world'
    url = 'theunimentor.com'

    f_tag, f_sub, f_url = serif(38), serif(25), serif(24)

    def line_height(text, font):
        box = draw.textbbox((0, 0), text, font=font)
        return box[3] - box[1], box[1]

    tag_h, tag_off = line_height(tagline, f_tag)
    sub_h, sub_off = line_height(subline, f_sub)
    url_h, url_off = line_height(url, f_url)

    GAP_WORD_TAG = 54
    GAP_TAG_SUB = 22
    GAP_SUB_RULE = 46
    GAP_RULE_URL = 20

    block_h = (word.height + GAP_WORD_TAG + tag_h + GAP_TAG_SUB + sub_h
               + GAP_SUB_RULE + 3 + GAP_RULE_URL + url_h)
    y = (H - block_h) // 2

    card.paste(word, (MARGIN_X, y), word)
    y += word.height + GAP_WORD_TAG

    draw.text((MARGIN_X, y - tag_off), tagline, font=f_tag, fill=INK)
    y += tag_h + GAP_TAG_SUB

    draw.text((MARGIN_X, y - sub_off), subline, font=f_sub, fill=(110, 97, 103))
    y += sub_h + GAP_SUB_RULE

    draw.rectangle([MARGIN_X, y, MARGIN_X + 210, y + 2], fill=MAROON)
    y += 3 + GAP_RULE_URL

    draw.text((MARGIN_X, y - url_off), url, font=f_url, fill=MAROON)

    out = os.path.join(ROOT, 'images', 'og-image.png')
    card.save(out, 'PNG', optimize=True)
    print('%-44s %dx%d  %dKB' % ('images/og-image.png', W, H,
                                 os.path.getsize(out) // 1024))


def build_icons():
    mark = trim_alpha(Image.open(MARK))

    # Square canvas with even padding, so the mark is not clipped by the
    # circular masks iOS and Android apply.
    side = max(mark.size)
    pad = round(side * 0.10)
    canvas = Image.new('RGBA', (side + 2 * pad, side + 2 * pad), (0, 0, 0, 0))
    canvas.paste(mark,
                 (pad + (side - mark.width) // 2,
                  pad + (side - mark.height) // 2),
                 mark)

    for size in (16, 32, 180, 192, 512):
        icon = canvas.resize((size, size), Image.LANCZOS)
        if size == 180:
            # Apple does not composite alpha; give it a solid ground.
            solid = Image.new('RGB', (size, size), PAPER)
            solid.paste(icon, (0, 0), icon)
            icon = solid
        out = os.path.join(ROOT, 'images', 'icons', 'favicon-%d.png' % size)
        icon.save(out, 'PNG', optimize=True)
        print('%-44s %dx%d  %dKB' % (
            'images/icons/favicon-%d.png' % size, size, size,
            max(1, os.path.getsize(out) // 1024)))


if __name__ == '__main__':
    build_og()
    build_icons()
