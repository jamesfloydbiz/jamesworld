#!/usr/bin/env python3
"""Turn the raw notebook scans into web images.

public/poems/ holds what came off the scanner and the phone: mostly single-page
PDFs at print resolution, plus photographs of the open notebook. A browser
can't show a PDF in an <img>, and the photos are ~800KB each and lying on their
side, so both get re-rendered here into public/poems/web/.

Two sizes per page, because the grid shows a hundred-odd of these at ~220px
while the full-size one is only needed once a card is opened:

    web/098-1.jpg         1000px wide
    web/098-1-thumb.jpg    360px wide

Naming is by poem number and page ("Poem 098 - What is a King (page 2).jpg" ->
098-2), so the baker can find a poem's pages without re-parsing titles.

Only poems present in content/poems/ are converted — a scan of something held
back never ships.

This runs on a Mac (sips rasterises the PDFs) and its output is committed,
because the GitHub Actions build runs on Ubuntu and cannot regenerate it.

    python3 scripts/prepare-poem-scans.py
"""

import os
import re
import subprocess
import sys
import tempfile
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'poems')
OUT = os.path.join(SRC, 'web')
TEXTS = os.path.join(ROOT, 'content', 'poems')

WIDTH, QUALITY = 1000, 68
THUMB_WIDTH, THUMB_QUALITY = 360, 58

NAME = re.compile(r'^Poem (\d{3}) - (.+)\.(pdf|jpe?g|png)$', re.I)
PAGE = re.compile(r'\(page (\d+)\)', re.I)


def rasterise(path):
    """PDF -> PIL image, via sips. PIL has no PDF reader without ghostscript."""
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, 'page.png')
        subprocess.run(
            ['sips', '-s', 'format', 'png', '--resampleWidth', str(WIDTH * 2),
             path, '--out', png],
            capture_output=True,
        )
        if not os.path.exists(png):
            return None
        im = Image.open(png)
        im.load()
        return im


def load(path):
    if path.lower().endswith('.pdf'):
        return rasterise(path)

    im = Image.open(path)
    exif_rot = im.getexif().get(274)
    im = ImageOps.exif_transpose(im)
    # The notebook photos carry orientation 6, which lands them a further
    # quarter-turn off: the page reads bottom-to-top once the tag is honoured.
    # Verified against the rendered pages, not inferred from the tag alone.
    if exif_rot == 6:
        im = im.rotate(90, expand=True)
        # Paper photographed under room light comes out grey and warm. Pull the
        # white point back up so the ink reads; the cutoff keeps it off the
        # extremes so nothing on the page is crushed away.
        im = ImageOps.autocontrast(im.convert('RGB'), cutoff=(0.4, 1.5))
    return im


def flatten(im):
    """A rasterised PDF page has no background of its own. Dropping the alpha
    channel straight to RGB composites the ink onto black; the page has to be
    laid on white first."""
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        rgba = im.convert('RGBA')
        white = Image.new('RGBA', rgba.size, (255, 255, 255, 255))
        return Image.alpha_composite(white, rgba).convert('RGB')
    return im.convert('RGB')


def save(im, dest, width, quality):
    out = flatten(im)
    if out.width > width:
        out = out.resize((width, round(out.height * width / out.width)), Image.LANCZOS)
    out.save(dest, 'JPEG', quality=quality, optimize=True, progressive=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    published = {f[5:8] for f in os.listdir(TEXTS) if f.endswith('.txt')}

    made = kept = 0
    failed = []

    for file in sorted(os.listdir(SRC)):
        m = NAME.match(file)
        if not m or m.group(1) not in published:
            continue
        num = m.group(1)
        page = (PAGE.search(file) or [None, '1'])[1]
        src = os.path.join(SRC, file)
        dest = os.path.join(OUT, f'{num}-{page}.jpg')
        thumb = os.path.join(OUT, f'{num}-{page}-thumb.jpg')

        def current(p):
            return os.path.exists(p) and os.path.getmtime(p) >= os.path.getmtime(src)

        if current(dest) and current(thumb):
            kept += 1
            continue

        im = load(src)
        if im is None:
            failed.append(file)
            continue
        save(im, dest, WIDTH, QUALITY)
        save(im, thumb, THUMB_WIDTH, THUMB_QUALITY)
        made += 1

    # A poem pulled back out of content/poems/ must not leave its picture
    # behind in web/, or the page would still be able to serve it.
    live = set()
    for file in os.listdir(SRC):
        m = NAME.match(file)
        if m and m.group(1) in published:
            page = (PAGE.search(file) or [None, '1'])[1]
            live.add(f'{m.group(1)}-{page}')
    dropped = 0
    for f in os.listdir(OUT):
        key = re.sub(r'(-thumb)?\.jpg$', '', f)
        if f.endswith('.jpg') and key not in live:
            os.remove(os.path.join(OUT, f))
            dropped += 1

    print(f'poem scans: {made} converted, {kept} already current, '
          f'{dropped} removed, {len(failed)} failed')
    for f in failed:
        print(f'  x {f}', file=sys.stderr)
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
