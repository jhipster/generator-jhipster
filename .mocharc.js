module.exports = {
  recursive: true,
  reporter: 'spec',
  slow: 0,
  timeout: 30000,
  ui: 'bdd',
  extension: ['js', 'cjs'],
  require: 'mocha-expect-snapshot',
  parallel: true,
};
