# Draws REPO-STRUCTURE.png at the repository root: every top-level folder and
# file, what goes in each, and every folder one level down.
#
#   python tools/build-repo-structure.py
#
# Requires matplotlib (`pip install matplotlib`). No page loads this file; it
# sits in tools/ beside the other Python generators. Other repositories keep
# their structure script in scripts/, but here that folder holds only the
# JavaScript the pages load.
#
# The tree is read from the disk, without git: every entry at the root and
# every folder one level down, leaving out .git and caches (SKIP). Root entries
# that the root .gitignore names are never committed, so never published; they
# are drawn in a section of their own, "On this machine only". The picture is
# always drawn; the script then exits 1 if any top-level entry has no line in
# FOLDERS or FILES. Add the line and redraw.
#
# Everything committed here is published on theunimentor.com, this script and
# the picture included, so nothing below may name anything private: describe
# local-only entries in general terms. A gitignored root entry with no line
# here is only counted, not named (the run prints its name, on this machine
# only), so a private name reaches the picture only once someone writes it here.
#
# Only the root .gitignore is read, never anything inside .git/. So the script
# cannot tell whether a path .gitignore names was committed before it was
# ignored, and is therefore still tracked and published;
# `git ls-files -ci --exclude-standard` lists any such file.

import fnmatch
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

# Top-level folders, in the order they are drawn: the published ones first,
# then those .gitignore keeps on this machine.
FOLDERS = {
    'data': "The site's content as JavaScript arrays the pages render: the blog "
            "articles (blogInfo.js; a new post is one entry there, not a new "
            "page), the testimonials on the results cards, the tutors, and the "
            "services offered (loaded, though no script reads them)",
    'images': "Every picture the pages show: photography, logos and icons, plus a "
              "few originals no page shows. A new photo goes here; "
              "tools/build-images.py then makes its resized copies in opt/",
    'scripts': "The JavaScript the pages load: the header, mobile menu, contact "
               "pop-up and cookie consent (which loads the Meta Pixel only after "
               "Accept) on every page; the home page's tutor and results cards, "
               "slideshow and FAQ; the blog list and article page; <picture> "
               "markup for photos",
    'styles': "The CSS: landing-page.css holds the shared tokens, header, footer, "
              "contact pop-up and cookie banner, and rest-of-home-page.css, "
              "despite its name, also loads on every page; the rest style the "
              "home page's slideshow and FAQ, the blog, and the policy and 404 "
              "pages",
    'tools': "Python run by hand to regenerate committed files: build-images.py "
             "(images/opt/), build-brand-assets.py (the share image and "
             "favicons), build-sitemap.py (sitemap.xml) and build-repo-structure.py "
             "(this picture). robots.txt keeps search engines out",
    '.claude': "This machine's Claude Code settings for the repository "
               "(settings.json); they name local paths, so they stay here",
    '.private': "Private work on the site and its business, kept off git and the "
                "site: documents, marketing drafts and private scripts, with a note "
                "and the backup it describes at its top",
    '.tools': "Third-party tools downloaded for this machine, not part of the "
              "site: Android SDK Platform-Tools (adb, fastboot), unpacked, with "
              "the archive it came in",
}

# Folders one level down. Any not listed here is still drawn, by name only.
SUBFOLDERS = {
    'images/opt': 'resized JPEG, WebP and PNG copies the pages serve, made by '
                  'tools/build-images.py; never edited by hand',
    'images/icons': 'the logo, favicons and interface icons',
    'images/tutor-images': 'tutor portraits, the originals',
    'images/tutee-images': 'photos of the people quoted on the results cards',
    'images/uni-images': 'university crests for the tutor cards',
    'images/faqimages': "the FAQ's icons, and background patterns no page uses",
    'tools/design-review': 'the August 2026 design-proposal scaffolding and its '
                           'note, PROPOSALS.md; no page loads them (see its '
                           'README.md)',
    '.private/docs': 'private documents',
    '.private/marketing': 'marketing drafts and the working evidence behind them',
    '.private/tools': 'private scripts and helpers, most in dated folders',
    '.tools/platform-tools': 'Android SDK Platform-Tools, unpacked',
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
    'INDEX.md': "The repository's index in words: what it is for, its counts, "
                'and a line for each folder and group of files',
    '.gitignore': 'What git leaves out: .env and the .claude/, .private/ and '
                  '.tools/ folders, so none of them is committed or published',
    'REPO-STRUCTURE.png': 'This picture',
    '.env': 'Local secrets, read by no page',
}

