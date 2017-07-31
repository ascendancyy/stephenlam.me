/*eslint no-param-reassign: "off"*/

export function linear (elapsed, initial, delta, duration) {
  return delta * elapsed / duration + initial;
}

export function easeInQuad (elapsed, initial, delta, duration) {
  elapsed /= duration;

  return delta * elapsed * elapsed + initial;
}

export function easeOutQuad (elapsed, initial, delta, duration) {
  elapsed /= duration;

  return -delta * elapsed * (elapsed - 2) + initial;
}

export function easeInOutQuad (elapsed, initial, delta, duration) {
  elapsed /= duration / 2;
  if (elapsed < 1) {
    return delta / 2 * elapsed * elapsed + initial;
  }
  elapsed--;

  return -delta / 2 * (elapsed * (elapsed - 2) - 1) + initial;
}

export function easeInExpo (elapsed, initial, delta, duration) {
  return delta * Math.pow(2, 10 * (elapsed / duration - 1)) + initial;
}

export function easeOutExpo (elapsed, initial, delta, duration) {
  return delta * (-Math.pow(2, -10 * elapsed / duration) + 1) + initial;
}

export function easeInOutExpo (elapsed, initial, delta, duration) {
  elapsed /= duration / 2;
  if (elapsed < 1) {
    return delta / 2 * Math.pow(2, 10 * (elapsed - 1)) + initial;
  }
  elapsed--;

  return delta / 2 * (-Math.pow(2, -10 * elapsed) + 2) + initial;
}
