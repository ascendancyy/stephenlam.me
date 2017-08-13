const DEVELOPMENT = process.env.NODE_ENV === 'development';

export { hsvToRgb } from 'src/js/color';

export const raf = window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   function raf (callback) { return setTimeout(callback, 16); };

export const cancelRaf = window.cancelAnimationFrame ||
                         window.webkitCancelAnimationFrame ||
                         window.mozCancelAnimationFrame ||
                         window.msCancelAnimationFrame ||
                         clearTimeout;

export function nextFrame (func) {
  return raf(function frame () {
    raf(func);
  });
}

export function viewport () {
  const docElm = document.documentElement;

  return {
    width: Math.max(docElm.clientWidth, window.innerWidth || 0),
    height: Math.max(docElm.clientHeight, window.innerHeight || 0)
  };
}

let rng = Math.random;
DEVELOPMENT && import(/* webpackChunkName: "devdeps" */ 'seedrandom')
  .then(seedrandom => rng = seedrandom('2501'));

export function random (lower = 0, upper = 1) {
  return rng() * (upper - lower) + lower;
}

export function addClass (elm, cls) {
  // eslint-disable-next-line no-param-reassign, no-cond-assign
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  if (elm.classList) {
    if (cls.indexOf(' ') > -1) {
      // eslint-disable-next-line id-length
      cls.split(/\s+/).forEach(c => elm.classList.add(c));
    } else {
      elm.classList.add(cls);
    }
  } else {
    const cur = ` ${elm.getAttribute('class') || ''} `;
    if (cur.indexOf(` ${cls} `) < 0) {
      elm.setAttribute('class', (cur + cls).trim());
    }
  }
}

export function removeClass (elm, cls) {
  // eslint-disable-next-line no-param-reassign, no-cond-assign
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  if (elm.classList) {
    if (cls.indexOf(' ') > -1) {
      // eslint-disable-next-line id-length
      cls.split(/\s+/).forEach(c => elm.classList.remove(c));
    } else {
      elm.classList.remove(cls);
    }
    if (!elm.classList.length) {
      elm.removeAttribute('class');
    }
  } else {
    let cur = ` ${elm.getAttribute('class') || ''} `;
    const tar = ` ${cls} `;
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      elm.setAttribute('class', cur);
    } else {
      elm.removeAttribute('class');
    }
  }
}

export function style (element, property) {
  return window.getComputedStyle(element).getPropertyValue(property);
}

export function inlineStyles (url, callback) {
  return new Promise(function request (resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ready () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const styleElm = document.createElement('style');

        styleElm.innerHTML = xhr.responseText;
        document.head.appendChild(styleElm);
        callback && (styleElm.onload = callback);
        resolve();
      }
    };

    xhr.onerror = reject;
    xhr.open('GET', url, true);
    xhr.send();
  });
}

export function loadStyles (url, callback) {
  return new Promise(function request (resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.returnType = 'text';
    xhr.onreadystatechange = function ready () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
        callback && (link.onload = callback);
        resolve();
      }
    };

    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.send();
  });
}
