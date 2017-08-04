import FontFaceObserver from 'fontfaceobserver';

import { addClass, inlineStyles } from 'src/js/util';

const playfairDisplay = new FontFaceObserver('Playfair Display', {
  style: 'italic',
  weight: 700
});

const ptSans = new FontFaceObserver('PT Sans', {
  style: 'normal',
  weight: 400
});

function loadFonts () {
  Promise.all([playfairDisplay.load(), ptSans.load()])
    .then(() => addClass(document.body, 'fonts-loaded'));

  Promise.all([
    // eslint-disable-next-line max-len
    inlineStyles('https://fonts.googleapis.com/css?family=Playfair+Display:400,700,700i,900i'),
    inlineStyles('https://fonts.googleapis.com/css?family=PT+Sans')
  ]);
}

loadFonts();