# Entries that sit at the root but belong elsewhere, and where each would go;
# drawn in amber. Empty since 2026-10-14, when PROPOSALS.md moved to
# tools/design-review/.
LOOSE = {}


def ignore_rules():
    """(pattern, negated, folders only, anchored) for each rule of the root
    .gitignore, in order."""
    path = ROOT / '.gitignore'
    rules = []
    if path.is_file():
        for ln in path.read_text(encoding='utf-8').splitlines():
            ln = ln.strip()
            if not ln or ln.startswith('#'):
                continue
            negated = ln.startswith('!')
            pat = ln[1:] if negated else ln
            dir_only = pat.endswith('/')
            pat = pat.rstrip('/')
            rules.append((pat.lstrip('/'), negated, dir_only, '/' in pat))
    return rules


def is_ignored(rel, is_dir, rules):
    """Whether the root .gitignore ignores rel (a path from the root): as in
    git, the last rule that matches decides, and a rule with no slash but a
    trailing one matches the name at any depth."""
    hit = False
    for pat, negated, dir_only, anchored in rules:
        if dir_only and not is_dir:
            continue
        if fnmatch.fnmatchcase(rel if anchored else rel.rsplit('/', 1)[-1], pat):
            hit = not negated
    return hit


def read_tree(rules):
    """Top-level folders (with their sub-folders) and root files on disk; the
    root entries .gitignore keeps on this machine; and the sub-folders of the
    other folders that it ignores."""
    folders, files, local = {}, set(), set()
    for p in ROOT.iterdir():
        if p.name in SKIP:
            continue
        if p.is_dir():
            folders[p.name] = {s.name for s in p.iterdir()
                               if s.is_dir() and s.name not in SKIP}
        else:
            files.add(p.name)
        if is_ignored(p.name, p.is_dir(), rules):
            local.add(p.name)
    # The picture names itself, including on the run before it first exists.
    files.add(OUT.name)
    local_subs = {f + '/' + s for f in folders if f not in local for s in folders[f]
                  if is_ignored(f + '/' + s, True, rules)}
    return folders, files, local, local_subs


LINE = 1.4 / 72  # inches per point of font size, one text line


def wrap(text, width_in, size, mono=False):
    return textwrap.wrap(text, max(10, int(width_in * 72 / (size * (0.63 if mono else 0.56)))))


