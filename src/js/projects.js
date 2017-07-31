import {
  removeClass,
  nextFrame,
  raf,
  viewport
} from 'src/js/util';

import { enter, leave, done } from 'src/js/transition.js';
import clamp from 'lodash.clamp';

// sass-extract-loader imports the sass variables
import TIMING from 'scss/_animation.variables.scss';

const { value: $toggle } = TIMING.global.$toggle,
      { value: projectsTiming } = $toggle.projects,
      projectsDelay = Number(projectsTiming.delay.value) || 0,
      { value: linksTiming } = $toggle.links,
      linksDelay = Number(linksTiming.delay.value) || 0,
      linksTimeout = Number(linksTiming.duration.value) + linksDelay;

// Need to recalculate the delay from the children once the DOM is ready.
let projectsTimeout = Number(projectsTiming.duration.value) + projectsDelay;

{
  const offset = TIMING.global['$toggle-offset'];

  window.addEventListener('DOMContentLoaded', function DOMLoaded () {
    done(links, 'animation', {
      useEvent: true,
      callback () { removeClass(links, 'links--animate'); }
    });

    const projects = Array.from(document.getElementsByClassName('project'));
    projects.forEach((project, index) => {
      const value = offset.unit === 's' ?
        offset.value * 1000 :
        offset.value;

      const mdelay = `${(index + 0) * value}ms`;
      project.style.transitionDelay = mdelay;

      // Delay is set to inherit which works most of the time.
      // We need all of the time though...
      project.firstElementChild
        .style.transitionDelay = mdelay;
      project.firstElementChild.firstElementChild
        .style.transitionDelay = mdelay;
    });

    const range = Array.from({ length: projects.length });
    // eslint-disable-next-line id-length
    projectsTimeout += range.reduce((max, _, index) =>
      Math.max(index * offset.value, max), 0);
  });
}

// ======
// helper
// ======

function getSelection () {
  return document.selection || !window.getSelection().isCollapsed;
}

function bindEvents () {
  if (touchEnabled) {
    modal.addEventListener(events.up, up, true);
    projectsList.addEventListener(events.down, down, true);
    modal.addEventListener(events.move, move, true);
  }

  if (!touchEnabled) {
    modalBackdrop.addEventListener('click', hideProjects, { once: true });
  }
}

function unbindEvents () {
  if (touchEnabled) {
    modal.removeEventListener(events.up, up, true);
    projectsList.removeEventListener(events.down, down, true);
    modal.removeEventListener(events.move, move, true);
  }
}

function resetCanvasBlur (value = '', transitionValue = '') {
  if (supportsBlur) {
    canvas.style.transition = transitionValue;
    nextFrame(() => {
      canvas.style.filter = value;
      canvas.style.webkitFilter = value;
    });
  }
}

function resetModalBackdrop () {
  modalBackdrop.style.transition = '';
  modalBackdrop.style.opacity = '';
}

function resetProjectsList () {
  projectsList.style.transition = '';
  projectsList.style.transform = '';
  projectsList.style.willChange = '';
}

function reset () {
  isDown = false;
  scrolling = false;
  swiping = false;
  swiped = false;
  swipeStart = performance.now();
  deltaX = 0;
  firstMove = false;
  moved = false;
}


// ======
// shared
// ======

const supportsBlur = (function supportsBlur () {
  const blur = document.createElement('div'),
        value = 'blur(1px)';

  blur.style.filter = value;
  blur.style.webkitFilter = value;

  return blur.style.filter === value || blur.style.webkitFilter === value;
})();

const touchEnabled = 'ontouchstart' in window ||
                      navigator.maxTouchPoints;

const events = touchEnabled ? {
  down: 'touchstart',
  up: 'touchend',
  move: 'touchmove'
} : {
  down: 'mousedown',
  up: 'mouseup',
  move: 'mousemove'
};

let showingWorks = false,
    swipeRaf,
    showProjectsTimeoutId,
    upAnimationDoneId,
    showLinksTimeoutId;

const start = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

const swipedLeftNames = {
  leave: 'projects--swiped-left',
  leaveTo: 'projects--swiped-left-to',
  leaveActive: 'projects--swiped-left-active'
};

const swipedRightNames = {
  leave: 'projects--swiped-right',
  leaveTo: 'projects--swiped-right-to',
  leaveActive: 'projects--swiped-right-active'
};

let selection,
    isDown = false,
    scrolling = false,
    swiping = false,
    swiped = false,
    swipeStart = 0,
    deltaX = 0,
    firstMove = false,
    moved = false;

const swipeThreshold = 0.35,
      swipedTimeout = 120,
      blurAmount = clamp(viewport().width * 0.0094 + 2, 5, 12);

const worksLink = document.getElementById('works'),
      links = document.querySelector('.links'),
      header = document.querySelector('.header'),

      canvas = document.querySelector('.canvas'),

      projectsList = document.querySelector('.projects'),

      modal = document.querySelector('.modal'),
      modalBackdrop = document.querySelector('.modal__backdrop');


// ======
// events
// ======

function down (event) {
  const { touches } = event;
  selection = getSelection();

  if (touches && touches.length > 1 || selection) {
    return;
  }

  reset();
  resetProjectsList();
  isDown = true;

  ({ clientX: start.x, clientY: start.y } = touches ? touches[0] : event);
  ({ width: start.width, height: start.height } = viewport());

  projectsList.style.willChange = 'transform';
  modalBackdrop.style.transition = 'none';
  canvas.style.transition = 'none';
}

