const path = require('path');
const fs = require('fs');
const url = require('url');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const envPublicUrl = process.env.PUBLIC_URL;

const ensureSlash = (path, needsSlash) => {
  const hasSlash = path.endsWith('/');

  if (hasSlash && !needsSlash) return path.substr(path, path.length - 1);
  else if (!hasSlash && needsSlash) return `${path}/`;
  else return path;
};

const getPublicUrl =
  // 環境変数かpackage.jsonでpublic urlを決める。
  appPackageJson => envPublicUrl || require(appPackageJson).homepage;

function getServedPath(appPackageJson) {
  // production buildのときに使うurlを取得する。
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');

  return ensureSlash(servedUrl, true);
}

module.exports = {
  dotenv: resolveApp('.env'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  yarnLockFile: resolveApp('yarn.lock'),
  appIndexCss: resolveApp('src/styles/index.scss'),
  overrideSemanticCss: resolveApp('src/styles/override/semantic.scss'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
};
