const Module = require('module');
const process = require('process');

if (!Module.register) {
  // eslint-disable-next-line no-console
  console.log('JHipster test requires node >=18.19.0 || >= 20.6.0\n');
  process.exit(1);
}

module.exports = {
  recursive: true,
  reporter: 'spec',
  slow: 0,
  timeout: 50000,
  ui: 'bdd',
  extension: ['js', 'spec.cjs', 'spec.mjs', 'spec.ts', 'spec.mts'],
  // Resolve absolute path for test with fork and different cwd.
  // `loader` options is passed to forks, but `require` is not.
  // Use node-option instead (it overrides loader option)
  parallel: true,
  require: ['yeoman-test/mocha-cleanup'],
};
