import { defineConfig } from 'expect-node/config';

export default defineConfig({
  files: ['{test,generators,cli,.blueprint,lib}/**/*.spec.{ts,mts,cjs,mjs}'],
  mochaHooks: ['yeoman-test/mocha-cleanup'],
  timeout: 50000,
  // The test files by processes reused, as many as the cores.
  workers: true,
  // A module mocked after the test file imported a module of the project importing it.
  reimport: true,
});
