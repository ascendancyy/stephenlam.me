import FontFaceObserver from 'fontfaceobserver';

import { addClass, inlineStyles } from 'src/js/util';

function loadFonts () {
  const playfairDisplay = new FontFaceObserver('Playfair Display');
  const ptSans = new FontFaceObserver('PT Sans');

  Promise.all([playfairDisplay.load(), ptSans.load()])
    .then(() => { addClass(document.body, 'fonts-loaded'); });

  Promise.all([
    // eslint-disable-next-line max-len
    inlineStyles('https://fonts.googleapis.com/css?family=Playfair+Display:400,700,700i,900i'),
    inlineStyles('https://fonts.googleapis.com/css?family=PT+Sans')
  ]);
}

loadFonts();
