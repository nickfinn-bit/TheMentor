# Design review scaffolding — not part of the published site

These three files drove the proposal review. No page links them, so nothing here
is downloaded by a visitor, and `robots.txt` disallows `/tools/`.

| File | What it was |
| --- | --- |
| `proposals.css` | The numbered proposals (p01–p18), each gated on a `<body>` class. |
| `proposals.js` | The in-browser toggle panel for switching them on and off. |
| `institutional.css` | The full institutional design system, gated on `body.inst`. Never adopted. |

## What was adopted

Four proposals were live on every page (`<body class="p01 p05 p11 p14">`). They
have been folded into the real stylesheets and the body classes removed:

- **p01 — institutional footer** → `styles/landing-page.css`, plus the
  `--maroon-deep` and `--footer-fg` tokens in its `:root`.
- **p05 — one container width** → `styles/rest-of-home-page.css`.
- **p11 — nav without the black dividers** → `styles/landing-page.css`, folded
  into the existing `.header-category` rules.
- **p14 — founder section weight** → `styles/rest-of-home-page.css`.

Everything else in `proposals.css` was never switched on and is kept here only
so the exploration is not lost. `institutional.css` still holds uncommitted
refinements to the consultation dialog and the close button.

Delete this whole directory once you no longer want the exploration.
