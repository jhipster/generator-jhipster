module.exports = {
  recursive: true,
  reporter: 'spec',
  slow: 0,
  timeout: 30000,
  ui: 'bdd',
  extension: ['js', 'spec.cjs', 'spec.mjs', 'spec.ts', 'spec.mts'],
  require: ['mocha-expect-snapshot/old-format', 'test/mocha.config.mjs'],
  // Resolve absolute path for test with fork and different cwd.
  // `loader` options is passed to forks, but `require` is not.
  // Use node-option instead (it overrides loader option)
  'node-option': [`require=${require.resolve('@esbuild-kit/cjs-loader')}`, `loader=${require.resolve('@esbuild-kit/esm-loader')}`],
  parallel: true,
};
