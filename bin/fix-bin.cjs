#!/usr/bin/env node
const { chmod } = require('node:fs/promises');
const { join } = require('node:path');
const process = require('node:process');

(async () => {
  if (process.platform !== 'win32') {
    await chmod(join(__dirname, '../dist/cli/jhipster.cjs'), 0755);
  }
})();
