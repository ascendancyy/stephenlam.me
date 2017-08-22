function setFontClass () {
  const fonts = [
    new FontFaceObserver('Open Sans', { weight: 400 }),
    new FontFaceObserver('Open Sans', { weight: 700 }),
    new FontFaceObserver('Roboto Mono', { weight: 400 })
  ];

  Promise.all(fonts.map(font => font.load(null, 4000)))
    .then(() => document.body.classList.add('fonts-loaded'))
    .then(() => sessionStorage.setItem('fonts-loaded', JSON.stringify(true)))
    .catch(() => console.log('Font did not load after 4 seconds'));
}

setFontClass();
