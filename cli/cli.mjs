/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { packageJson } from '../lib/index.ts';
import { runJHipster } from './program.mts';
import { done, logger } from './utils.mjs';

const currentNodeVersion = process.versions.node;
const minimumNodeVersion = packageJson.engines.node;

if (!process.argv.includes('--skip-checks') && !semver.satisfies(currentNodeVersion, minimumNodeVersion)) {
  logger.fatal(
    `You are running Node version ${currentNodeVersion}.\nJHipster requires Node version ${minimumNodeVersion}.\nPlease update your version of Node.`,
  );
}

export default runJHipster().catch(done);

process.on('unhandledRejection', up => {
  logger.error('Unhandled promise rejection at:');
  logger.fatal(up);
});
