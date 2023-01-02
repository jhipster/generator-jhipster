#!/usr/bin/env node
/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import semver from 'semver';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { logger } from './utils.mjs';
import { packageJson } from '../lib/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const currentNodeVersion = process.versions.node;
const minimumNodeVersion = packageJson.engines.node;

const BUNDLED_VERSION_MESSAGE = 'Using bundled JHipster';
const LOCAL_VERSION_MESSAGE = "Switching to JHipster installed locally in current project's node repository (node_modules)";

if (!semver.satisfies(currentNodeVersion, minimumNodeVersion)) {
  logger.fatal(
    `You are running Node version ${currentNodeVersion}\nJHipster requires Node version ${minimumNodeVersion}\nPlease update your version of Node.`
  );
}

const preferLocalArg = process.argv.includes('--prefer-local');
const preferGlobalArg = process.argv.includes('--prefer-global') || process.argv.includes('--bundled');

if (preferLocalArg && preferGlobalArg) {
  throw new Error('--prefer-local and --prefer-bundled cannot be used together');
}

// Don't use commander for parsing command line to avoid polluting it in cli.js
// --prefer-local: Always resolve node modules locally (useful when using linked module)
const preferLocal = preferLocalArg || (!preferGlobalArg && !process.argv.includes('upgrade'));

await requireCLI(preferLocal);

/*
 * Require cli.js giving priority to local version over bundled one if it exists.
 */
async function requireCLI(preferLocal) {
  let message = BUNDLED_VERSION_MESSAGE;
  /* eslint-disable global-require */
  if (preferLocal) {
    try {
      const localCLI = require.resolve(path.join(process.cwd(), 'node_modules', 'generator-jhipster', 'dist', 'cli', 'cli.mjs'));
      if (__dirname === path.dirname(localCLI)) {
        message = LOCAL_VERSION_MESSAGE;
      } else {
        // load local version
        /* eslint-disable import/no-dynamic-require */
        logger.info(LOCAL_VERSION_MESSAGE);
        await import(localCLI);
        // await import(pathToFileURL(localCLI).href);
        return;
      }
    } catch (e) {
      // Unable to find local version, so bundled one will be loaded anyway
    }
  }
  // load current jhipster
  logger.info(message);
  await import('./cli.mjs');
  /* eslint-enable  */
}
