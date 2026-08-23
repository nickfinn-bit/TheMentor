const fadeOutElem = document.querySelector('.fade-out');

const contactUsButton = document.querySelector('.contact-us-container');
const interestedButton = document.querySelector('.find-tutor-button');
const footerCtaButton = document.querySelector('.footer-cta');

const interestedPopUp = document.querySelector('.interested-popup');
const closeInterestedPopUp = document.querySelector('.interested-popup .close-popup');

// Where focus goes back to once the dialog closes.
let lastFocusedElement = null;

function openPopUp(trigger) {
  lastFocusedElement = trigger || document.activeElement;
  interestedPopUp.classList.remove('hidden');
  fadeOutElem.classList.remove('hidden');
  closeInterestedPopUp.focus();
}

function closePopUp() {
  if (interestedPopUp.classList.contains('hidden')) return;
  interestedPopUp.classList.add('hidden');
  fadeOutElem.classList.add('hidden');
  if (lastFocusedElement) lastFocusedElement.focus();
}

// Not every page carries both triggers, so skip the ones that are absent.
[contactUsButton, interestedButton, footerCtaButton].filter(Boolean).forEach(button => {
  button.addEventListener('click', () => openPopUp(button));
});

closeInterestedPopUp.addEventListener('click', closePopUp);

// Clicking the dimmed backdrop closes the dialog.
fadeOutElem.addEventListener('click', closePopUp);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePopUp();
});

// Keep tabbing inside the dialog while it is open.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  if (interestedPopUp.classList.contains('hidden')) return;

  const focusable = interestedPopUp.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
