// polyfills
import Promise from 'promise-polyfill';
if (!window.Promise) {
  window.Promise = Promise;
}
import 'web-animations-js';

// styling
import 'normalize.css';
import 'scss/waves.scss';
import 'src/js/fonts';

// the rest
import 'src/js/ascii';
import 'src/js/flow';
import 'src/js/theme';
