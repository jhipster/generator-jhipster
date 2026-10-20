import { defineConfig } from 'expect-node/config';

export default defineConfig({
  files: ['{test,generators,cli,.blueprint,lib}/**/*.spec.{ts,mts,cjs,mjs}'],
  mochaHooks: ['yeoman-test/mocha-cleanup'],
  timeout: 50000,
  // The test files by processes reused, as many as the cores.
  workers: true,
  // The longest test files first, by the durations of .expect-node.durations.json (npm run update-durations).
  durations: true,
});
