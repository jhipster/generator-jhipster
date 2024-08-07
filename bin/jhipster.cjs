#!/usr/bin/env node
// Executable file that runs jhipster sources in JIT mode.
// This file should be used for development purposes and should not be distributed in the npm package.
// Executable should be written in commonjs https://github.com/nodejs/modules/issues/152.
const { join } = require('path');

const [_nodeExec, _exec, ...args] = process.argv;
// eslint-disable-next-line no-console
console.error('jhipster', ...args);

(async () => {
  const { default: esbuildx } = await import('@node-loaders/esbuildx');
  await esbuildx(join(__dirname, 'cli.cjs'));
})();
