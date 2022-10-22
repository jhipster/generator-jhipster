/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { GENERATOR_INIT, GENERATOR_PROJECT_NAME } from '../generator-list.mjs';
import { defaultConfig } from './config.mjs';
import { NODE_VERSION, SKIP_COMMIT_HOOK } from './constants.mjs';
import { files, commitHooksFiles } from './files.mjs';
import generatorOptions from './options.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../bootstrap-application-base/types.js').BaseApplication>}
 */
export default class InitGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.jhipsterOptions(generatorOptions);
  }

  async _postConstruct() {
    await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_INIT);
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configure() {},
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    if (this.delegateToBlueprint) return;
    return this.configuring;
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
    if (this.delegateToBlueprint) return;
    return this.loading;
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
    if (this.delegateToBlueprint) return;
    return this.writing;
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
    if (this.delegateToBlueprint) return;
    return this.postWriting;
  }

  get install() {
    return this.asInstallTaskGroup({
      // Initialize git repository before package manager install for commit hooks
      async initGitRepo() {
        if (this.shouldSkipFiles() || this.options.skipGit) return;
        if (!this.isGitInstalled()) {
          this.warning('Git repository could not be initialized, as Git is not installed on your system');
          return;
        }
        try {
          const git = this.createGit();
          this.gitInitialized = (await git.checkIsRepo()) || ((await git.init()) && true);
          this.log(chalk.green.bold('Git repository initialized.'));
        } catch (error) {
          this.warning(`Failed to initialize Git repository.\n ${error}`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.INSTALL]() {
    if (this.delegateToBlueprint) return;
    return this.install;
  }

  get end() {
    return this.asEndTaskGroup({
      /** Initial commit to git repository after package manager install for package-lock.json */
      async gitCommit() {
        if (this.shouldSkipFiles() || this.options.skipGit || !this.isGitInstalled()) return;
        if (!this.gitInitialized) {
          this.warning('The generated application could not be committed to Git, as a Git repository could not be initialized.');
          return;
        }
        this.debug('Committing files to git');
        const git = this.createGit();
        const repositoryRoot = await git.revparse(['--show-toplevel']);
        let result = await git.log(['-n', '1', '--', '.']).catch(() => {});
        if (result && result.total > 0) {
          this.log(
            `Found commits in Git from ${repositoryRoot}. So we assume this is application regeneration. Therefore automatic Git commit is not done. You can do Git commit manually.`
          );
          return;
        }
        try {
          result = await git.status();
          if (result.staged.length > 0) {
            this.log(`The repository ${repositoryRoot} has staged files, skipping commit.`);
            return;
          }
          await git.add(['.']);
          let commitMsg = `Initial version of ${this.jhipsterConfig.baseName} generated by generator-jhipster@${this.jhipsterConfig.jhipsterVersion}`;
          if (this.jhipsterConfig.blueprints && this.jhipsterConfig.blueprints.length > 0) {
            const bpInfo = this.jhipsterConfig.blueprints.map(bp => `${bp.name}@${bp.version}`).join(', ');
            commitMsg += ` with blueprints ${bpInfo}`;
          }
          await git.commit(commitMsg);
          this.log(chalk.green.bold(`Application successfully committed to Git from ${repositoryRoot}.`));
        } catch (e) {
          this.log(chalk.red.bold(`Application commit to Git failed from ${repositoryRoot}. Try to commit manually.`));
        }
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    if (this.delegateToBlueprint) return;
    return this.end;
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  shouldSkipCommitHook() {
    return this.application[SKIP_COMMIT_HOOK];
  }
}
