let counter = 1;

let slideshowIntervalId = setInterval(() => {
  document.getElementById('radio' + counter).checked = true;
  counter++;
  if (counter > 3) {
    counter = 1;
  }
}, 15000);

document.querySelectorAll('.manual-btn')
  .forEach(value => {
    value.addEventListener('click', () => {
      clearInterval(slideshowIntervalId);
      const radioReferance = value.htmlFor;
      const buttonClicked = radioReferance.slice(-1);
      counter = (buttonClicked == 3) ? 1 : Number(buttonClicked) + 1;

      slideshowIntervalId = setInterval(() => {
        document.getElementById('radio' + counter).checked = true;
        counter++;
        if (counter > 3) {
          counter = 1;
        };
      }, 15000);
    });
  });