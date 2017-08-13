const GA_ID = 'UA-88937605-1';

/* eslint-disable no-undef */
export function init () {
  // Initialize the command queue in case analytics.js hasn't loaded yet.
  window.ga = window.ga || ((...args) => (ga.q = ga.q || []).push(args));

  ga('create', GA_ID, 'auto');
  ga('set', 'transport', 'beacon');
  ga('send', 'pageview');
}
