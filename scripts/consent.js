/* Cookie consent, and the Meta Pixel behind it.

   Nothing from Meta loads until a visitor presses "Accept" on the banner. Until
   then, and after "Reject", the page makes no request to Meta and no Meta
   cookie is set. cookies.html and privacy.html describe exactly this, so change
   them with it.

   1. The banner, shown until the visitor answers. The answer is kept in
      localStorage under STORE_KEY; "Cookie settings" in the footer reopens it.
   2. The Pixel, loaded only after "Accept": PageView on every page.
   3. The conversion: Lead when a visitor uses the WhatsApp or email link in the
      free-diagnostic dialog. Contact for those links anywhere else.

   While PIXEL_ID is empty the whole file does nothing: no banner, no footer
   link, no request. */

(function () {
  'use strict';

  /* The Meta Pixel for theunimentor.com, from Events Manager. */
  var PIXEL_ID = '';

  /* Bump VERSION when cookies.html changes what a visitor agrees to, so that
     everyone is asked again. */
  var STORE_KEY = 'tum-cookie-consent';
  var VERSION = 1;

  if (!PIXEL_ID) return;

  /* --- the stored answer ---------------------------------------------- */

  function readChoice() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && saved.v === VERSION) return saved.choice;
    } catch (e) { /* storage blocked or unreadable: ask again */ }
    return null;
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        choice: choice, v: VERSION, date: new Date().toISOString().slice(0, 10)
      }));
    } catch (e) { /* the answer still holds for this page */ }
  }

  /* --- the Pixel ------------------------------------------------------- */

  var pixelLoaded = false;

  function loadPixel() {
    if (pixelLoaded) {
      window.fbq('consent', 'grant');
      return;
    }
    pixelLoaded = true;

    /* Meta's base code, unchanged apart from layout. */
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    /* No automatic events: only the PageView and the events below. */
    window.fbq('set', 'autoConfig', false, PIXEL_ID);
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function stopPixel() {
    if (pixelLoaded) window.fbq('consent', 'revoke');
    /* Meta's first-party cookies on this site. Its own cookies on
       facebook.com are outside our reach. */
    var host = location.hostname.replace(/^www\./, '');
    ['_fbp', '_fbc'].forEach(function (name) {
      [host, '.' + host, location.hostname, ''].forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' +
          (domain ? '; domain=' + domain : '');
      });
    });
  }

  /* --- the conversion -------------------------------------------------- */

  /* A capture listener, so it runs even where another handler stops the
     click. A plain click on the WhatsApp link leaves the page, so it is held
     back long enough for the event to be sent. */
  document.addEventListener('click', function (event) {
    if (!pixelLoaded || readChoice() !== 'accepted') return;

    var link = event.target.closest &&
      event.target.closest('a[href^="https://wa.me/"], a[href^="mailto:"]');
    if (!link) return;

    var method = link.href.indexOf('mailto:') === 0 ? 'email' : 'whatsapp';
    var inDiagnostic = !!link.closest('.interested-popup');

    window.fbq('track', inDiagnostic ? 'Lead' : 'Contact', {
      content_name: inDiagnostic ? 'Free diagnostic' : 'Contact',
      method: method
    });

    var leavesPage = method === 'whatsapp' && link.target !== '_blank' &&
      event.button === 0 && !event.defaultPrevented &&
      !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
    if (leavesPage) {
      event.preventDefault();
      setTimeout(function () { location.href = link.href; }, 300);
    }
  }, true);

  /* --- the banner ------------------------------------------------------ */

  var banner = null;

  function buildBanner() {
    banner = document.createElement('section');
    banner.className = 'consent-banner';
    banner.setAttribute('aria-label', 'Cookie choice');
    banner.innerHTML =
      '<p class="consent-text">May we use Meta\'s advertising cookies? They ' +
      'tell us whether our Facebook and Instagram adverts lead to enquiries. ' +
      'Nothing from Meta loads unless you accept. ' +
      '<a href="cookies.html">Cookie Policy</a></p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-button" data-choice="rejected">Reject</button>' +
      '<button type="button" class="consent-button" data-choice="accepted">Accept</button>' +
      '</div>';

    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-choice]');
      if (!button) return;
      var choice = button.getAttribute('data-choice');
      saveChoice(choice);
      hideBanner();
      if (choice === 'accepted') loadPixel(); else stopPixel();
    });

    document.body.appendChild(banner);
  }

  function showBanner() {
    if (!banner) buildBanner();
    banner.hidden = false;
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  /* "Cookie settings" in the footer reopens the banner. The link is in the
     markup but hidden, so it only appears while the Pixel is configured. */
  document.querySelectorAll('.cookie-settings').forEach(function (button) {
    button.hidden = false;
    button.addEventListener('click', function () {
      showBanner();
      var first = banner.querySelector('.consent-button');
      if (first) first.focus();
    });
  });

  /* --- start ----------------------------------------------------------- */

  var choice = readChoice();
  if (choice === 'accepted') loadPixel();
  else if (choice !== 'rejected') showBanner();
})();
