/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { asInitializingTask } from '../base-application/support/task-type-inference.ts';

import type { BaseKubernetesGenerator } from './generator.ts';

export const checkHelm = asInitializingTask(async function (this: BaseKubernetesGenerator) {
  if (this.skipChecks) return;

  // Commands are spawned without a shell, so the version is matched here instead of piping it to grep.
  // `--client` keeps helm 2 from contacting Tiller and is accepted by later versions.
  const { exitCode, stdout, stderr } = await this.spawnCommand('helm version --client', { reject: false, stdio: 'pipe' });
  if (exitCode !== 0 || !/v(2\.1[2-9]|[3-9])\./.test(stdout)) {
    this.log.warn(
      'helm 2.12 or later is not installed on your computer or does not run.\n' +
        'Make sure you have helm installed. Read https://helm.sh/docs/intro/install/\n',
    );
    if (stderr) {
      this.log.debug(stderr);
    }
  }
});
