import FontFaceObserver from 'fontfaceobserver/fontfaceobserver.standalone';
import { addClass, inlineStyles } from 'src/js/util';

const fonts = [
  new FontFaceObserver('Lusitana', { weight: 700 }),
  new FontFaceObserver('Oxygen', { weight: 400 }),
  new FontFaceObserver('Oxygen', { weight: 300 }),
];

async function loadFonts() {
  inlineStyles('https://fonts.googleapis.com/css?family=Lusitana:700|Oxygen:300,400');

  const timeout = 5000;
  await Promise.all(fonts.map(font => font.load(null, timeout)));
  addClass(document.body, 'fonts-loaded');
}

export { loadFonts as default };
