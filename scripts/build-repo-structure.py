# Draws REPO-STRUCTURE.png at the repository root: every top-level folder and
# file, what goes in each, and every folder one level down.
#
#   python scripts/build-repo-structure.py
#
# Requires matplotlib (`pip install matplotlib`). No page loads this file; it
# sits in scripts/ because every repository keeps its structure script there.
#
# The tree is git's view of the repository: `git ls-files` plus untracked files
# that are not ignored, leaving out .git, node_modules and caches. Gitignored
# root entries are listed in the footer. The picture is always drawn; the
# script then exits 1 if any top-level entry has no line in FOLDERS or FILES.
# Add the line, redraw, and commit the picture with the change.
#
# Everything pushed to main is published on theunimentor.com, this script and
# the picture included, so nothing below may name anything private.

import subprocess
import sys
import textwrap
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyBboxPatch  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'REPO-STRUCTURE.png'
SKIP = {'.git', 'node_modules', '__pycache__', '.pytest_cache', '.mypy_cache',
        '.ruff_cache', '.cache'}

# Top-level folders, in the order they are drawn.
FOLDERS = {
    'data': "The site's content as JavaScript arrays the pages render: the blog "
            "articles (blogInfo.js; a new post is one entry there, not a new "
            "page), the student results, the services offered and the tutors",
    'images': "Every picture the pages show: photography, logos and icons. A new "
              "photo goes here; tools/build-images.py then makes its resized "
              "copies in opt/",
    'scripts': "The JavaScript the pages load: the header, mobile menu and contact "
               "pop-ups on every page; the home page's cards, slideshow and FAQ; "
               "the blog list and article page; <picture> markup for photos. Also "
               "build-repo-structure.py, which draws this picture",
    'styles': "The CSS: landing-page.css holds the shared tokens, header and "
              "footer; the rest style the home page, slideshow, FAQ, blog and "
              "policy pages",
    'tools': "Python run by hand to regenerate committed files: build-images.py "
             "(images/opt/), build-brand-assets.py (the share image and "
             "favicons), build-sitemap.py (sitemap.xml). robots.txt keeps search "
             "engines out",
    '.claude': "Claude Code's settings for sessions run in this folder "
               "(settings.json)",
}

# Folders one level down. Any not listed here is still drawn, by name only.
SUBFOLDERS = {
    'images/opt': 'resized JPEG, WebP and PNG copies the pages serve, made by '
                  'tools/build-images.py; never edited by hand',
    'images/icons': 'the logo, favicons and interface icons',
    'images/tutor-images': 'tutor portraits, the originals',
    'images/tutee-images': 'student photos for the results cards',
    'images/uni-images': 'university crests for the tutor cards',
    'images/faqimages': "the FAQ's icons and background patterns",
    'tools/design-review': 'the August 2026 design-proposal scaffolding and its '
                           'note, PROPOSALS.md; no page loads them (see its '
                           'README.md)',
}

# Root files, in the order they are drawn.
FILES = {
    'index.html': 'The home page',
    'blog.html': 'The blog index, rendered from data/blogInfo.js',
    'article.html': 'One article, chosen by ?post=<slug>',
    'privacy.html': 'Privacy policy',
    'cookies.html': 'Cookie policy',
    'terms.html': 'Terms',
    'safeguarding.html': 'Safeguarding policy',
    '404.html': 'The page shown for an address that does not exist',
    'CNAME': 'The custom domain, theunimentor.com, for GitHub Pages',
    'robots.txt': 'What search engines may crawl; keeps them out of /tools/',
    'sitemap.xml': 'Every page and article, for search engines; written by '
                   'tools/build-sitemap.py',
    'site.webmanifest': 'Name, colours and icons for browsers and home screens',
    '.gitignore': 'What git leaves out: .env, the local secrets file',
    'REPO-STRUCTURE.png': 'This picture',
}

# Entries that sit at the root but belong elsewhere, and where each would go;
# drawn in amber. Empty since 2026-10-14, when PROPOSALS.md moved to
# tools/design-review/.
LOOSE = {}


def git_paths(*args):
    out = subprocess.run(['git', '-c', 'core.quotepath=off', 'ls-files', '-z', *args],
                         cwd=ROOT, capture_output=True, check=True).stdout
    return [p for p in out.decode('utf-8').split('\0') if p]


def read_tree():
    """Top-level folders (with their sub-folders) and root files, in git's view."""
    folders, files, tracked_top = {}, set(), set()
    for tracked, paths in ((True, git_paths()),
                           (False, git_paths('--others', '--exclude-standard'))):
        for path in paths:
            nested_repo = path.endswith('/')  # an untracked repository inside this one
            parts = path.rstrip('/').split('/')
            if SKIP & set(parts):
                continue
            if tracked:
                tracked_top.add(parts[0])
            if len(parts) == 1 and not nested_repo:
                files.add(parts[0])
                continue
            subs = folders.setdefault(parts[0], set())
            if len(parts) >= 3 or (len(parts) == 2 and nested_repo):
                subs.add(parts[1])
    # The picture names itself, including on the run before its first commit.
    files.add(OUT.name)
    tracked_top.add(OUT.name)
    # Root files that .gitignore names but git still tracks.
    ignored_tracked = {p for p in git_paths('-c', '-i', '--exclude-standard') if '/' not in p}
    # Root entries kept out of git's view by .gitignore or .git/info/exclude.
    ignored = sorted(p for p in git_paths('--others', '--ignored', '--exclude-standard',
                                          '--directory')
                     if '/' not in p.rstrip('/'))
    return folders, files, tracked_top, ignored_tracked, ignored


