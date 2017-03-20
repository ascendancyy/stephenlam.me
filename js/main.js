const book = new FontFaceObserver('FuturaBT-Book')
const medium = new FontFaceObserver('FuturaBT-Medium')
const bold = new FontFaceObserver('FuturaBT-Bold')

Promise.all([book.load(), medium.load(), bold.load()])
  .then(() => document.documentElement.classList.add('fonts-loaded'))
