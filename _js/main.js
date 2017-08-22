function loadFonts () {
  if (JSON.parse(sessionStorage.getItem('fonts-loaded'))) {
    document.body.classList.add('fonts-loaded');
  } else {
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/fontfaceobserver/2.0.13/fontfaceobserver.js',
      '/js/fonts.js'
    ];

    if (!('Promise' in window)) {
      scripts.unshift('https://cdnjs.cloudflare.com/ajax/libs/es6-promise/4.1.1/es6-promise.auto.min.js');
    }

    scripts.map(function loadScript (src) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
    });
  }
}

function initGA () {
  // Initialize the command queue in case analytics.js hasn't loaded yet.
  window.ga = window.ga || ((...args) => (ga.q = ga.q || []).push(args));

  ga('create', 'UA-88937605-2', 'auto');
  ga('set', 'transport', 'beacon');
  ga('send', 'pageview');
}

initGA();
loadFonts();
