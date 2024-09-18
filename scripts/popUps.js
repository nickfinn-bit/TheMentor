fadeOutElem = document.querySelector('.fade-out');

contactUsButton = document.querySelector('.contact-us-container');
interestedButton = document.querySelector('.find-tutor-button');
applyButton = document.querySelector('.footer-button')

interestedPopUp = document.querySelector('.interested-popup');
applyPopUp = document.querySelector('.apply-popup');

closeInterestedPopUp = document.querySelector('.interested-popup .close-popup');
closeApplyPopUp = document.querySelector('.apply-popup .close-popup');

buttonsList = [contactUsButton, interestedButton];

buttonsList.forEach(button => {
  button.addEventListener('click', () => {
    interestedPopUp.classList.remove('hidden');
    fadeOutElem.classList.remove('hidden');
  })
})
applyButton.addEventListener('click', () => {
  applyPopUp.classList.remove('hidden');
  fadeOutElem.classList.remove('hidden');
})

closeInterestedPopUp.addEventListener('click', () => {
  interestedPopUp.classList.add('hidden');
  fadeOutElem.classList.add('hidden');
})
closeApplyPopUp.addEventListener('click', () => {
  applyPopUp.classList.add('hidden');
  fadeOutElem.classList.add('hidden');
})

/*
function closePopUpAuto(popUpClass) {
  document.querySelectorAll(`main *:not(${popUpClass}):not(.contact-us-container):not(.find-tutor-button):not(.footer-button)`)
    .forEach(element => {
      element.addEventListener('click', () => {
        document.querySelector(popUpClass).classList.add('hidden');
        console.log(document.querySelector(popUpClass).classList)
        console.log(element);
      })
    })
}

closePopUpAuto('.apply-popup');
closePopUpAuto('.interested-popup');
*/