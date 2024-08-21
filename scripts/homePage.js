import { tutors } from "../data/tutorInfo.js";

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