module.exports = {
  plugins: [
    '@babel/syntax-dynamic-import',
    ['@babel/transform-runtime', {
      polyfill: false,
      useBuiltIns: true,
      useESModules: true,
    }],
    'transform-undefined-to-void',
  ],
  presets: [
    ['@babel/preset-env', {
      debug: false,
      modules: false,
      useBuiltIns: 'usage',
      shippedProposals: true,
    }],
    ['@babel/preset-stage-3', { useBuiltIns: true }],
  ]
};