function move (event) {
  if (!isDown || scrolling) {
    return;
  }

  const { touches } = event,
        { clientX, clientY } = touches ? touches[0] : event;

  deltaX = clientX - start.x;

  if (!moved) {
    moved = Math.abs(deltaX) >= start.width * 0.06 ||
            Math.abs(clientY - start.y) >= start.height * 0.05;
  }

  if (moved && !scrolling && !swiping) {
    const ratio = Math.abs((clientY - start.y) / deltaX);

    if (ratio > 1) {
      scrolling = true;
    } else {
      swiping = true;

      if (!firstMove) {
        swipeStart = performance.now();
      }
      firstMove = true;
    }
  } else if (swiping) {
    event.preventDefault();

    const percent = Math.max(1 - Math.abs(deltaX / start.width) * 1.2, 0);

    swipeRaf && cancelAnimationFrame(swipeRaf);
    swipeRaf = raf(() => {
      projectsList.style.transform = `translateX(${deltaX}px)`;
      modalBackdrop.style.opacity = percent;

      if (supportsBlur) {
        canvas.style.filter = `blur(${blurAmount * percent}px)`;
        canvas.style.webkitFilter = `blur(${blurAmount * percent}px)`;
      }
    });
  }
}

// eslint-disable-next-line id-length
function up (event) {
  if (!isDown) {
    return;
  }

  isDown = false;

  const progress = Math.abs(deltaX / start.width);
  swiped = progress >= swipeThreshold ||
           (performance.now() - swipeStart < swipedTimeout &&
            progress > 0.1);

  resetModalBackdrop();
  if (swiped) {
    upAnimationDoneId && clearTimeout(upAnimationDoneId);
    upAnimationDoneId = done(modal, 'transition', {
      scale: 0.88,
      callback: upAnimationDone
    });
    resetCanvasBlur();

    const classNames = deltaX >= 0 ? swipedRightNames : swipedLeftNames;
    leave(classNames, modal, {
      type: 'transition',
      duration: 420,
      display: () => modal.style.display = 'none',
      callback () {
        modalBackdrop.style.willChange = '';
        canvas.style.willChange = '';
      }
    });
  } else {
    resetCanvasBlur(`blur(${blurAmount}px)`, '');
    const transition = 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    projectsList.style.transition = transition;

    done(projectsList, 'transition', {
      useEvent: true,
      callback () { projectsList.style.transition = ''; }
    });

    nextFrame(() => {
      projectsList.style.transform = '';
    });
  }
}

// ==========
// animations
// ==========

function upAnimationDone () {
  resetProjectsList();

  if (swiped) {
    hideProjects();
  }

  reset();
}

function showProjects () {
  if (supportsBlur) {
    canvas.style.filter = `blur(${blurAmount}px)`;
    canvas.style.webkitFilter = `blur(${blurAmount}px)`;
  }

  enter('projects-', modal, {
    type: 'transition',
    duration: projectsTimeout,
    display: () => modal.style.display = ''
  });
}

function hideProjects () {
  if (!showingWorks) {
    return;
  }

  showingWorks = false;
  unbindEvents();

  function showLinks () {
    enter('links-', links, {
      type: 'transition',
      duration: linksTimeout,
      display () {
        if (!showingWorks) {
          links.style.display = '';
        }
      }
    });
  };

  if (!swiped) {
    resetCanvasBlur();

    leave('projects-', modal, {
      type: 'transition',
      duration: projectsTimeout,
      display: () => modal.style.display = 'none',
      callback () {
        modalBackdrop.style.willChange = '';
        canvas.style.willChange = '';
      }
    });

    done(modal, 'transition', {
      recursive: { depth: 4 },
      scale: 0.2,
      callback () {
        removeClass(header, 'header--hidden');
        showLinks();
      }
    });
  } else {
    removeClass(header, 'header--hidden');
    showLinks();
  }
}

// =====
// setup
// =====

function selectionChange (event) {
  if (isDown) {
    selection = getSelection();
    if (selection) {
      isDown = false;
    }
  }
}

function click () {
  showingWorks = !showingWorks;

  showLinksTimeoutId && showLinksTimeoutId.then(clearTimeout);
  showProjectsTimeoutId && showProjectsTimeoutId.then(clearTimeout);

  if (showingWorks) {
    header.classList.add('header--hidden');

    showLinksTimeoutId = leave('links-', links, {
      type: 'transition',
      duration: linksTimeout,
      display () {
        if (showingWorks) {
          links.style.display = 'none';
        }
      }
    });

    showProjectsTimeoutId = done(header, 'transition', {
      scale: 0.12,
      callback: () => {
        if (showingWorks) {
          showProjects();
          bindEvents();
        }
      }
    });
  } else {
    header.classList.remove('header--hidden');

    enter('links-', links, {
      type: 'transition',
      duration: linksTimeout,
      display () {
        if (!showingWorks) {
          links.style.display = '';
        }
      }
    });

    hideProjects();
  }
}

document.addEventListener('selectionchange', selectionChange);
worksLink.addEventListener('click', click);
worksLink.addEventListener('mousedown', function prep () {
  modalBackdrop.style.willChange = 'opacity';
  canvas.style.willChange = 'filter';
});


// ============
// project data
// ============

export const projectData = [];

const context = require.context('../projects', false, /\.json$/);
context.keys().forEach(function loader (key) {
  const project = context(key);
  projectData[project.order] = project;
});
