const numberOfCards = 3;
let tutorCardHTML = '';
let resultsCardHTML = '';

/* The portrait renders at 120px round in the current layout and fills a 4:3
   panel in the institutional one; 480 covers the larger of the two at 2x. */
const TUTOR_WIDTHS = [240, 480];
const TUTOR_SIZES = '(max-width: 620px) 100vw, (max-width: 900px) 50vw, 380px';

for (let i = 0; i < numberOfCards; i++) {
  const { picture, name, description, uni, uniName } = tutors[i];

  const portrait = ResponsiveImage.pictureHTML(picture, {
    widths: TUTOR_WIDTHS,
    sizes: TUTOR_SIZES,
    alt: name,
    className: 'tutor-picture',
    loading: 'lazy'
  });

  tutorCardHTML += `
  <div class="general-card tutor-card">
    <div class="tutor-picture-container">
      ${portrait}
    </div>
    <div class="tutor-name">${name}</div>
    <div class="tutor-description">${description}</div>
    <div class="uni-container">
      <img class="uni-logo" src="${uni}" alt="${uniName || ''}" loading="lazy" decoding="async">
    </div>
  </div>
  `
}

for (let i = 0; i < numberOfCards; i++) {
  const { name, description, image } = resultsInfo[i];

  resultsCardHTML += `
    <div class="general-card results-card">
      <div class="results-top">
        <div class="results-image-container">
          <img class="results-profile-pic" src="${image}" alt=""
               width="100" height="100" loading="lazy" decoding="async">
        </div>
        <div class="quote-mark-container">
          <img class="quote-mark" src="images/icons/quote-left-icon.svg" alt=""
               width="60" height="60" loading="lazy" decoding="async">
        </div>
      </div>
      <div class="results-description">${description}</div>
      <div class="results-name">${name}</div>
    </div>
  `
}

document.querySelector('.js-tutor-card-container')
  .innerHTML = tutorCardHTML;
document.querySelector('.js-result-card-container')
  .innerHTML = resultsCardHTML;

function renderImageTextElement(value, title, classTag, order) {
  const container = document.querySelector(classTag);
  // The commitment section is currently commented out of the markup. Bailing
  // out here instead of throwing keeps the rest of this file running.
  if (!container) return;

  container.innerHTML = `
    <div class="element-title">${title}</div>
    <div class="picture-text-container">
      <div class="element-image-container" style="order: ${order}">
        <img class="element-image" src="${value.image}" alt="">
      </div>
      <div class="text-container">
        <div class="text-header">
          ${value.title}
        </div>
        <div class="text-description">
          ${value.description}
        </div>
      </div>
    </div>
  `;
}

/* The mobile navigation drawer lives in scripts/nav.js — it is shared with the
   blog pages. */
