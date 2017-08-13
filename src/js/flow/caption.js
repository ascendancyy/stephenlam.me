import { raf, cancelRaf } from 'src/js/util';

let gap = 2,
    resizeRaf;

const plate = document.querySelector('.plate'),
      header = document.querySelector('.header'),
      flowCaption = document.querySelector('.flow__caption');

function windowResize () {
  const padding = 28,
        rect = plate.getBoundingClientRect(),
        { height: headerSize } = header.getBoundingClientRect(),
        { height } = flowCaption.getBoundingClientRect();
  gap = rect.top - headerSize;
  if (height + padding >= gap) {
    gap = -1;
  }

  resizeRaf && cancelRaf(resizeRaf);
  resizeRaf = raf(moveFlowCaption);
}

function moveFlowCaption () {
  if (~gap) {
    flowCaption.style.opacity = '1';
    flowCaption.style.top = `${gap / 2}px`;
  } else {
    flowCaption.style.opacity = '0';
  }
}

window.addEventListener('load', windowResize, { once: true });
window.addEventListener('resize', windowResize, { passive: true });
