const { pathToFileURL } = require('url');

const loaderPath = require.resolve('@node-loaders/auto/strict');
const loaderUrl = pathToFileURL(loaderPath).href;

module.exports = {
  recursive: true,
  reporter: 'spec',
  slow: 0,
  timeout: 50000,
  ui: 'bdd',
  extension: ['js', 'spec.cjs', 'spec.mjs', 'spec.ts', 'spec.mts'],
  require: ['mocha-expect-snapshot/old-format', 'test/mocha.config.cjs'],
  // Resolve absolute path for test with fork and different cwd.
  // `loader` options is passed to forks, but `require` is not.
  // Use node-option instead (it overrides loader option)
  'node-option': [`loader=${loaderUrl}`],
  parallel: true,
};