def draw(folders, files, local, local_subs, unnamed, withheld, caches):
    W, M, GAP, COLS = 18.0, 0.5, 0.25, 3
    card_w = (W - 2 * M - (COLS - 1) * GAP) / COLS
    inner = card_w - 0.3
    INK, MUTED, ACCENT = '#1C1719', '#6E6167', '#7E1633'  # the site's ink and maroon
    WARN, BAD = '#A15C00', '#D0021B'

    def card(name):
        body = wrap(FOLDERS.get(name, 'NOT NAMED: add it to FOLDERS in this script'),
                    inner, 10.5)
        subs = sorted(folders[name], key=str.lower)
        sub_w = (max(len(s) for s in subs) + 2) * 9.5 * 0.63 / 72 if subs else 0
        inside = []
        for s in subs:
            desc = SUBFOLDERS.get(name + '/' + s, '')
            if name + '/' + s in local_subs:
                desc = (desc + '; ' if desc else '') + 'in .gitignore, on this machine only'
            inside.append((s + '/', wrap(desc, inner - sub_w, 9.5)))
        loose = wrap('Loose: ' + LOOSE[name], inner, 9.5) if name in LOOSE else []
        h = (0.2 + 13 * LINE + len(body) * 10.5 * LINE
             + (0.1 if inside else 0)
             + sum(max(1, len(lines)) * 9.5 * LINE + 0.03 for _, lines in inside)
             + len(loose) * 9.5 * LINE + 0.15)
        return body, sub_w, inside, loose, h

    def in_order(names, named):
        """The unnamed first, alphabetically, then the named in the script's order."""
        return (sorted((n for n in names if n not in named), key=str.lower)
                + [n for n in named if n in names])

    def stack(names):
        """Each card in the shortest of COLS columns; and the columns' height."""
        cols, placed = [0.0] * COLS, []
        for name in names:
            body, sub_w, inside, loose, h = card(name)
            c = cols.index(min(cols))
            placed.append((name, c, cols[c], body, sub_w, inside, loose, h))
            cols[c] += h + GAP
        return placed, (max(cols) if placed else 0.0)

    shown = (set(folders) | files) - set(withheld)
    pub_cards, pub_cards_h = stack(in_order([n for n in folders if n not in local], FOLDERS))
    loc_cards, loc_cards_h = stack(in_order([n for n in folders if n in local and n in shown],
                                            FOLDERS))

    fcol_w = (W - 2 * M - GAP) / 2
    name_w = max(len(n) for n in files if n in shown) * 10 * 0.66 / 72 + 0.3
    file_order = list(FILES)

    def rows_of(names):
        """Two columns of file rows; and the taller column's height."""
        rows = []
        for name in sorted(names, key=lambda n: (n in FILES, n in LOOSE,
                                                 file_order.index(n) if n in FILES else 0,
                                                 n.lower())):
            desc = FILES.get(name, 'NOT NAMED: add it to FILES in this script')
            if name in LOOSE:
                desc += '. Loose: ' + LOOSE[name]
            rows.append((name, wrap(desc, fcol_w - name_w - 0.1, 10)))
        half = (len(rows) + 1) // 2
        h = max(sum(0.06 + len(r[1]) * 10 * LINE for r in rows[:half]),
                sum(0.06 + len(r[1]) * 10 * LINE for r in rows[half:]))
        return (rows[:half], rows[half:]), h

    pub_rows, pub_rows_h = rows_of([n for n in files if n not in local])
    loc_rows, loc_rows_h = rows_of([n for n in files if n in local and n in shown])
    has_local = bool(loc_cards or loc_rows_h)

    foot = '.git/ is left out'
    foot += (', and so are the caches here: ' + ',  '.join(caches) + '.') if caches else '.'
    if withheld:
        one = len(withheld) == 1
        foot += ('   %d more entr%s in .gitignore ha%s no line in the script yet, so %s '
                 'counted here but not named.' % (len(withheld), 'y' if one else 'ies',
                                                  's' if one else 've',
                                                  'it is' if one else 'they are'))
    foot_lines = wrap(foot, W - 2 * M, 9.5)

    head_h, sec_h, note_h = 1.25, 0.45, 0.3
    H = (M + head_h
         + sec_h + pub_cards_h + 0.15
         + sec_h + note_h + pub_rows_h + 0.3
         + ((sec_h + note_h + loc_cards_h + loc_rows_h + 0.3) if has_local else 0)
         + len(foot_lines) * 9.5 * LINE + M)
    fig = plt.figure(figsize=(W, H), dpi=110)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(H, 0)
    ax.axis('off')

    ax.text(M, M, 'TheMentor (theunimentor.com): what goes where', fontsize=22,
            weight='bold', color=INK, va='top')
    ax.text(M, M + 0.5, 'Every top-level folder and file in the repository folder (.git/ and '
            'caches left out), what goes in each, and the folders one level down.',
            fontsize=11, color=MUTED, va='top')
    ax.text(M, M + 0.78, 'Redraw: python tools/build-repo-structure.py  (fails while any '
            'top-level entry is unnamed).   Red: unnamed.   Amber: loose, and where it '
            'would go.', fontsize=11, color=MUTED, va='top')

    def heading(y, title, note=None):
        ax.text(M, y, title, fontsize=15, weight='bold', color=INK, va='top')
        y += sec_h
        if note:
            ax.text(M, y - 0.05, note, fontsize=10, color=MUTED, va='top')
            y += note_h
        return y

    def draw_cards(placed, y0):
        for name, c, top, body, sub_w, inside, loose, h in placed:
            x, y = M + c * (card_w + GAP), y0 + top
            ax.add_patch(FancyBboxPatch((x, y), card_w, h,
                                        boxstyle='round,pad=0,rounding_size=0.08',
                                        fc='#FAF8F7', ec='#E2D6DA', lw=1))
            ty = y + 0.12
            ax.text(x + 0.15, ty, name + '/', fontsize=13, weight='bold', va='top',
                    color=BAD if name in unnamed else ACCENT)
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

    def draw_rows(columns, y0):
        for col, chunk in enumerate(columns):
            x, y = M + col * (fcol_w + GAP), y0
            for name, lines in chunk:
                colour = BAD if name in unnamed else (WARN if name in LOOSE else ACCENT)
                ax.text(x, y, name, fontsize=10, weight='bold', color=colour, va='top')
                for ln in lines:
                    ax.text(x + name_w, y, ln, fontsize=10, va='top', color=colour
                            if name in unnamed or name in LOOSE else INK)
                    y += 10 * LINE
                y += 0.06

    y = heading(M + head_h, 'Folders')
    draw_cards(pub_cards, y)
    y = heading(y + pub_cards_h + 0.15, 'Files at the root',
                'The pages, and the files browsers, search engines and GitHub Pages fetch '
                'from fixed root addresses, have to stay at the root; so do .gitignore, '
                'INDEX.md and this picture.')
    draw_rows(pub_rows, y)
    y += pub_rows_h + 0.3
    if has_local:
        y = heading(y, 'On this machine only',
                    'Named in .gitignore, so never committed: not in the public repository '
                    'and not on theunimentor.com. Described here only in general terms.')
        draw_cards(loc_cards, y)
        y += loc_cards_h
        draw_rows(loc_rows, y)
        y += loc_rows_h + 0.3
    for ln in foot_lines:
        ax.text(M, y, ln, fontsize=9.5, color=BAD if withheld else MUTED, va='top')
        y += 9.5 * LINE
    fig.savefig(OUT, dpi=110)
    plt.close(fig)


