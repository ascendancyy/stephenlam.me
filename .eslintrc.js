module.exports = {
  settings: {
    'import/extensions': ['.js'],
    'import/resolver': {
      webpack: {
        config: 'configs/webpack.base.js',
      },
    },
  },
  extends: [
    'airbnb-base',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    allowImportExportEverywhere: true,
  },
  rules: {
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'operator-linebreak': ['warn', 'after'],

    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'no-unused-vars': 'warn',
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'acc', // for reduce accumulators
        'el', // for el.style
      ],
    }],

    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
    }],
    'import/extensions': ['error', 'always', {
      js: 'never',
    }],
  },
};
