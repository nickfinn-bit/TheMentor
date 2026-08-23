/* Small behaviours shared by every page.

   1. `is-scrolled` on <body> once the page has moved off the top, so the fixed
      header can separate itself from the content underneath it.
   2. `data-scroll-to="#id"` on a button scrolls to that section, honouring the
      fixed header height and the reduced-motion preference.
   3. In dev mode only, a warning for any [bracketed] placeholder still left in
      the page. */

(function () {
  'use strict';

  /* --- header scroll state ------------------------------------------- */

  var scrolled = false;

  function syncScrollState() {
    var isScrolled = window.scrollY > 8;
    if (isScrolled === scrolled) return;
    scrolled = isScrolled;
    document.body.classList.toggle('is-scrolled', isScrolled);
  }

  syncScrollState();
  window.addEventListener('scroll', syncScrollState, { passive: true });

  /* --- in-page scroll buttons ----------------------------------------- */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-scroll-to]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var target = document.querySelector(trigger.getAttribute('data-scroll-to'));
      if (!target) return;

      var headerHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--header-height'), 10) || 0;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - headerHeight,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* --- placeholder guard ---------------------------------------------- */

  /* Every invented value on this site is wrapped in [square brackets]. Nothing
     that still carries one is ready to publish, so say so loudly while the
     review panel is on rather than trusting a search before deploy. */
  /* Checked inside `load` rather than here: scripts/proposals.js declares
     DEV_MODE and runs after this file. */
  window.addEventListener('load', function () {
    if (typeof DEV_MODE === 'undefined' || !DEV_MODE) return;

    var found = [];
    var walker = document.createTreeWalker(
      document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && node.parentElement.closest('.pp-panel')) continue;
      var match = node.nodeValue.match(/\[[^\]]{2,}\]/g);
      if (match) found = found.concat(match);
    }
    if (found.length) {
      console.warn(
        '[TheUniMentor] ' + found.length +
        ' placeholder(s) still in this page — do not deploy:', found);
    }
  });
})();
