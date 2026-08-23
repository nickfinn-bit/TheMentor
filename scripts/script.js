// Swap the +/- icon to match each question's own open state. This used to hang
// off a single shared `toggle` flag, so opening one question flipped the icon
// on all of the others.
document.querySelectorAll('.question details').forEach(details => {
  const icon = details.querySelector('summary img');
  if (!icon) return;

  details.addEventListener('toggle', () => {
    icon.src = details.open
      ? 'images/faqimages/icon-minus.svg'
      : 'images/faqimages/icon-plus.svg';
  });
});
