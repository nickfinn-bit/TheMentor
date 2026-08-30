/* ==========================================================================
   REVIEW PANEL — a tool for choosing, not part of the site.

   Set DEV_MODE to false before deploying. With it off this file returns
   immediately: no panel, no styles, no storage, nothing rendered.

   There are two competing answers in the codebase:

     Wave one   p01 … p18   individual fixes to the current design
                            (styles/proposals.css)
     Wave two   inst …      one coherent institutional design system
                            (styles/institutional.css)

   They are mutually exclusive on purpose — they answer the same questions
   differently — and the panel enforces that. Turning anything on in one group
   switches the other group off.

   The <body> class in the HTML is what is committed. The panel seeds itself
   from it the first time, then remembers your choices in localStorage so the
   same set follows you from page to page while you review. "Reset" throws that
   away and goes back to what is committed.
   ========================================================================== */

var DEV_MODE = false;

(function () {
  'use strict';

  if (!DEV_MODE) return;

  var STORAGE_KEY = 'tum-review-state';

  var INSTITUTIONAL = [
    { id: 'inst',          name: 'Foundation',        note: 'colour, type, geometry, rhythm — required by the rest' },
    { id: 'inst-hero',     name: 'Hero',              note: 'scrim instead of the white panel' },
    { id: 'inst-process',  name: 'How we work',       note: 'new section' },
    { id: 'inst-team',     name: 'Team',              note: '' },
    { id: 'inst-services', name: 'Services grid',     note: 'replaces the carousel' },
    { id: 'inst-results',  name: 'Testimonials',      note: '' },
    { id: 'inst-faq',      name: 'FAQ',               note: '4 new questions, 2 need answers' },
    { id: 'inst-footer',   name: 'Footer',            note: '' }
  ];

  var WAVE_ONE = [
    { id: 'p01', name: 'Institutional footer',         note: 'has placeholders' },
    { id: 'p02', name: 'Plain ground, section rhythm', note: 'brand risk' },
    { id: 'p03', name: 'Drop heading outlines',        note: 'needs 02' },
    { id: 'p04', name: 'Consistent vertical rhythm',   note: '' },
    { id: 'p05', name: 'One container width',          note: 'see it at 1440+' },
    { id: 'p08', name: '55/17 stat set in type',       note: '' },
    { id: 'p09', name: 'Safeguarding band',            note: 'unverified claims' },
    { id: 'p10', name: 'Testimonial hierarchy',        note: '' },
    { id: 'p11', name: 'Remove nav dividers',          note: 'desktop only' },
    { id: 'p12', name: 'Hero panel legibility',        note: '' },
    { id: 'p13', name: 'Services as a grid',           note: '' },
    { id: 'p14', name: 'Founder section weight',       note: '' },
    { id: 'p18', name: 'WhatsApp as a button',         note: 'brand risk' }
  ];

  var ALL = INSTITUTIONAL.concat(WAVE_ONE);

  var PAGES = [
    ['index.html', 'Home'],
    ['blog.html', 'Blog'],
    ['article.html?post=oxbridge-interview-preparation', 'Article'],
    ['privacy.html', 'Privacy'],
    ['terms.html', 'Terms'],
    ['safeguarding.html', 'Safeguarding'],
    ['cookies.html', 'Cookies'],
    ['404.html', '404']
  ];

  /* --- state ---------------------------------------------------------- */

  var state = {};

  function seedFromBody() {
    ALL.forEach(function (item) {
      state[item.id] = document.body.classList.contains(item.id);
    });
  }

  function load() {
    var stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      stored = null;   // private mode, or storage disabled
    }

    if (!stored) {
      seedFromBody();
      return;
    }

    var active = stored.split(' ').filter(Boolean);
    ALL.forEach(function (item) {
      state[item.id] = active.indexOf(item.id) !== -1;
    });
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, activeIds().join(' '));
    } catch (error) { /* nothing to do; the panel still works for this page */ }
  }

  function activeIds() {
    return ALL.filter(function (item) { return state[item.id]; })
              .map(function (item) { return item.id; });
  }

  function isInstitutional(id) { return id.indexOf('inst') === 0; }

  /* The two waves answer the same questions differently. Running both at once
     produces a page that is neither, so choosing one clears the other. */
  function enforceExclusivity(justEnabled) {
    if (!justEnabled) return;
    var wantsInstitutional = isInstitutional(justEnabled);
    ALL.forEach(function (item) {
      if (item.id === justEnabled) return;
      if (isInstitutional(item.id) !== wantsInstitutional) state[item.id] = false;
    });
  }

  load();

  /* --- panel ---------------------------------------------------------- */

  var panel = document.createElement('div');
  panel.className = 'pp-panel';
  panel.innerHTML =
    '<div class="pp-head">' +
      '<strong>Review</strong>' +
      '<span class="pp-count"></span>' +
      '<button type="button" class="pp-collapse" aria-label="Collapse panel">&minus;</button>' +
    '</div>' +
    '<div class="pp-body">' +
      '<div class="pp-group" data-group="inst">' +
        '<h4>Institutional system <span>wave two</span></h4>' +
        '<ul class="pp-list"></ul>' +
      '</div>' +
      '<div class="pp-group" data-group="p">' +
        '<h4>Individual proposals <span>wave one</span></h4>' +
        '<ul class="pp-list"></ul>' +
      '</div>' +
      '<div class="pp-actions">' +
        '<button type="button" data-all="off">All off</button>' +
        '<button type="button" data-reset>Reset</button>' +
        '<button type="button" data-copy>Copy</button>' +
      '</div>' +
      '<code class="pp-output"></code>' +
      '<div class="pp-pages"></div>' +
    '</div>';

  var lists = panel.querySelectorAll('.pp-list');
  var boxes = {};

  function buildList(listElem, items) {
    items.forEach(function (item) {
      var li = document.createElement('li');
      var label = document.createElement('label');
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = !!state[item.id];
      box.addEventListener('change', function () {
        state[item.id] = box.checked;
        if (box.checked) enforceExclusivity(item.id);
        apply();
      });
      boxes[item.id] = box;

      label.appendChild(box);
      label.appendChild(document.createTextNode(' ' + item.name));
      if (item.note) {
        var note = document.createElement('em');
        note.textContent = item.note;
        label.appendChild(note);
      }
      li.appendChild(label);
      listElem.appendChild(li);
    });
  }

  buildList(lists[0], INSTITUTIONAL);
  buildList(lists[1], WAVE_ONE);

  var pagesElem = panel.querySelector('.pp-pages');
  pagesElem.innerHTML = '<span>Pages</span>' + PAGES.map(function (entry) {
    var here = window.location.pathname.split('/').pop() === entry[0].split('?')[0];
    return '<a href="' + entry[0] + '"' + (here ? ' class="is-here"' : '') + '>'
         + entry[1] + '</a>';
  }).join('');

  function apply() {
    ALL.forEach(function (item) {
      document.body.classList.toggle(item.id, !!state[item.id]);
      if (boxes[item.id]) boxes[item.id].checked = !!state[item.id];
    });

    var active = activeIds();
    panel.querySelector('.pp-output').textContent =
      active.length ? 'class="' + active.join(' ') + '"' : 'nothing on — the site as it is today';
    panel.querySelector('.pp-count').textContent = active.length + ' on';

    // The sub-toggles do nothing without the foundation; show that.
    panel.querySelector('[data-group="inst"]')
         .classList.toggle('is-inactive', !state.inst);

    save();
  }

  panel.addEventListener('click', function (event) {
    var target = event.target;
    if (!target.getAttribute) return;

    if (target.getAttribute('data-all') === 'off') {
      ALL.forEach(function (item) { state[item.id] = false; });
      apply();
    }

    if (target.hasAttribute('data-reset')) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) { /* nothing stored to remove */ }
      seedFromBody();
      apply();
    }

    if (target.hasAttribute('data-copy')) {
      var text = panel.querySelector('.pp-output').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      target.textContent = 'Copied';
      setTimeout(function () { target.textContent = 'Copy'; }, 1200);
    }
  });

  panel.querySelector('.pp-collapse').addEventListener('click', function () {
    var collapsed = panel.classList.toggle('is-collapsed');
    this.innerHTML = collapsed ? '+' : '&minus;';
  });

  var style = document.createElement('style');
  style.textContent = [
    // The site sets `* { font-family: Merriweather }`; `.pp-panel *` outranks it
    // so the review tool stays visually separate from the page.
    '.pp-panel,.pp-panel *{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;box-sizing:border-box;}',
    '.pp-panel{position:fixed;left:12px;bottom:12px;z-index:9999;width:282px;',
    'background:#fff;color:#1C1719;border:1px solid #D8D0D2;border-radius:6px;',
    'box-shadow:0 6px 28px rgba(0,0,0,.18);font:13px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;}',
    '.pp-head{display:flex;align-items:center;gap:8px;padding:9px 10px;background:#7E1633;color:#fff;border-radius:5px 5px 0 0;}',
    '.pp-head strong{flex:1;font-size:12px;letter-spacing:.08em;text-transform:uppercase;}',
    '.pp-count{font-size:11px;opacity:.85;font-variant-numeric:tabular-nums;}',
    '.pp-collapse{width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;',
    'background:rgba(255,255,255,.18);color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:15px;font-weight:400;}',
    '.pp-collapse:hover{background:rgba(255,255,255,.3);color:#fff;font-weight:400;}',
    '.pp-panel.is-collapsed .pp-body{display:none;}',
    '.pp-body{padding:10px;max-height:76vh;overflow-y:auto;}',
    '.pp-group{margin-bottom:12px;}',
    '.pp-group h4{margin:0 0 6px;font-size:10.5px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:#7E1633;',
    'display:flex;align-items:baseline;gap:6px;}',
    '.pp-group h4 span{font-weight:400;letter-spacing:.04em;color:#A2949A;text-transform:none;}',
    // The sub-toggles are inert without the foundation, so they read as inert.
    '.pp-group.is-inactive .pp-list li:not(:first-child){opacity:.42;}',
    '.pp-list{list-style:none;margin:0;padding:0;}',
    '.pp-list li{margin:0 0 2px;}',
    '.pp-list label{display:flex;align-items:flex-start;gap:7px;padding:4px 5px;border-radius:3px;cursor:pointer;height:auto;justify-content:flex-start;}',
    '.pp-list label:hover{background:#F6F2F3;}',
    '.pp-list input{margin:2px 0 0;flex:0 0 auto;accent-color:#7E1633;}',
    '.pp-list em{display:block;font-size:10.5px;color:#8A7C82;font-style:normal;line-height:1.35;}',
    '.pp-actions{display:flex;gap:6px;margin:10px 0 0;}',
    '.pp-actions button{flex:1;padding:6px 4px;font:600 11px/1 inherit;color:#4A4045;background:#F4F0F1;',
    'border:1px solid #DDD5D7;border-radius:3px;cursor:pointer;min-height:0;letter-spacing:0;text-transform:none;}',
    '.pp-actions button:hover{background:#EAE3E5;color:#1C1719;font-weight:600;}',
    '.pp-output{display:block;margin-top:9px;padding:7px 8px;background:#F4F0F1;border-radius:3px;',
    'font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#4A4045;word-break:break-all;}',
    '.pp-pages{margin-top:10px;padding-top:9px;border-top:1px solid #E8E2E3;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;}',
    '.pp-pages span{font-size:10px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:#A2949A;width:100%;}',
    '.pp-pages a{display:inline;height:auto;font-size:11.5px;color:#7E1633;text-decoration:underline;text-underline-offset:2px;}',
    '.pp-pages a.is-here{color:#1C1719;text-decoration:none;font-weight:700;}',
    '@media(max-width:600px){.pp-panel{width:auto;right:12px;}}'
  ].join('');

  document.head.appendChild(style);
  document.body.appendChild(panel);
  apply();
})();
