#!/usr/bin/env node

import chokidar from 'chokidar';
import { copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type { import('chokidar').WatchOptions } */
const chokidarConfig = {
  ignoreInitial: true,
  cwd: join(__dirname),
  ignored: '**/*.{{,c,m}js,{,c,m}ts,snap}',
};

const copy = (event, path) => {
  if (['add', 'change'].includes(event)) {
    copyFileSync(join(__dirname, path), join(__dirname, 'dist', path));
    console.log(event, path);
  }
};

chokidar.watch('generators', chokidarConfig).on('all', copy);
