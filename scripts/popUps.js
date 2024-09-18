contactUsButton = document.querySelector('.contact-us-container');
interestedButton = document.querySelector('.find-tutor-button');

interestedPopUp = document.querySelector('.interested-popup')
closeInterestedPopUp = document.querySelector('.interested-popup .close-popup')

buttonsList = [contactUsButton, interestedButton];

buttonsList.forEach(button => {
  button.addEventListener('click', () => {
    interestedPopUp.classList.remove('hidden')
  })
})

closeInterestedPopUp.addEventListener('click', () => {
  interestedPopUp.classList.add('hidden');
})