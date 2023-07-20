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
import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_INIT, GENERATOR_GIT, GENERATOR_PROJECT_NAME } from '../generator-list.mjs';
import { defaultConfig } from './config.mjs';
import { SKIP_COMMIT_HOOK } from './constants.mjs';
import { files, commitHooksFiles } from './files.mjs';
import command from './command.mjs';
import { packageJson } from '../../lib/index.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../base-application/types.mjs').BaseApplication>}
 */
export default class InitGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_INIT);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadOptions() {
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadConfig({ application }) {
        const config = { ...defaultConfig, ...this.config.getAll() };
        application.applicationNodeEngine = packageJson.engines.node;
        application[SKIP_COMMIT_HOOK] = config[SKIP_COMMIT_HOOK];
      },
      loadNodeDependencies({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_INIT, 'resources', 'package.json'),
        );
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
            husky: application.nodeDependencies.husky,
            'lint-staged': application.nodeDependencies['lint-staged'],
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
