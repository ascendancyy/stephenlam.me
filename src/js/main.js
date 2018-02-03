// styling
import loadFonts from 'src/js/loadFonts';

import 'normalize.css';
import 'critical/main.scss';
import 'waves/waves.scss';

loadFonts();

const PRODUCTION = process.env.NODE_ENV === 'production';

if (PRODUCTION) {
  import(/* webpackChunkName: "ga" */ 'src/js/ga')
    .then(analytics => analytics.default());
}

if (PRODUCTION) {
  // eslint-disable-next-line global-require
  const runtime = require('offline-plugin/runtime');
  runtime.install({
    onInstalled: () => {
      // TODO: Indicate site is available offline
    },
    onUpdateReady: () => {
      // Tells to new SW to take control immediately
      runtime.applyUpdate();
    },
    onUpdated: () => {
      // TODO: Too obtrusive. Inform user to reload instead of forcing a reload
      window.location.reload();
    },
  });
}

