const SLIDE_INTERVAL = 15000;
/* How long the track has to sit still before we treat the scroll as finished.
   `scrollend` would be the right event, but Safari only got it recently. */
const SCROLL_SETTLE_DELAY = 120;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const track = document.querySelector('.slides');
const slides = track ? Array.from(track.querySelectorAll('.slide')) : [];

if (track && slides.length > 0) {
  const radios = slides.map((slide, index) => document.getElementById('radio' + (index + 1)));

  let current = 0;
  let slideshowIntervalId = null;
  let settleTimeoutId = null;

  /* The radios are display:none and drive nothing but the active dot, so the
     only job here is keeping them pointed at whatever slide is on screen. */
  function markCurrent(index) {
    current = index;
    const radio = radios[index];
    if (radio) {
      radio.checked = true;
    }
  }

  /* Slides are all one track-width wide, but measuring keeps this honest if
     that ever stops being true. */
  function nearestSlideIndex() {
    const origin = slides[0].offsetLeft;
    let nearest = 0;
    let smallestDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs((slide.offsetLeft - origin) - track.scrollLeft);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearest = index;
      }
    });

    return nearest;
  }

  function goToSlide(index) {
    const slide = slides[index];
    if (!slide) return;

    markCurrent(index);
    track.scrollTo({
      left: slide.offsetLeft - slides[0].offsetLeft,
      behavior: prefersReducedMotion ? 'instant' : 'smooth'
    });
  }

  function advance() {
    goToSlide((current + 1) % slides.length);
  }

  function startSlideshow() {
    if (prefersReducedMotion) return;
    stopSlideshow();
    slideshowIntervalId = setInterval(advance, SLIDE_INTERVAL);
  }

  function stopSlideshow() {
    if (slideshowIntervalId !== null) {
      clearInterval(slideshowIntervalId);
      slideshowIntervalId = null;
    }
  }

  startSlideshow();

  /* A swipe moves the track without going through `goToSlide`, so read the
     resting position back out and light up the matching dot. Restarting the
     timer here also stops the carousel from advancing on its own a moment
     after someone has just swiped somewhere deliberately. */
  track.addEventListener('scroll', () => {
    if (settleTimeoutId !== null) {
      clearTimeout(settleTimeoutId);
    }

    settleTimeoutId = setTimeout(() => {
      settleTimeoutId = null;
      markCurrent(nearestSlideIndex());
      startSlideshow();
    }, SCROLL_SETTLE_DELAY);
  }, { passive: true });

  document.querySelectorAll('.manual-btn').forEach(label => {
    const index = radios.findIndex(radio => radio && radio.id === label.htmlFor);
    if (index === -1) return;

    const select = () => {
      goToSlide(index);
      startSlideshow();
    };

    label.addEventListener('click', select);

    // The dots are <label>s, which browsers do not activate from the keyboard.
    label.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select();
      }
    });
  });

  // Don't keep rotating slides in a tab nobody is looking at.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  });

  /* Snapping keeps the track aligned on resize in modern browsers, but the dot
     can be left pointing at the wrong slide if the snap lands elsewhere. */
  window.addEventListener('resize', () => {
    markCurrent(nearestSlideIndex());
  });
}
