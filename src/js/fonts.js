import FontFaceObserver from 'fontfaceobserver'

import { loadStyles } from 'src/js/util'

export function loadFonts () {
  // eslint-disable-next-line
  const fontURL = 'https://fonts.googleapis.com/css?family=Roboto+Mono:400,700:latin'
  const libreFranklin = new FontFaceObserver('Roboto Mono')

  libreFranklin.load()
    .then(() => { document.documentElement.className += ' fonts-loaded' })

  Promise.all([loadStyles(fontURL)])
}
