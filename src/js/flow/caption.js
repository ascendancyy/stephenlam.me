import { raf, cancelRaf } from 'src/js/util';

let gap = 2;
let resizeRaf;

const plate = document.querySelector('.plate');
const header = document.querySelector('.header');
const flowCaption = document.querySelector('.flow__caption');

function moveFlowCaption() {
  if (gap !== -1) {
    flowCaption.style.opacity = '1';
    flowCaption.style.top = `${gap / 2}px`;
  } else {
    flowCaption.style.opacity = '0';
  }
}

function windowResize() {
  const padding = 28;
  const rect = plate.getBoundingClientRect();
  const { height: headerSize } = header.getBoundingClientRect();
  const { height } = flowCaption.getBoundingClientRect();
  gap = rect.top - headerSize;
  if (height + padding >= gap) {
    gap = -1;
  }

  if (resizeRaf) {
    cancelRaf(resizeRaf);
  }
  resizeRaf = raf(moveFlowCaption);
}

window.addEventListener('load', windowResize, { once: true });
window.addEventListener('resize', windowResize, { passive: true });
