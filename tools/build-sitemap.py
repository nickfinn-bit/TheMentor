# Regenerates sitemap.xml from the static pages plus every article in
# data/blogInfo.js.
#
#   python tools/build-sitemap.py
#
# Run it after adding a page or an article, and commit the result. The site has
# no build step; this is the one thing that would otherwise go stale silently.

import io
import os
import re
import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.theunimentor.com'

# path, change frequency, priority
STATIC = [
    ('/',                   'monthly', '1.0'),
    ('/blog.html',          'weekly',  '0.8'),
    ('/privacy.html',       'yearly',  '0.3'),
    ('/cookies.html',       'yearly',  '0.3'),
    ('/terms.html',         'yearly',  '0.3'),
    ('/safeguarding.html',  'yearly',  '0.4'),
]


def articles():
    """(slug, date) for every post, newest first."""
    path = os.path.join(ROOT, 'data', 'blogInfo.js')
    source = io.open(path, encoding='utf-8').read()
    slugs = re.findall(r"slug:\s*'([^']+)'", source)
    dates = re.findall(r"date:\s*'(\d{4}-\d{2}-\d{2})'", source)
    if len(slugs) != len(dates):
        raise SystemExit(
            'blogInfo.js has %d slugs but %d dates — every article needs both.'
            % (len(slugs), len(dates)))
    return sorted(zip(slugs, dates), key=lambda pair: pair[1], reverse=True)


def main():
    today = datetime.date.today().isoformat()
    posts = articles()
    newest = posts[0][1] if posts else today

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    for path, freq, priority in STATIC:
        # The blog index is only as fresh as its newest post.
        lastmod = newest if path == '/blog.html' else today
        lines += ['  <url>',
                  '    <loc>%s%s</loc>' % (SITE, path),
                  '    <lastmod>%s</lastmod>' % lastmod,
                  '    <changefreq>%s</changefreq>' % freq,
                  '    <priority>%s</priority>' % priority,
                  '  </url>']

    for slug, date in posts:
        lines += ['  <url>',
                  '    <loc>%s/article.html?post=%s</loc>' % (SITE, slug),
                  '    <lastmod>%s</lastmod>' % date,
                  '    <changefreq>yearly</changefreq>',
                  '    <priority>0.6</priority>',
                  '  </url>']

    lines.append('</urlset>')

    out = os.path.join(ROOT, 'sitemap.xml')
    with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines) + '\n')

    print('sitemap.xml: %d URLs (%d static, %d articles)'
          % (len(STATIC) + len(posts), len(STATIC), len(posts)))


if __name__ == '__main__':
    main()
