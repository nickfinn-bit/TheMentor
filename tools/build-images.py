# Generates responsive, compressed derivatives of the photography in images/
# into images/opt/. Nothing here is destructive: the originals are left exactly
# as they are and stay in the markup as the <picture> fallback.
#
#   python tools/build-images.py
#
# Requires Pillow (`pip install pillow`). Re-run it whenever a source image
# changes; existing outputs are overwritten.

import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'opt')

# source path -> widths to emit. The widths are chosen from how large the image
# ever renders on screen, doubled for high-density displays.
JOBS = {
    # Hero. Full-bleed, so it needs the large end of the ladder. It is also the
    # illustration on one blog post, which is why it carries the card widths as
    # well — every article image must exist at 640/1024/1600.
    'images/home-image.jpg':        [640, 1024, 1600, 2560],

    # Service slides and article heroes: half a 1200px container at most.
    'images/test-preparation-image.jpg': [640, 1024, 1600],
    'images/tutoring-image.jpg':         [640, 1024, 1600],
    'images/admissions-image.jpg':       [640, 1024, 1600],
    'images/admissions-image-2.jpg':     [640, 1024, 1600],
    'images/planning-image.jpg':         [640, 1024, 1600],

    # Team portraits: rendered at 120px round, or 220px in the institutional
    # layout. 480 covers both at 2x.
    'images/tutor-images/tutor-picture-george.jpg':    [240, 480],
    'images/tutor-images/tutor-picture-nick.png':      [240, 480],
    'images/tutor-images/tutor-picture-example-2.jpg': [240, 480],

    # Wordmark. Transparent, so it stays PNG/WebP rather than JPEG.
    'images/icons/the-insight-mentor-logo-name.png': [300, 600],
}

# Images whose transparency must survive; emitted as PNG rather than JPEG.
KEEP_ALPHA = {'images/icons/the-insight-mentor-logo-name.png',
              'images/tutor-images/tutor-picture-nick.png'}

QUALITY_JPEG = 78
QUALITY_WEBP = 76


def flatten(im):
    """Composite RGBA onto white so JPEG output does not turn alpha black."""
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert('RGB')


def main():
    os.makedirs(OUT, exist_ok=True)
    total_in = total_out = 0

    for rel, widths in JOBS.items():
        src = os.path.join(ROOT, rel.replace('/', os.sep))
        if not os.path.exists(src):
            print('missing, skipped:', rel)
            continue

        stem = os.path.splitext(os.path.basename(rel))[0]
        with Image.open(src) as im:
            im.load()
            # Honour the EXIF orientation flag before resizing.
            try:
                from PIL import ImageOps
                im = ImageOps.exif_transpose(im)
            except Exception:
                pass

            source_w = im.width
            total_in += os.path.getsize(src)

            for w in widths:
                if w > source_w:
                    continue
                h = round(im.height * w / source_w)
                resized = im.resize((w, h), Image.LANCZOS)

                webp_path = os.path.join(OUT, '%s-%d.webp' % (stem, w))
                resized.save(webp_path, 'WEBP', quality=QUALITY_WEBP, method=6)
                total_out += os.path.getsize(webp_path)

                if rel in KEEP_ALPHA:
                    fallback = os.path.join(OUT, '%s-%d.png' % (stem, w))
                    resized.convert('RGBA').save(fallback, 'PNG', optimize=True)
                else:
                    fallback = os.path.join(OUT, '%s-%d.jpg' % (stem, w))
                    flatten(resized).save(
                        fallback, 'JPEG', quality=QUALITY_JPEG,
                        optimize=True, progressive=True)
                total_out += os.path.getsize(fallback)

                print('%-46s %5dpx  %6dKB' % (
                    os.path.basename(webp_path), w,
                    os.path.getsize(webp_path) // 1024))

    print('\nsources %d KB  ->  all derivatives %d KB'
          % (total_in // 1024, total_out // 1024))


if __name__ == '__main__':
    main()
