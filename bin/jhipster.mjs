#!/usr/bin/env node
// Executable file that runs jhipster sources in JIT mode.
// This file should be used for development purposes and should not be distributed in the npm package.

const [_nodeExec, _exec, ...args] = process.argv;
// eslint-disable-next-line no-console
console.error('jhipster', ...args);

process.env.JHIPSTER_DEV_BLUEPRINT = true;

// Dynamic import (not a static `import`) so the env var above is set before the CLI is loaded.
await import('../cli/jhipster.mjs');
