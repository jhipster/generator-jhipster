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
import { JavascriptSimpleApplicationGenerator } from '../../generator.ts';

export default class HuskyGenerator extends JavascriptSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('javascript-simple-application');
    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:javascript-simple-application:prettier');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configureNodeOptions() {
        if (this.jhipsterConfig.skipCommitHook) {
          this.removeCommitHook();
          this.cancelCancellableTasks();
        }
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.CONFIGURING]() {
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

  get [JavascriptSimpleApplicationGenerator.WRITING]() {
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

  get [JavascriptSimpleApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  /**
   * Removes what this generator writes from a project that turned the commit hook off: its files, its script and its
   * dependencies.
   */
  private removeCommitHook() {
    this.removeFile('.lintstagedrc.cjs');
    this.removeFile('.husky/pre-commit');
    if (!this.packageJson.existed) return;
    const { scripts, devDependencies } = this.packageJson.getAll() as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    if (scripts?.prepare === 'husky') {
      const { prepare: _prepare, ...otherScripts } = scripts;
      this.packageJson.set('scripts', otherScripts);
    }
    if (devDependencies && ('husky' in devDependencies || 'lint-staged' in devDependencies)) {
      const { husky: _husky, 'lint-staged': _lintStaged, ...otherDevDependencies } = devDependencies;
      this.packageJson.set('devDependencies', otherDevDependencies);
    }
  }
}
