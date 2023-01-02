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
/* eslint-disable consistent-return */
import chalk from 'chalk';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_INIT, GENERATOR_GIT, GENERATOR_PROJECT_NAME } from '../generator-list.mjs';
import { defaultConfig } from './config.mjs';
import { NODE_VERSION, SKIP_COMMIT_HOOK } from './constants.mjs';
import { files, commitHooksFiles } from './files.mjs';
import generatorOptions from './options.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../base-application/types.mjs').BaseApplication>}
 */
export default class InitGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.jhipsterOptions(generatorOptions);
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_INIT);
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadConfig({ application }) {
        const config = { ...defaultConfig, ...this.config.getAll() };
        application.nodeVersion = NODE_VERSION;
        application[SKIP_COMMIT_HOOK] = config[SKIP_COMMIT_HOOK];
      },
      loadDependabotDependencies() {
        this.loadDependabotDependencies(this.fetchFromInstalledJHipster(GENERATOR_INIT, 'templates', 'package.json'));
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get composing() {
    return this.asLoadingTaskGroup({
      async loadConfig() {
        await this.composeWithJHipster(GENERATOR_GIT);
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.5.1')) {
          this.removeFile('.lintstagedrc.js');
        }
      },
      async writeFiles({ application }) {
        await this.writeFiles({ sections: files, context: application });
      },
      async writeCommitHookFiles({ application }) {
        if (application.skipCommitHook) return;
        await this.writeFiles({ sections: commitHooksFiles, context: application });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addCommitHookDependencies({ application }) {
        if (application.skipCommitHook) return;
        this.packageJson.merge({
          scripts: {
            prepare: 'husky install',
          },
          devDependencies: {
            husky: this.nodeDependencies.husky,
            'lint-staged': this.nodeDependencies['lint-staged'],
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
