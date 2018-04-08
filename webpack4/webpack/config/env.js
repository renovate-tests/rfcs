// external
const fs = require('fs');
const {Map} = require('immutable');

// internal
const paths = require('./paths');

// initialize
// dotenvを読み込んだ後にキャッシュを削除する。
delete require.cache[require.resolve('./paths')];
const NODE_ENV = process.env.NODE_ENV;

const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  NODE_ENV !== 'test' && `${paths.dotenv}.local`,
  paths.dotenv,
].filter(Boolean);

dotenvFiles.forEach(dotenvFile => {
  // dotenvから環境変数を読み込む
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      }),
    );
  }
});

const rawSeq = Map(process.env).keySeq();
const raw = rawSeq.reduce(
  (env, key) => {
    const newEnv = Map(env).set(key, process.env[key]);
    return newEnv.toJSON();
  },
  {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PUBLIC_URL: process.env.PUBLIC_URL || paths.publicUrl,
  },
);

const stringifiedSeq = Map(raw).keySeq();
const stringified = {
  'process.env': stringifiedSeq.reduce((env, key) => {
    const newEnv = Map(env).set(key, JSON.stringify(raw[key]));
    return newEnv.toJSON();
  }, {}),
};

module.exports = {
  raw,
  stringified,
};
