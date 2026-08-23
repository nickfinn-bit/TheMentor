/* Mobile navigation drawer. Shared by every page, so it lives here rather than
   in homePage.js. */

/* By id, not by tag: policy pages carry a second <nav> for their contents list. */
const nav = document.querySelector('#site-nav');
const hamburger = document.querySelector('.hamburger-menu');

function openNav() {
  if (nav.classList.contains('open')) return;
  nav.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  const firstLink = nav.querySelector('a');
  if (firstLink) firstLink.focus();
}

function closeNav({ returnFocus = false } = {}) {
  if (!nav.classList.contains('open')) return;
  nav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  if (returnFocus) hamburger.focus();
}

hamburger.addEventListener('click', (event) => {
  event.stopPropagation();
  if (nav.classList.contains('open')) {
    closeNav({ returnFocus: true });
  } else {
    openNav();
  }
});

// Any click outside the drawer closes it.
document.addEventListener('click', (event) => {
  if (!nav.classList.contains('open')) return;
  if (nav.contains(event.target) || hamburger.contains(event.target)) return;
  closeNav();
});

// Following a link closes the drawer so the target section is visible.
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => closeNav());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNav({ returnFocus: true });
});
