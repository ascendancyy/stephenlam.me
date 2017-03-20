const book = new FontFaceObserver('FuturaBT-Book')
const medium = new FontFaceObserver('FuturaBT-Medium')
const bold = new FontFaceObserver('FuturaBT-Bold')

const timeout = 5500

Promise.all([book.load(null, timeout), medium.load(null, timeout), bold.load(null, timeout)])
  .then(() => document.documentElement.classList.add('fonts-loaded'))
  .catch(() => console.log('Font did not load after 5 seconds'))
