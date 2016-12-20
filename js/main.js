var nav                 = document.querySelector('.social-nav'),
    spacer              = document.querySelector('.spacer'),
    navHeight           = nav.offsetHeight,

    lastScrollY         = 0,
    ticking             = false;

var cover = document.querySelector('.cover');
var style = cover.currentStyle || window.getComputedStyle(cover);
var coverHeight = cover.offsetHeight + parseInt(style.marginBottom, 10);

function windowLayout() {
   lastScrollY = window.scrollY;

   requestTick();
}

function requestTick() {
   if(!ticking) {
      requestAnimationFrame(update);
      ticking = true;
   }
}

function update() {
   if(lastScrollY > coverHeight) {
      spacer.classList.add('show');
      nav.classList.add('docked');
   } else {
      spacer.classList.remove('show');
      nav.classList.remove('docked');
   }

   ticking = false;
}

windowLayout();

window.addEventListener('scroll', windowLayout, false);
window.addEventListener('resize', windowLayout, false);
