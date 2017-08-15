import { raf } from 'src/js/util';

const display = document.createComment('');
document.documentElement.insertBefore(display, document.head);

const frames = [
  'Bring <blink> back',
  // Prevent spaces from collapsing comment
  'Bring <\u00A0\u00A0\u00A0\u00A0\u00A0> back'
];

let head = 0,
    startTime = 0;

function tick (timestamp) {
  display.nodeValue = frames[head];

  const timeout = head === 0 ? 777 : 256;
  if (timestamp - startTime >= timeout) {
    head = ++head % frames.length;
    startTime = timestamp;
  }

  raf(tick);
}

'requestIdleCallback' in window ?
  requestIdleCallback(tick) :
  tick();
