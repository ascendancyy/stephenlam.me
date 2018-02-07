import FontFaceObserver from 'fontfaceobserver/fontfaceobserver.standalone';
import { addClass } from 'src/js/utils';

const fonts = [
  new FontFaceObserver('FuturaBT-Medium'),
  new FontFaceObserver('FuturaBT-Bold'),
];

async function loadFonts() {
  const fontsLoaded = JSON.parse(sessionStorage.getItem('dotme:fonts-loaded')) || false;
  if (fontsLoaded) {
    addClass(document.body, 'fonts-loaded');
    return;
  }

  const timeout = 3000;
  await Promise.all(fonts.map(font => font.load(null, timeout)));
  addClass(document.body, 'fonts-loaded');

  sessionStorage.setItem('dotme:fonts-loaded', JSON.stringify(true));
}

export { loadFonts as default };
