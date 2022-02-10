module.exports = {
  recursive: true,
  reporter: 'spec',
  slow: 0,
  timeout: 30000,
  ui: 'bdd',
  extension: ['js', 'spec.cjs', 'spec.mjs'],
  require: 'mocha-expect-snapshot',
  parallel: true,
};
