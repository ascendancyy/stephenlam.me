// styling
import 'normalize.css';
import 'critical/main.scss';
import 'waves/waves.scss';
import 'src/js/fonts';

// flow
import 'src/js/flow/flow';
import 'src/js/flow/caption';

// misc
import 'src/js/blink';

const PRODUCTION = process.env.NODE_ENV === 'production';

if (PRODUCTION) {
  import(/* webpackChunkName: "ga" */ 'src/js/ga')
    .then(analytics => analytics.init());
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

