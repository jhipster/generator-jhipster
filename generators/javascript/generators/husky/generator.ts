/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import BaseApplicationGenerator from '../../../base-application/index.js';

export default class HuskyGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { queueCommandTasks: true, ...features });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:javascript:prettier');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configureNodeOptions() {
        if (this.jhipsterConfig.skipCommitHook) {
          this.cancelCancellableTasks();
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [{ templates: ['.lintstagedrc.cjs', '.husky/pre-commit'] }],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addCommitHookDependencies({ application }) {
        this.packageJson.merge({
          scripts: {
            prepare: 'husky',
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
