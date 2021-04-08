/* eslint-disable no-console */
const { version, name } = require('./package.json');

if (module.parent == null) {
  console.log(`${name}@${version}`);
} else {
  module.exports = { name, version };
}
