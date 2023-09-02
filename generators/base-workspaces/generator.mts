/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import BaseGenerator from '../base/index.mjs';
import { PRIORITY_NAMES, QUEUES } from '../base/priorities.mjs';
import { YO_RC_FILE } from '../generator-constants.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';

const { DEFAULT, WRITING, POST_WRITING, PRE_CONFLICTS, INSTALL, END } = PRIORITY_NAMES;

/**
 * This is the base class for a generator that generates entities.
 */
export default class BaseWorkspacesGenerator extends BaseGenerator {
  appsFolders?: string[];
  directoryPath!: string;

  constructor(args, options, features) {
    super(args, options, features);

    if (!this.options.help) {
      this.queueTask({
        async method() {
          await (this as any).bootstrapApplications();
        },
        taskName: 'bootstrapApplications',
        cancellable: true,
        queueName: QUEUES.PREPARING_QUEUE,
      });
    }
  }

  protected async findApplicationFolders() {
    const directoryPath = this.directoryPath ?? '.';
    return (await readdir(this.destinationPath(directoryPath), { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(
        folder =>
          existsSync(this.destinationPath(directoryPath, folder, 'package.json')) &&
          existsSync(this.destinationPath(directoryPath, folder, YO_RC_FILE)),
      );
  }

  protected async resolveApplicationFolders() {
    return (this.appsFolders ?? []).map(appFolder => this.destinationPath(this.directoryPath ?? '.', appFolder));
  }

  async bootstrapApplications() {
    for (const resolvedApplicationFolder of await this.resolveApplicationFolders()) {
      await this.composeWithJHipster(GENERATOR_BOOTSTRAP_APPLICATION, {
        generatorOptions: { destinationRoot: resolvedApplicationFolder },
      } as any);
    }
  }

  getArgsForPriority(priorityName): any {
    const args = super.getArgsForPriority(priorityName);
    if (![DEFAULT, WRITING, POST_WRITING, PRE_CONFLICTS, INSTALL, END].includes(priorityName)) {
      return args;
    }

    const [first, ...others] = args ?? [];
    return [
      {
        ...first,
        applications: (this.appsFolders ?? []).map(
          appFolder => this.getSharedApplication(this.destinationPath(this.directoryPath ?? '.', appFolder))?.sharedApplication,
        ),
      },
      ...others,
    ];
  }
}
