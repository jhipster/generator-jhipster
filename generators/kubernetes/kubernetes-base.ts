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
import type { BaseKubernetesGenerator } from './generator.ts';

/**
 * Spawns the command of a prerequisite check without a shell, so arguments must not be quoted, and logs its output at debug level.
 * Never throws: `exitCode` is undefined when the command could not be spawned.
 */
export async function spawnCheckCommand(this: BaseKubernetesGenerator, command: string): Promise<{ exitCode?: number; stdout: string }> {
  try {
    const { exitCode, stdout, stderr, shortMessage } = await this.spawnCommand(command, { reject: false, stdio: 'pipe' });
    this.log.debug(`${command}: ${exitCode === 0 ? stdout : stderr || shortMessage}`);
    return { exitCode, stdout };
  } catch (error) {
    this.log.debug(`${command}: ${(error as Error).message}`);
    return { exitCode: undefined, stdout: '' };
  }
}

export async function checkHelm(this: BaseKubernetesGenerator) {
  if (this.skipChecks) return;

  // `--short` prints the client version only (`v3.16.1+g5a5449d`) on helm 3 and 4, which has no `--client` flag.
  // helm 2 prints `Client: v2.16.12+g47f0b88` before failing when it cannot reach Tiller, so the version is read whatever the exit code.
  const { stdout } = await spawnCheckCommand.call(this, 'helm version --short');
  const [, major, minor] = /v(\d+)\.(\d+)\./.exec(stdout) ?? [];
  if (major === undefined) {
    this.log.warn(
      'helm is not installed on your computer or does not run.\n' +
        'Make sure you have helm 2.12 or later installed. Read https://helm.sh/docs/intro/install/\n',
    );
  } else if (Number(major) < 2 || (Number(major) === 2 && Number(minor) < 12)) {
    this.log.warn(
      `helm ${major}.${minor} is installed, but helm 2.12 or later is required.\n` +
        'Upgrade helm. Read https://helm.sh/docs/intro/install/\n',
    );
  }
}