LINE = 1.4 / 72  # inches per point of font size, one text line


def wrap(text, width_in, size, mono=False):
    return textwrap.wrap(text, max(10, int(width_in * 72 / (size * (0.63 if mono else 0.56)))))


def draw(folders, files, tracked_top, ignored_tracked, ignored, unnamed):
    W, M, GAP, COLS = 18.0, 0.5, 0.25, 3
    card_w = (W - 2 * M - (COLS - 1) * GAP) / COLS
    inner = card_w - 0.3
    INK, MUTED, ACCENT = '#1C1719', '#6E6167', '#7E1633'  # the site's ink and maroon
    WARN, BAD, TAG = '#A15C00', '#D0021B', '#8A7F84'

    def card(name):
        body = wrap(FOLDERS.get(name, 'NOT NAMED: add it to FOLDERS in this script'),
                    inner, 10.5)
        subs = sorted(folders[name], key=str.lower)
        sub_w = (max(len(s) for s in subs) + 2) * 9.5 * 0.63 / 72 if subs else 0
        inside = [(s + '/', wrap(SUBFOLDERS.get(name + '/' + s, ''), inner - sub_w, 9.5))
                  for s in subs]
        loose = wrap('Loose: ' + LOOSE[name], inner, 9.5) if name in LOOSE else []
        h = (0.2 + 13 * LINE + len(body) * 10.5 * LINE
             + (0.1 if inside else 0)
             + sum(max(1, len(lines)) * 9.5 * LINE + 0.03 for _, lines in inside)
             + len(loose) * 9.5 * LINE + 0.15)
        return body, sub_w, inside, loose, h

    order = (sorted((n for n in folders if n not in FOLDERS), key=str.lower)
             + [n for n in FOLDERS if n in folders])
    cols, placed = [0.0] * COLS, []
    for name in order:
        body, sub_w, inside, loose, h = card(name)
        c = cols.index(min(cols))
        placed.append((name, c, cols[c], body, sub_w, inside, loose, h))
        cols[c] += h + GAP
    folders_h = max(cols)

    file_order = list(FILES)
    file_names = sorted(files, key=lambda n: (n in FILES, n in LOOSE,
                                              file_order.index(n) if n in FILES else 0,
                                              n.lower()))
    fcol_w = (W - 2 * M - GAP) / 2
    name_w = max(len(n) for n in file_names) * 10 * 0.66 / 72 + 0.95  # room for the tag
    rows = []
    for name in file_names:
        desc = FILES.get(name, 'NOT NAMED: add it to FILES in this script')
        if name in ignored_tracked:
            desc += '. In .gitignore, but still tracked'
        if name in LOOSE:
            desc += '. Loose: ' + LOOSE[name]
        rows.append((name, wrap(desc, fcol_w - name_w - 0.1, 10)))
    half = (len(rows) + 1) // 2
    files_h = max(sum(0.06 + len(r[1]) * 10 * LINE for r in rows[:half]),
                  sum(0.06 + len(r[1]) * 10 * LINE for r in rows[half:]))

    drawn = set(folders) | files
    others = sorted(p.name + ('/' if p.is_dir() else '') for p in ROOT.iterdir()
                    if p.name not in drawn and p.name + '/' not in ignored
                    and p.name not in ignored and p.name != '.git')
    foot = ('Ignored by git at the root (.gitignore or .git/info/exclude), so not drawn: '
            + (',  '.join(ignored) or 'nothing') + '.')
    if others:
        foot += ('   Also on this disk, holding only caches or nothing git sees: '
                 + ',  '.join(others) + '.')
    foot_lines = wrap(foot + '   .git/ is left out.', W - 2 * M, 9.5)

    head_h, sec_h = 1.25, 0.45
    files_note_h = 0.3
    H = (M + head_h + sec_h + folders_h + sec_h + files_note_h + files_h + 0.6
         + len(foot_lines) * 9.5 * LINE + M)
    fig = plt.figure(figsize=(W, H), dpi=110)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(H, 0)
    ax.axis('off')

    ax.text(M, M, 'TheMentor (theunimentor.com): what goes where', fontsize=22,
            weight='bold', color=INK, va='top')
    ax.text(M, M + 0.5, 'Every top-level folder and file git sees (tracked, or untracked '
            'and not ignored; .git, node_modules and caches left out), what goes in each, '
            'and the folders one level down.', fontsize=11, color=MUTED, va='top')
    ax.text(M, M + 0.78, 'Redraw: python scripts/build-repo-structure.py  (fails while any '
            'top-level entry is unnamed).   Grey tag: not in git.   Amber: loose, and where '
            'it would go.', fontsize=11, color=MUTED, va='top')

    y0 = M + head_h
    ax.text(M, y0, 'Folders', fontsize=15, weight='bold', color=INK, va='top')
    y0 += sec_h
    for name, c, top, body, sub_w, inside, loose, h in placed:
        x, y = M + c * (card_w + GAP), y0 + top
        ax.add_patch(FancyBboxPatch((x, y), card_w, h,
                                    boxstyle='round,pad=0,rounding_size=0.08',
                                    fc='#FAF8F7', ec='#E2D6DA', lw=1))
        ty = y + 0.12
        ax.text(x + 0.15, ty, name + '/', fontsize=13, weight='bold', va='top',
                color=BAD if name in unnamed else ACCENT)
        if name not in tracked_top:
            ax.text(x + card_w - 0.15, ty + 0.02, 'not in git', fontsize=9, color='white',
                    va='top', ha='right',
                    bbox=dict(boxstyle='round,pad=0.2', fc=TAG, ec='none'))
        ty += 13 * LINE + 0.05
        for ln in body:
            ax.text(x + 0.15, ty, ln, fontsize=10.5, va='top',
                    color=BAD if name in unnamed else INK)
            ty += 10.5 * LINE
        if inside:
            ty += 0.1
        for sub, lines in inside:
            ax.text(x + 0.15, ty, sub, fontsize=9.5, color=ACCENT, va='top',
                    family='monospace')
            for ln in lines or ['']:
                ax.text(x + 0.15 + sub_w, ty, ln, fontsize=9.5, color=MUTED, va='top')
                ty += 9.5 * LINE
            ty += 0.03
        for ln in loose:
            ax.text(x + 0.15, ty, ln, fontsize=9.5, color=WARN, va='top', style='italic')
            ty += 9.5 * LINE

    y0 += folders_h + 0.15
    ax.text(M, y0, 'Files at the root', fontsize=15, weight='bold', color=INK, va='top')
    y0 += sec_h
    ax.text(M, y0 - 0.05, 'The pages, and the files browsers, search engines and GitHub '
            'Pages fetch from fixed root addresses, have to stay at the root; so do .gitignore '
            'and this picture.', fontsize=10, color=MUTED, va='top')
    y0 += files_note_h
    for col, chunk in enumerate((rows[:half], rows[half:])):
        x, y = M + col * (fcol_w + GAP), y0
        for name, lines in chunk:
            colour = BAD if name in unnamed else (WARN if name in LOOSE else ACCENT)
            ax.text(x, y, name, fontsize=10, weight='bold', color=colour, va='top')
            if name not in tracked_top:
                ax.text(x + name_w - 0.15, y, 'not in git', fontsize=7.5, color='white',
                        va='top', ha='right',
                        bbox=dict(boxstyle='round,pad=0.15', fc=TAG, ec='none'))
            for ln in lines:
                ax.text(x + name_w, y, ln, fontsize=10, va='top', color=colour
                        if name in unnamed or name in LOOSE else INK)
                y += 10 * LINE
            y += 0.06

    y = y0 + files_h + 0.3
    for ln in foot_lines:
        ax.text(M, y, ln, fontsize=9.5, color=MUTED, va='top')
        y += 9.5 * LINE
    fig.savefig(OUT, dpi=110)
    plt.close(fig)


