/* FAQ accordion.

   A <details> element has no intermediate state to transition through: the
   browser reflows from closed to open in a single frame, so CSS alone cannot
   smooth it. The fix is to take over the summary click, keep the element open
   for the whole animation, and animate its height between the two measured
   values — then hand control back to the browser once the animation lands.

   Each question owns its own animation state. Clicking mid-flight reverses
   from wherever it currently is rather than jumping. */

const OPEN_MS = 280;
const CLOSE_MS = 220;
const EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

class FaqAccordion {
  constructor(details) {
    this.details = details;
    this.summary = details.querySelector('summary');
    this.content = this.summary && this.summary.nextElementSibling;
    this.icon = details.querySelector('summary img');
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;

    this.summary.addEventListener('click', event => this.onClick(event));

    // The icon is driven from here rather than from the `toggle` event: on
    // close, `open` does not flip until the animation finishes, and waiting
    // that long to show the + reads as lag.
    this.setIcon(details.open);
  }

  setIcon(open) {
    if (!this.icon) return;
    this.icon.src = open
      ? 'images/faqimages/icon-minus.svg'
      : 'images/faqimages/icon-plus.svg';
    this.details.classList.toggle('is-open', open);
  }

  /* offsetHeight stops at the border box. The answer carries vertical margins,
     and `overflow: hidden` below suppresses the collapsing that would normally
     hide them, so they have to be measured back in or the panel animates to a
     height ~24px short and jumps at the end. */
  contentHeight() {
    const style = getComputedStyle(this.content);
    return this.content.offsetHeight +
      parseFloat(style.marginTop) +
      parseFloat(style.marginBottom);
  }

  onClick(event) {
    // No content to measure, or the reader has asked for less motion: leave
    // the native toggle alone.
    if (!this.content || reducedMotion.matches) {
      this.setIcon(!this.details.open);
      return;
    }

    event.preventDefault();
    this.details.style.overflow = 'hidden';

    if (this.isClosing || !this.details.open) this.open();
    else this.shrink();
  }

  open() {
    this.setIcon(true);
    this.details.style.height = `${this.details.offsetHeight}px`;
    this.details.open = true;
    // Wait a frame so the answer is laid out and can be measured.
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    this.isExpanding = true;
    const start = `${this.details.offsetHeight}px`;
    const end = `${this.summary.offsetHeight + this.contentHeight()}px`;

    this.run(start, end, OPEN_MS, true);
    this.content.animate(
      { opacity: [0, 1], transform: ['translateY(-6px)', 'translateY(0)'] },
      { duration: OPEN_MS, easing: EASING }
    );
  }

  shrink() {
    this.setIcon(false);
    this.isClosing = true;
    const start = `${this.details.offsetHeight}px`;
    const end = `${this.summary.offsetHeight}px`;

    this.run(start, end, CLOSE_MS, false);
  }

  run(start, end, duration, willBeOpen) {
    if (this.animation) this.animation.cancel();

    this.animation = this.details.animate(
      { height: [start, end] },
      { duration, easing: EASING }
    );
    this.animation.onfinish = () => this.onFinish(willBeOpen);
    this.animation.oncancel = () => {
      this.isClosing = false;
      this.isExpanding = false;
    };
  }

  onFinish(open) {
    this.details.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    // Release the inline height so the answer can reflow with the viewport.
    this.details.style.height = '';
    this.details.style.overflow = '';
    this.setIcon(open);
  }
}

document.querySelectorAll('.question details').forEach(details => {
  if (details.querySelector('summary')) new FaqAccordion(details);
});
