import FontFaceObserver from 'fontfaceobserver';

import { addClass, loadStyles } from 'src/js/util';

const fonts = {
  Lusitana: new FontFaceObserver('Lusitana', { weight: 700 }),
  Oxygen: new FontFaceObserver('Oxygen', { weight: 400 }),
  OxygenLight: new FontFaceObserver('Oxygen', { weight: 300 })
};

function loadFonts () {
  const timeout = 5000;
  Promise.all(Object.values(fonts).map(font => font.load(null, timeout)))
    .then(() => addClass(document.body, 'fonts-loaded'));

  Promise.all([
    loadStyles('https://fonts.googleapis.com/css?family=Lusitana:700'),
    loadStyles('https://fonts.googleapis.com/css?family=Oxygen:300,400')
  ]);
}

loadFonts();
