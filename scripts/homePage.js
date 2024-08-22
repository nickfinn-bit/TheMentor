import { tutors } from "../data/tutorInfo.js";
import { servicesOffered, theDifferences } from "../data/servicesOfferedInfo.js";
import { resultsInfo } from "../data/resultsInfo.js";

const numberOfCards = 3;
let tutorCardHTML = '';
let resultsCardHTML = '';

for (let i = 0; i < numberOfCards; i++) {
  const { picture, name, description, uni } = tutors[i];

  tutorCardHTML += `
  <div class="general-card tutor-card">
    <div class="tutor-picture-container">
      <img class="tutor-picture" src=${picture}>
    </div>
    <div class="tutor-name">${name}</div>
    <div class="tutor-description">${description}</div>
    <div class="uni-container">
      <img class="uni-logo" src=${uni}>
    </div>
    <div class="contact-button-container">
      <button class="contact-today-button">Contact today</button>
    </div>
  </div>
  `
} 

for (let i = 0; i < numberOfCards; i++) {
  const { name, description } = resultsInfo[i];

  resultsCardHTML += `
    <div class="general-card results-card">
      <div class="quote-mark-container">
        <img class="quote-mark" src="images/icons/quote-left-icon.svg">
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

function changeImageTextElement() {
  let currentValue;
  document.getElementsByName('first-radio').forEach(option => {
    if (option.checked) {
      currentValue = option.value;
    }
  })

  let matchingValue = '';
  servicesOffered.forEach(value => {
    if (value.name === currentValue)
      matchingValue = value;
  })

  renderImageTextElement(true, matchingValue, 'What we offer', '.js-services-offered-container', 'grey', 0)
}

function renderImageTextElement(withOptions, value, title, classTag, backgroundColor, order) {
  let textImageElementHTML = '';
  

  textImageElementHTML += `
    <div class="element-title">${title}</div>
    <div class="picture-text-container">
      <div class="element-image-container" style="order: ${order}">
        <img class="element-image" src=${value.image}>
      </div>
      <div class="${backgroundColor}-text-container">
        <div class="text-header">
          ${value.title}
        </div>
        <div class="text-description">
          ${value.description}
        </div>
        ${withOptions ? `
          <div class="menu-selector">
          <input type="radio" name="first-radio" value="test-preparation" ${(value.number === 1) ? 'checked' : ''}>
          <input type="radio" name="first-radio" value="academic-tutoring" ${(value.number === 2) ? 'checked' : ''}>
          <input type="radio" name="first-radio" value="admissions-councelling" ${(value.number === 3) ? 'checked' : ''}>
        </div>
          ` : ''}
      </div>
    </div>
  `

  document.querySelector(classTag).innerHTML = textImageElementHTML;
  addEventListenersToRadio();
}

function addEventListenersToRadio() {
  document.getElementsByName('first-radio').forEach(value => {
    value.addEventListener('click', () => {
      changeImageTextElement();
    });
  });
}

renderImageTextElement(true, servicesOffered[0], 'What we offer', '.js-services-offered-container', 'grey', 0);
addEventListenersToRadio();
renderImageTextElement(false, theDifferences, 'What we do differently', '.js-the-differences-container', 'white', 1);

