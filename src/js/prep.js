import { getFlowColor } from 'src/js/color';
import { random } from 'src/js/util';

window.addEventListener('DOMContentLoaded', () => {
  Array.from(document.getElementsByClassName('block')).forEach(block => {
    block.style.backgroundColor = getFlowColor(random(-5, 5), 1);
    block.addEventListener('animationend', function blocksHidden () {
      block.parentElement.removeChild(block);
    }, { once: true });
  });
});
