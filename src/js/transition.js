import once from 'lodash.once';
import { addClass, removeClass, nextFrame } from 'src/js/util';

const DEVELOPMENT = process.env.NODE_ENV === 'development';

export function whenTransitionEnds (elm, expectedType, callback) {
  const {
    type,
    timeout,
    propCount
  } = getTransitionInfo(elm, expectedType);

  if (!type) {
    return callback();
  }

  const eventName = type === 'transition' ? 'transitionend' : 'animationend';
  let ended = 0;

  function end () {
    elm.removeEventListener(eventName, onEnd);
    callback();
  }

  function onEnd (event) {
    if (event.target === elm) {
      if (++ended >= propCount) {
        end();
      }
    }
  };

  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  elm.addEventListener(eventName, onEnd);
}

export function getTransitionInfo (elm, expectedType) {
  const styles = window.getComputedStyle(elm),
        tranDelays = styles.transitionDelay.split(', '),
        tranDurations = styles.transitionDuration.split(', '),
        tranTimeout = getTimeout(tranDelays, tranDurations),
        animDelays = styles.animationDelay.split(', '),
        animDurations = styles.animationDuration.split(', '),
        animTimeout = getTimeout(animDelays, animDurations);

  let type,
      timeout = 0,
      propCount = 0;

  if (expectedType === 'transition') {
    if (tranTimeout > 0) {
      type = 'transition';
      timeout = tranTimeout;
      propCount = tranDurations.length;
    }
  } else if (expectedType === 'animation') {
    if (animTimeout > 0) {
      type = 'animation';
      timeout = animTimeout;
      propCount = animDurations.length;
    }
  } else {
    timeout = Math.max(tranTimeout, animTimeout);
    type = timeout > 0 ?
      tranTimeout > animTimeout ?
        'transition' :
        'animation' :
      null;
    propCount = type ?
      type === 'transition' ?
        tranDurations.length :
        animDurations.length :
      0;
  }

  return {
    type,
    timeout,
    propCount
  };
}

function getTimeout (delays, durations) {
  while (delays.length < durations.length) {
    // eslint-disable-next-line no-param-reassign
    delays = delays.concat(delays);
  }

  return Math.max(...durations.map(function maxDuration (duration, index) {
    return toMs(duration) + toMs(delays[index]);
  }));
}

function toMs (delay) {
  return Number(delay.slice(0, -1)) * 1000;
}

function cached (func) {
  const cache = Object.create(null);

  return function cachedFunc (key) {
    const hit = cache[key];
    if (hit) {
      return hit;
    }

    cache[key] = func(key);

    return cache[key];
  };
}

const names = cached(name => ({
  enter: `${name}-enter`,
  enterTo: `${name}-enter-to`,
  enterActive: `${name}-enter-active`,
  leave: `${name}-leave`,
  leaveTo: `${name}-leave-to`,
  leaveActive: `${name}-leave-active`
}));

// eslint-disable-next-line object-curly-newline
export function enter (name, element, { type, duration, display, callback }) {
  const start = performance.now();

  const {
    enter: enterClass,
    enterTo,
    enterActive,
    leave: leaveClass = '',
    leaveTo = '',
    leaveActive = ''
  } = typeof name === 'string' ? names(name) : name;

  DEVELOPMENT && console.groupCollapsed(`Enter ${enterClass}`);
  DEVELOPMENT && console.log(element);
  DEVELOPMENT && console.groupEnd();

  removeClass(element, leaveClass);
  removeClass(element, leaveTo);
  removeClass(element, leaveActive);

  const onEnd = once(() => {
    if (DEVELOPMENT) {
      const delta = performance.now() - start;
      console.log(`Enter ${enterClass} done after ${delta}`);
    }

    removeClass(element, enterTo);
    removeClass(element, enterActive);
    callback && callback();
  });

  addClass(element, enterClass);
  addClass(element, enterActive);

  return new Promise(resolve => {
    nextFrame(() => {
      addClass(element, enterTo);
      removeClass(element, enterClass);

      if (duration) {
        resolve(setTimeout(onEnd, duration));
      } else {
        resolve(whenTransitionEnds(element, type, onEnd));
      }
    });

    display && display();
  });
}

// eslint-disable-next-line object-curly-newline
export function leave (name, element, { type, duration, display, callback }) {
  const start = performance.now();

  const {
    enter: enterClass = '',
    enterTo = '',
    enterActive = '',
    leave: leaveClass,
    leaveTo,
    leaveActive
  } = typeof name === 'string' ? names(name) : name;

  DEVELOPMENT && console.groupCollapsed(`Leave ${leaveClass}`);
  DEVELOPMENT && console.log(element);
  DEVELOPMENT && console.groupEnd();

  removeClass(element, enterClass);
  removeClass(element, enterTo);
  removeClass(element, enterActive);

  const onEnd = once(() => {
    if (DEVELOPMENT) {
      const delta = performance.now() - start;
      console.log(`Leave ${leaveClass} done after ${delta}`);
    }

    removeClass(element, leaveTo);
    removeClass(element, leaveActive);
    callback && callback();
    display && display();
  });

  addClass(element, leaveClass);
  addClass(element, leaveActive);

  return new Promise(resolve => {
    nextFrame(() => {
      addClass(element, leaveTo);
      removeClass(element, leaveClass);

      if (duration) {
        resolve(setTimeout(onEnd, duration));
      } else {
        resolve(whenTransitionEnds(element, type, onEnd));
      }
    });
  });
}

export function done (element, type, {
  callback,
  useEvent,
  recursive = {},
  scale = 1
}) {
  /* eslint-disable object-curly-newline */
  const {
    propCount,
    timeout: parentTimeout = -1
  } = getTransitionInfo(element, type);
  /* eslint-enable object-curly-newline */

  const { depth } = recursive;

  let timeoutScaled = Math.max(parentTimeout, 1) * scale;

  /* eslint-disable newline-before-return */
  if (!propCount || useEvent || depth) {
    if (useEvent && !depth) {
      element.removeEventListener(`${type}end`, callback);
      element.addEventListener(`${type}end`, callback, { once: true });

      DEVELOPMENT && console.group(`${type}end`);
      DEVELOPMENT && console.log(element);
      DEVELOPMENT && console.groupEnd();

      return Promise.resolve(-1);
    }

    const timeout = getLongestTimeout(element, type, depth || 0);
    timeoutScaled = Math.max(timeout, 1) * scale;
  }

  DEVELOPMENT && console.group(`Done ${timeoutScaled.toFixed(2)}`);
  DEVELOPMENT && console.log(element);
  DEVELOPMENT && console.groupEnd();

  return Promise.resolve(setTimeout(callback, timeoutScaled));
  /* eslint-enable newline-before-return */
}

function getLongestTimeout (element, type, depth = 0, start = true) {
  DEVELOPMENT && start && console.groupCollapsed('Searching timeout:', element);
  const { timeout: initial = -1 } = getTransitionInfo(element, type);

  const longest = Array.from(element.children).reduce((max, child) => {
    const { timeout: childTimeout } = getTransitionInfo(child, type);
    if (element.children && element.children.length > 0 && depth > 0) {
      return Math.max(
        max, childTimeout,
        getLongestTimeout(child, type, depth - 1, false)
      );
    }

    return Math.max(max, childTimeout);
  }, initial);

  if (DEVELOPMENT) {
    console.log(`(${depth}) Timeout ${initial.toFixed(2)}:`, element);
    start && console.groupEnd();
  }

  return longest;
}
