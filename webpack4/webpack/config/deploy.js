const fs = require('fs-extra');
const paths = require('./paths');

fs.emptyDirSync(paths.appBuild);
fs.copySync(paths.appPublic, paths.appBuild, {
  dereference: true,
});
