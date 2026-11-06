# TheMentor: the index

## About

description: The source of theunimentor.com, a static site of eight HTML pages with their stylesheets, scripts, data files and images, plus the Python tools that regenerate its derived images, icons, sitemap and structure diagram.
aim: Hold everything the TheUniMentor admissions-consulting website serves, with no build step, so that what is committed here is what visitors get.
numerical_result_summary: 8 HTML pages, 10 page scripts, 6 stylesheets, 4 data files, 98 tracked images, 4 Python build tools and 5 design-review files.

## Contents

- `*.html` — The site's eight pages: the home page, the blog list, the article page, the privacy, terms, cookie and safeguarding policies, and the 404 page.
- `data/` — JavaScript arrays the pages render from: the blog articles, testimonials and tutors, plus the services offered, which a page loads but no script reads.
- `images/` — The site's photographs, icons, university crests, portraits and share image, with the resized WebP, JPEG and PNG copies in `opt/` that `tools/build-images.py` writes.
- `scripts/` — The JavaScript the pages load: navigation, header behaviour, the home page's tutor and results cards, slideshow, FAQ accordion, the contact pop-up, cookie consent (which loads the Meta Pixel only after Accept), `<picture>` markup, and the blog and article rendering.
- `styles/` — The site's stylesheets: the landing page, the rest of the home page, the blog, the FAQ, the policy and 404 pages, and the slideshow.
- `tools/` — Python generators for the responsive images, share image and icons, sitemap and REPO-STRUCTURE.png, and design-review scaffolding that no page loads.
- `.claude/` — This machine's Claude Code settings, kept out of git by `.gitignore` and so never published.
- `.private/` — Private work on the site and its business, kept out of git by `.gitignore` and so never published.
- `.tools/` — Third-party tools downloaded for this machine, kept out of git by `.gitignore` and so never published.
- `CNAME` — The custom domain, theunimentor.com, for GitHub Pages.
- `robots.txt` — What search engines may crawl, keeping them out of `/tools/`.
- `sitemap.xml` — Every page and article for search engines, written by `tools/build-sitemap.py`.
- `site.webmanifest` — The name, colours and icons that browsers and home screens use.
- `REPO-STRUCTURE.png` — The picture of what goes where, drawn by `tools/build-repo-structure.py`.
- `.gitignore` — What git leaves out: `.env` and the `.claude/`, `.private/` and `.tools/` folders.
- `.env` — Local secrets, kept out of git by `.gitignore` and so never published.
