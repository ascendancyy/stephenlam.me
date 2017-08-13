const PRODUCTION = process.env.NODE_ENV === 'production';

PRODUCTION && import(/* webpackChunkName: "ga" */ 'src/js/ga')
  .then(analytics => analytics.init());

// styling
import 'normalize.css';
import 'critical/main.scss';
import 'waves/waves.scss';
import 'src/js/fonts';

// the rest
import 'src/js/ascii';
import 'src/js/flow';
