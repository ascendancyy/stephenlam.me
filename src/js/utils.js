export function addClass(elm, cls) {
  // eslint-disable-next-line no-param-reassign, no-cond-assign
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  if (elm.classList) {
    if (cls.indexOf(' ') > -1) {
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

export function removeClass(elm, cls) {
  // eslint-disable-next-line no-param-reassign, no-cond-assign
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  if (elm.classList) {
    if (cls.indexOf(' ') > -1) {
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
