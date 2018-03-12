'use strict';

const env = process.env.BABEL_ENV;

const presets = ['@babel/flow', '@babel/react'];
const plugins = ['@babel/plugin-syntax-class-properties', ['@babel/plugin-proposal-class-properties', {loose: true}]];

if (env === 'local') {
  presets.push.apply(presets, [
    ['@babel/preset-stage-1'],
    [
      '@babel/env',
      {
        targets: {
          browsers: ['> 1% in JP'],
          modules: false,
          useBuiltIns: 'usage',
        },
      },
    ],
  ]);
  plugins.push.apply(plugins, ['react-hot-loader/babel']);
}

if (env === 'test') {
  presets.push.apply(presets, [
    '@babel/preset-stage-1',
    [
      '@babel/env',
      {
        targets: {node: '8.9'},
        modules: false,
        useBuiltIns: 'usage',
      },
    ],
  ]);
}

if (env === 'development') {
  presets.push.apply(presets, [
    '@babel/preset-stage-1',
    [
      '@babel/env',
      {
        targets: {
          browsers: ['> 1% in JP'],
          modules: false,
          useBuiltIns: 'usage',
        },
      },
    ],
  ]);
}

if (env === 'production') {
  presets.push.apply(presets, [
    '@babel/preset-stage-1',
    [
      '@babel/env',
      {
        targets: {
          browsers: ['> 1% in JP'],
          modules: false,
          useBuiltIns: 'usage',
        },
      },
    ],
  ]);
}

module.exports = {presets, plugins};
