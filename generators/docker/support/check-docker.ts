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
import chalk from 'chalk';

import type CoreGenerator from '../../base-core/generator.ts';

/**
 * Check that Docker exists.
 * @this {import('../../base-core/index.js').default}
 */
export const checkDocker = async function (this: CoreGenerator) {
  if (this.skipChecks) return;
  const ret = await this.spawnCommand('docker -v', { reject: false, stdio: 'pipe' });
  if (ret.exitCode !== 0) {
    this.log.error(
      chalk.red(
        `Docker version 1.10.0 or later is not installed on your computer.
         Read http://docs.docker.com/engine/installation/#installation
`,
      ),
    );
    throw new Error();
  }

  const dockerVersion = ret.stdout.split(' ')[2].replace(/,/g, '');
  const dockerVersionMajor = parseInt(dockerVersion.split('.')[0]);
  const dockerVersionMinor = parseInt(dockerVersion.split('.')[1]);
  if (dockerVersionMajor < 1 || (dockerVersionMajor === 1 && dockerVersionMinor < 10)) {
    this.log.error(
      chalk.red(
        `Docker version 1.10.0 or later is not installed on your computer.
                               Docker version found: ${dockerVersion}
                               Read http://docs.docker.com/engine/installation/#installation`,
      ),
    );
    throw new Error();
  } else {
    this.log.verboseInfo('Docker is installed');
  }
};

/**
 * This is the Generator base class.
 * This provides all the public API methods exposed via the module system.
 * The public API methods can be directly utilized as well using commonJS require.
 *
 * The method signatures in public API should not be changed without a major version change
 */
export default {
  checkDocker,
};
