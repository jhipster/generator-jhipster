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
import shelljs from 'shelljs';
import chalk from 'chalk';
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

/**
 * Check that Docker exists.
 */
export function checkDocker() {
  if (this.abort || this.skipChecks) return;
  const done = this.async();

  shelljs.exec('docker -v', { silent: true }, (code, stdout, stderr) => {
    if (stderr) {
      this.log(
        chalk.red(
          'Docker version 1.10.0 or later is not installed on your computer.\n' +
            '         Read http://docs.docker.com/engine/installation/#installation\n'
        )
      );
      this.abort = true;
    } else {
      const dockerVersion = stdout.split(' ')[2].replace(/,/g, '');
      const dockerVersionMajor = dockerVersion.split('.')[0];
      const dockerVersionMinor = dockerVersion.split('.')[1];
      if (dockerVersionMajor < 1 || (dockerVersionMajor === 1 && dockerVersionMinor < 10)) {
        this.log(
          chalk.red(
            `Docker version 1.10.0 or later is not installed on your computer.
                                 Docker version found: ${dockerVersion}
                                 Read http://docs.docker.com/engine/installation/#installation`
          )
        );
        this.abort = true;
      } else {
        this.log.ok('Docker is installed');
      }
    }
    done();
  });
}