def main():
    folders, files, tracked_top, ignored_tracked, ignored = read_tree()
    unnamed = sorted([f + '/' for f in folders if f not in FOLDERS]
                     + [f for f in files if f not in FILES], key=str.lower)
    present = {f + '/' + s for f in folders for s in folders[f]}
    stale = (sorted(n + '/' for n in set(FOLDERS) - set(folders))
             + sorted(set(FILES) - files)
             + sorted(n + '/' for n in SUBFOLDERS if n not in present)
             + sorted(n for n in LOOSE if n not in files and n not in folders))
    bare = sorted(f + '/' + s + '/' for f in folders for s in folders[f]
                  if f + '/' + s not in SUBFOLDERS)
    draw(folders, files, tracked_top, ignored_tracked, ignored,
         {u.rstrip('/') for u in unnamed})

    n_top, n_sub = len(folders) + len(files), sum(len(s) for s in folders.values())
    print('drew %s: %d top-level entries (%d folders, %d files), %d second-level folders'
          % (OUT.name, n_top, len(folders), len(files), n_sub))
    print('ignored by git at the root (footer): ' + (', '.join(ignored) or 'none'))
    if LOOSE:
        print('loose at the root (amber): ' + ', '.join(sorted(LOOSE)))
    if bare:
        print('note: second-level folders drawn by name only, no line in SUBFOLDERS: '
              + ', '.join(bare))
    if stale:
        print('note: named in the script but not in the repository: ' + ', '.join(stale))
    if unnamed:
        print('top-level check FAILED: %d of %d entries unnamed: %s'
              % (len(unnamed), n_top, ', '.join(unnamed)))
        return 1
    print('top-level check: all %d top-level entries named' % n_top)
    return 0


if __name__ == '__main__':
    sys.exit(main())