def main():
    folders, files, local, local_subs = read_tree(ignore_rules())
    caches = sorted(p.name + '/' for p in ROOT.iterdir()
                    if p.is_dir() and p.name in SKIP and p.name != '.git')
    unnamed = sorted([f + '/' for f in folders if f not in FOLDERS]
                     + [f for f in files if f not in FILES], key=str.lower)
    withheld = sorted(u.rstrip('/') for u in unnamed if u.rstrip('/') in local)
    present = {f + '/' + s for f in folders for s in folders[f]}
    stale = (sorted(n + '/' for n in set(FOLDERS) - set(folders))
             + sorted(set(FILES) - files)
             + sorted(n + '/' for n in SUBFOLDERS if n not in present)
             + sorted(n for n in LOOSE if n not in files and n not in folders))
    bare = sorted(f + '/' + s + '/' for f in folders for s in folders[f]
                  if f + '/' + s not in SUBFOLDERS)
    draw(folders, files, local, local_subs, {u.rstrip('/') for u in unnamed}, withheld,
         caches)

    n_top, n_sub = len(folders) + len(files), sum(len(s) for s in folders.values())
    print('drew %s: %d top-level entries (%d folders, %d files), %d second-level folders'
          % (OUT.name, n_top, len(folders), len(files), n_sub))
    print('on this machine only (in .gitignore): '
          + (', '.join(sorted(n + ('/' if n in folders else '') for n in local)) or 'none'))
    if local_subs:
        print('second-level folders in .gitignore: ' + ', '.join(sorted(local_subs)))
    if LOOSE:
        print('loose at the root (amber): ' + ', '.join(sorted(LOOSE)))
    if stale:
        print('note: named in the script but not on disk: ' + ', '.join(stale))
    print('second-level check: %d of %d folders named%s'
          % (n_sub - len(bare), n_sub, ('; by name only: ' + ', '.join(bare)) if bare else ''))
    if unnamed:
        if withheld:
            print('counted but not named on the picture (in .gitignore): '
                  + ', '.join(withheld))
        print('top-level check FAILED: %d of %d entries unnamed: %s'
              % (len(unnamed), n_top, ', '.join(unnamed)))
        return 1
    print('top-level check: all %d top-level entries named' % n_top)
    return 0


if __name__ == '__main__':
    sys.exit(main())
