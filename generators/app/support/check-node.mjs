/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

const isNodeVersionCompliantWithRequirement = (gatheredFromEnvironment, requiredVersion) => {
  return !semver.satisfies(gatheredFromEnvironment, requiredVersion);
};

const getNodeReleaseFromCurrentProcess = () => {
  return process.release || {};
};

const isNodeLTS = release => {
  return release.lts;
};
const getNodeVersionFromCurrentProcess = () => {
  return process.version;
};
const requiredEngineFromPackageJson = () => {
  return packageJson.engines.node;
};

/**
 * @private
 * Check if Node is installed, up to date, and in LTS version.
 * Will emit a warning if the current node version is too old compared to the required one or if it is not in LTS.
 * @param {any} logger - the logging adapter
 * @param {string} requiredNodeVersion - the version needed to run the generator (defaulted to the one mentionned in package.json)
 * @param {string} currentNodeVersion - the version of Node installed on the machine (defaulted to the one running the generator)
 */
const checkNode = (
  logger,
  requiredNodeVersion = requiredEngineFromPackageJson(),
  currentNodeVersion = getNodeVersionFromCurrentProcess()
) => {
  if (isNodeVersionCompliantWithRequirement(currentNodeVersion, requiredNodeVersion)) {
    logger.warn(
      `Your NodeJS version is too old (${currentNodeVersion}). You should use at least NodeJS ${chalk.bold(requiredNodeVersion)}`
    );
  }
  if (!isNodeLTS(getNodeReleaseFromCurrentProcess())) {
    logger.warn(
      'Your Node version is not LTS (Long Term Support), use it at your own risk! JHipster does not support non-LTS releases, so if you encounter a bug, please use a LTS version first.'
    );
  }
};

export default checkNode;
