#!/usr/bin/env node
// Executable file that runs jhipster sources in JIT mode.
// This file should be used for development purposes and should not be distributed in the npm package.

import { join } from 'path';
import { fileURLToPath } from 'url';
import esbuildx from '@node-loaders/esbuildx';

esbuildx(join(fileURLToPath(import.meta.url), '../../cli/cli.mjs'));
