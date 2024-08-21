import { tutors } from "../data/tutorInfo.js";
import { servicesOffered } from "../data/servicesOfferedInfo.js";

const numberOfCards = 3;
let tutorCardHTML = ''

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

document.querySelector('.js-tutor-card-container')
  .innerHTML = tutorCardHTML;

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

  renderImageTextElement(true, matchingValue, 'What we offer', '.js-services-offered-container')
}

function renderImageTextElement(withOptions, value, title, classTag) {
  let textImageElementHTML = '';
  

  textImageElementHTML += `
    <div class="element-title">${title}</div>
    <div class="picture-text-container">
      <div class="element-image-container">
        <img class="element-image" src=${value.image}>
      </div>
      <div class="text-container">
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
      console.log('I am listening')
    });
  });
}

renderImageTextElement(true, servicesOffered[0], 'What we offer', '.js-services-offered-container');
addEventListenersToRadio();

