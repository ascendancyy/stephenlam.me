import { addClass, raf, viewport, random } from 'src/js/util';
import { getFlowColor } from 'src/js/color';

// =================
// shared references
// =================

const {
  abs,
  sin,
  cos
} = Math;

// The sin of milliseconds divised by ~318 will equal to 1 turn per second.
const PER_SECOND = 318.571085;

const pixelRatio = window.devicePixelRatio || 1,
      reduceMotion = matchMedia('(prefers-reduced-motion)').matches;

const canvas = document.createElement('canvas');

const fallback = document.createElement('div');
addClass(fallback, 'canvas__fallback');

addClass(canvas, 'canvas');
canvas.appendChild(fallback);
document.body.appendChild(canvas);

// TODO: Improve error handling
let ctx;
try {
  ctx = canvas.getContext('2d');
} catch (error) {
  console.log(error);
}

let { width: parentWidth, height: parentHeight } = viewport();
const initialHeight = parentHeight;

function resizeCanvas (event) {
  const { width, height } = viewport();

  parentWidth = width;
  parentHeight = height;

  canvas.width = parentWidth;
  canvas.height = parentHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const directions = ['x', 'y'];


// =======
// helpers
// =======

const getSpace = {
  x (deviation, previous = 0) {
    const { min = 10, max = 100 } = deviation;
    const space = Math.min(Math.max(parentWidth * 0.064, min), max);

    return Math.floor(random(1, 2) * space) + previous;
  },

  y (deviation, previous = 0) {
    const { min = 10, max = 100 } = deviation;

    let next = random(0, 0.64) * initialHeight + max;
    let delta = next - previous;

    while (abs(delta) > max || abs(delta) <= min) {
      next = random(0, 0.64) * initialHeight + max;
      delta = next - previous;
    }

    return Math.floor(next);
  }
};

function pointIsVisible (x) { return x < parentWidth; }

// ==============
// flow instances
// ==============

function *createPoints (deviation, lastPoint) {
  const last = {
    x: lastPoint.x,
    y: lastPoint.y
  };

  const padding = getSpace.x(deviation.x);
  while (last.x < parentWidth + padding) {
    directions.forEach(axis =>
      last[axis] = getSpace[axis](deviation[axis], last[axis]));

    yield Object.assign({}, last, {
      visible: true,
      variance: {
        progress: 0,
        x: random(0.5, 1),
        y: random(0.008, 0.064)
      }
    });
  }
}

function *initialPoints (deviation) {
  const x = 0,
        y = initialHeight * random(0.4, 0.5);

  yield {
    x,
    y,
    visible: true,
    variance: {
      progress: 0,
      x: undefined,
      y: random(0.008, 0.064)
    }
  };

  yield {
    x,
    y: getSpace.y(deviation.y, y),
    visible: true,
    variance: {
      progress: 0,
      x: undefined,
      y: random(0.008, 0.064)
    }
  };
}

function createFlow (deviation) {
  const region = {
    top: initialHeight,
    bottom: 0
  };

  function addPoints () {
    const lastPoint = points[points.length - 1];
    if (lastPoint.x > parentWidth + 10) {
      return;
    }
    const newPoints = Array.from(createPoints(deviation, lastPoint));
    points.push(...newPoints);
  }

  const points = Array.from(initialPoints(deviation));
  addPoints();

  window.addEventListener('resize', addPoints);

  return {
    points,
    region
  };
}

const flows = [
  {
    alpha: 0.64,
    speed: Math.PI * 1.61803398875,
    deviation: {
      x: {
        min: 30,
        max: 300
      },
      y: {
        min: 25,
        max: 190
      }
    }
  }
].map(object => Object.assign(createFlow(object.deviation), object));

if (process.env.NODE_ENV === 'development') {
  window.flows = flows;
}

// =========
// animation
// =========

function clearRegion (region) {
  const padding = 16;
  const height = region.bottom - region.top;
  ctx.clearRect(0, region.top - padding, parentWidth, height + (padding * 2));
}

function drawTriangle (context, points) {
  context.beginPath();
  points.forEach(function drawLine (point, index) {
    const action = index === 0 ? 'moveTo' : 'lineTo';
    ctx[action](point.x, point.y);
  });
  context.closePath();
}

function updateTriangle (points, computed, end, speed) {
  let min = Number.MAX_SAFE_INTEGER,
      max = Number.MIN_SAFE_INTEGER;

  const trPoints = [end - 2, end - 1, end];
  const triangle = trPoints.reduce(function setPoint (collect, ptIdx, rdIdx) {
    const point = points[ptIdx];
    let { x: pointX } = point,
        pointY = computed[ptIdx];

    if (!pointY) {
      pointY = point.y +
               (point.variance.y * point.variance.progress * initialHeight);
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
        const now = performance.now();
        progress = sin(now / PER_SECOND / speed / 4 + cos(ptIdx)) * 0.25 + 0.75;
      } else {
        horizontal = 1;
      }

      pointX = (point.x - middle.x) * horizontal * progress + middle.x;
      pointY = pointX * slope + intercept;
    }

    collect.push({
      x: pointX,
      y: pointY
    });

    return collect;
  }, []);

  return [triangle, [min, max]];
}

// eslint-disable-next-line object-curly-newline
function updatePoints ({ alpha, points, speed, region }) {
  const computed = [],
        now = performance.now();
  let color = sin(now / PER_SECOND / speed / 4);

  ctx.save();
  ctx.scale(1, parentHeight / initialHeight);

  clearRegion(region);
  region.top = Number.MAX_SAFE_INTEGER;
  region.bottom = Number.MIN_SAFE_INTEGER;

  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    const { visible } = point;

    if (!pointIsVisible(point.x)) {
      if (visible) {
        point.visible = false;
      }
    } else if (!visible) {
      point.visible = true;
    } else if (visible) {
      point.variance.progress = sin(now / PER_SECOND / speed + cos(index));
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

function tick () {
  flows.forEach(updatePoints);
  if (reduceMotion) {
    return;
  }
  raf(tick);
}


// ==========
// initialize
// ==========

// TODO: ugly.
'requestIdleCallback' in window ?
  ctx && requestIdleCallback(tick) :
  ctx && tick();
