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
import chalk from 'chalk';

import { packageJson } from '../../../lib/index.mjs';

/**
 * @private
 * Check if Node is installed
 */
const checkNode = context => {
  if (context.skipChecks) return;
  const nodeFromPackageJson = packageJson.engines.node;
  if (!semver.satisfies(process.version, nodeFromPackageJson)) {
    context.warning(
      `Your NodeJS version is too old (${process.version}). You should use at least NodeJS ${chalk.bold(nodeFromPackageJson)}`
    );
  }
  if (!(process.release || {}).lts) {
    context.warning(
      'Your Node version is not LTS (Long Term Support), use it at your own risk! JHipster does not support non-LTS releases, so if you encounter a bug, please use a LTS version first.'
    );
  }
};

export default checkNode;
