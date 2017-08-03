// polyfills
import Promise from 'promise-polyfill';
if (!window.Promise) {
  window.Promise = Promise;
}

// styling
import 'normalize.css';
import 'scss/waves.scss';
import 'src/js/fonts';

// the rest
import 'src/js/ascii';
import 'src/js/flow';
