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

import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

import chalk from 'chalk';

import { asPromptingTask } from '../base-application/support/index.ts';
import { YO_RC_FILE } from '../generator-constants.ts';

import type BaseWorkspacesGenerator from './generator.ts';
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
export const askForDirectoryPath = asPromptingTask(async function askForDirectoryPath(this: BaseWorkspacesGenerator, { control }) {
  if (!this.shouldAskForPrompts({ control })) return;
  let appsFolders: string[];
  await this.prompt(
    [
      {
        type: 'input',
        name: 'directoryPath',
        message: 'Enter the root directory where your applications are located',
        default: '../',
        validate: async input => {
          const path = this.destinationPath(input);
          if (existsSync(path)) {
            const applications = await findApplicationFolders(this, path);
            return applications.length === 0 ? `No application found in ${path}` : true;
          }
          return `${path} is not a directory or doesn't exist`;
        },
      },
      {
        type: 'checkbox',
        name: 'appsFolders',
        when: async answers => {
          const { directoryPath } = answers;
          appsFolders = (await findApplicationFolders(this, directoryPath)).filter(
            app => app !== 'jhipster-registry' && app !== 'registry',
          );
          const workspacesRoot = this.destinationPath(directoryPath, { allowOutsideRoot: true });
          this.log.log(chalk.green(`${appsFolders.length} applications found at ${workspacesRoot}\n`));
          return true;
        },
        message: 'Which applications do you want to include in your configuration?',
        choices: () => appsFolders,
        default: () => appsFolders,
        validate: input => (input.length === 0 ? 'Please choose at least one application' : true),
      },
    ],
    this.config,
  );
});

async function findApplicationFolders(generator: BaseWorkspacesGenerator, directoryPath: string): Promise<string[]> {
  // The applications are siblings of this deployment folder, outside of the destination root.
  const workspacesPath = (...dest: string[]) => generator.destinationPath(directoryPath, ...dest, { allowOutsideRoot: true });
  return (await readdir(workspacesPath(), { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(folder => existsSync(workspacesPath(folder, 'package.json')) && existsSync(workspacesPath(folder, YO_RC_FILE)));
}
