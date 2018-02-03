import { raf, viewport, random } from 'src/js/util';
import { getFlowColor } from 'src/js/color';

const {
  abs,
  sin,
  cos,
  floor,
} = Math;

// =================
// shared references
// =================

let flowTime = 0;
let flowLastTime = 0;
let flowHover = false;

// The sin of milliseconds divided by ~318 will equal to 1 turn per second.
const PER_SECOND = 318.571085;
const pixelRatio = window.devicePixelRatio || 1;
const reduceMotion = matchMedia('(prefers-reduced-motion)').matches;

const canvas = document.querySelector('.flow__canvas');

canvas.addEventListener('mouseenter', () => {
  flowHover = true;
}, { passive: true });

canvas.addEventListener('mouseleave', () => {
  flowHover = false;
}, { passive: true });

let ctx;
try {
  ctx = canvas.getContext('2d');
  canvas.style.cursor = 'pointer';
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.log(error);
  }
}

let { width: parentWidth, height: parentHeight } = viewport();
const initialHeight = parentHeight;

function resizeCanvas() {
  const { width, height } = canvas.getBoundingClientRect();

  parentWidth = width;
  parentHeight = height;

  canvas.width = parentWidth * pixelRatio;
  canvas.height = parentHeight * pixelRatio;
}


// =======
// helpers
// =======

const getSpace = {
  x(deviation, previous = 0) {
    const { min = 10, max = 100 } = deviation;
    const space = Math.min(Math.max(parentWidth * 0.064, min), max);

    return floor(random(1, 2) * space) + previous;
  },

  y(deviation, previous = 0) {
    const { min = 10, max = 100 } = deviation;

    let next = (random(-0.5, 0.5) * initialHeight) + max;
    let delta = next - previous;

    while (abs(delta) > max ||
           abs(delta) <= min ||
           next <= 16 ||
           next >= initialHeight - 16) {
      next = (random(-0.5, 0.5) * initialHeight) + max;
      delta = next - previous;
    }

    return floor(next);
  },
};

function pointIsVisible(x) { return x < parentWidth + 16; }


// =========
// animation
// =========

function clearRegion(region) {
  const padding = 16;
  const height = region.bottom - region.top;
  ctx.clearRect(0, region.top - padding, parentWidth, height + (padding * 2));
}

function drawTriangle(context, points) {
  context.beginPath();
  points.forEach((point, index) => {
    const action = index === 0 ? 'moveTo' : 'lineTo';
    ctx[action](point.x, point.y);
  });
  context.closePath();
}

function updateTriangle(points, computed, end, speed) {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;

  const trPoints = [end - 2, end - 1, end];
  const triangle = trPoints.reduce((collect, ptIdx, rdIdx) => {
    const point = points[ptIdx];
    let { x: pointX } = point;
    let pointY = computed[ptIdx];

    if (!pointY) {
      pointY = point.y + (point.variance.y * point.variance.progress * initialHeight);
      computed[ptIdx] = pointY;
    }

    min = Math.min(min, pointY);
    max = Math.max(max, pointY);

    if (rdIdx === 2) {
      const [, middle] = collect;
      const slope = (pointY - middle.y) / (point.x - middle.x);
      const intercept = pointY - point.x * slope;

      let { x: horizontal } = point.variance;
      let progress = 1;
      if (horizontal) {
        const now = flowTime;
        progress = sin(now / PER_SECOND / speed / 4 + cos(ptIdx)) * 0.25 + 0.75;
      } else {
        horizontal = 1;
      }

      pointX = (point.x - middle.x) * horizontal * progress + middle.x;
      pointY = pointX * slope + intercept;
    }

    collect.push({
      x: pointX,
      y: pointY,
    });

    return collect;
  }, []);

  return [triangle, [min, max]];
}


// ==============
// flow instances
// ==============

function* createPoints(deviation, lastPoint) {
  const last = {
    x: lastPoint.x,
    y: lastPoint.y,
  };

  const padding = getSpace.x(deviation.x);
  while (last.x < parentWidth + padding) {
    ['x', 'y'].forEach((axis) => {
      last[axis] = getSpace[axis](deviation[axis], last[axis]);
    });

    yield Object.assign({}, last, {
      visible: true,
      variance: {
        progress: 0,
        x: random(0.5, 1),
        y: random(0.008, 0.064),
      },
    });
  }
}

function* initialPoints(deviation) {
  const x = 0;
  const y = initialHeight * random(0.5, 0.6);

  yield {
    x,
    y,
    visible: true,
    variance: {
      progress: 0,
      x: undefined,
      y: random(0.008, 0.064),
    },
  };

  yield {
    x,
    y: getSpace.y(deviation.y, y),
    visible: true,
    variance: {
      progress: 0,
      x: undefined,
      y: random(0.008, 0.064),
    },
  };
}

function createFlow(deviation) {
  const region = {
    top: initialHeight,
    bottom: 0,
  };

  const points = Array.from(initialPoints(deviation));

  function addPoints() {
    const lastPoint = points[points.length - 1];
    if (lastPoint.x > parentWidth + 10) {
      return;
    }
    const newPoints = Array.from(createPoints(deviation, lastPoint));
    points.push(...newPoints);
  }

  addPoints();

  window.addEventListener('resize', addPoints);

  return {
    points,
    region,
  };
}

const flows = [
  {
    alpha: 0.64,
    speed: Math.PI * 1.61803398875,
    deviation: {
      x: {
        min: 60,
        max: 300,
      },
      y: {
        min: 25,
        max: 200,
      },
    },
  },
].map(object => Object.assign(createFlow(object.deviation), object));

function updatePoints({
  alpha,
  points,
  speed,
  region,
}) {
  const start = performance.now();

  const delta = performance.now() - flowLastTime;
  const add = flowHover ? delta : delta * 0.4;

  flowTime += Math.min(add, 17.77);
  flowLastTime = start;

  const computed = [];
  let color = sin(flowTime / PER_SECOND / speed / 4);

  ctx.save();
  ctx.scale(pixelRatio, parentHeight / initialHeight * pixelRatio);

  clearRegion(region);
  region.top = Number.MAX_SAFE_INTEGER;
  region.bottom = Number.MIN_SAFE_INTEGER;

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const { visible } = point;

    if (!pointIsVisible(point.x)) {
      if (visible) {
        point.visible = false;
      }
    } else if (!visible) {
      point.visible = true;
    } else if (visible) {
      point.variance.progress = sin(flowTime / PER_SECOND / speed + cos(index));
    }

    if (index >= 2 && points[index - 2].visible) {
      const [triangle, minMax] = updateTriangle(points, computed, index, speed);
      region.top = Math.min(region.top, minMax[0]);
      region.bottom = Math.max(region.bottom, minMax[1]);

      drawTriangle(ctx, triangle);
      ctx.fillStyle = getFlowColor(color, alpha);
      ctx.fill();

      color -= 0.16;
    }
  }

  ctx.restore();
}

function updateAllFlows() {
  flows.forEach(updatePoints);
}

function respawnFlows(event) {
  event.preventDefault();
  ctx.clearRect(0, 0, parentWidth, parentHeight);
  flows.map(object => Object.assign(object, createFlow(object.deviation)));
}


// ==========
// initialize
// ==========

function tick() {
  updateAllFlows();
  if (reduceMotion) {
    return;
  }
  raf(tick);
}

if (ctx) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(tick);
  } else {
    tick();
  }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas, { once: true });

canvas.addEventListener('click', respawnFlows);
