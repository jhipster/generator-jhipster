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
const chalk = require('chalk');
const { generateMixedChain } = require('../../lib/support/mixin.cjs');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
  INSTALL_PRIORITY,
  END_PRIORITY,
} = require('../../lib/constants/priorities.cjs');

const { GENERATOR_INIT } = require('../generator-list');
const { PRETTIER_DEFAULT_INDENT, PRETTIER_DEFAULT_INDENT_DEFAULT_VALUE, SKIP_COMMIT_HOOK } = require('./constants.cjs');
const { files, commitHooksFiles } = require('./files.cjs');
const { dependencyChain } = require('./mixin.cjs');

const MixedChain = generateMixedChain(GENERATOR_INIT);

module.exports = class extends MixedChain {
  constructor(args, options, features) {
    super(args, options, { jhipsterModular: true, unique: 'namespace', ...features });

    // Register options available to cli.
    if (!this.fromBlueprint) {
      this.registerCommonOptions();
      this.registerChainOptions();
    }

    if (this.options.help) return;

    // Application context for templates
    this.application = {};

    if (this.options.defaults) {
      this.configureChain();
    }
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      const configure = this.options.configure || !this.shouldComposeModular();
      for (const generator of dependencyChain) {
        await this.dependsOnJHipster(generator, [], { configure });
      }
      await this.composeWithBlueprints(GENERATOR_INIT);
    }
  }

  get initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        if (!this.showHello()) return;
        this.log(chalk.white('⬢ Welcome to the JHipster Init ⬢'));
      },
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
      },
      loadOptionsConstants() {
        this.loadChainOptionsConstants();
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.initializing;
  }

  get prompting() {
    return {
      async showPrompts() {
        if (this.shouldSkipPrompts()) return;
        await this.prompt(
          [
            {
              name: PRETTIER_DEFAULT_INDENT,
              type: 'input',
              message: 'What is the default indentation?',
              default: () => this.sharedData.getConfigDefaultValue(PRETTIER_DEFAULT_INDENT, PRETTIER_DEFAULT_INDENT_DEFAULT_VALUE),
            },
          ],
          this.config
        );
      },
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.prompting;
  }

  get configuring() {
    return {
      configure() {
        this.configureInit();
      },
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.configuring;
  }

  get loading() {
    return {
      configureChain() {
        this.configureChain();
      },
      loadConstants() {
        this.loadChainConstants(this.application);
      },
      loadConfig() {
        this.loadChainConfig(this.application);
      },
      loadDependabotDependencies() {
        this.loadDependabotDependencies(this.fetchFromInstalledJHipster(GENERATOR_INIT, 'templates', 'package.json'));
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.loading;
  }

  get preparing() {
    return {
      prepareDerivedProperties() {
        this.prepareChainDerivedProperties(this.application);
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.preparing;
  }

  get writing() {
    return {
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.5.1')) {
          this.removeFile('.lintstagedrc.js');
        }
      },
      async writeFiles() {
        if (this.shouldSkipFiles()) return;
        await this.writeFiles({ sections: files, context: this.application });
      },
      async writeCommitHookFiles() {
        if (this.shouldSkipFiles() || this.shouldSkipCommitHook()) return;
        await this.writeFiles({ sections: commitHooksFiles, context: this.application });
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.writing;
  }

  get postWriting() {
    return {
      addCommitHookDependencies() {
        if (this.shouldSkipFiles() || this.shouldSkipCommitHook()) return;
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
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.postWriting;
  }

  get install() {
    return {
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
    };
  }

  get [INSTALL_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.install;
  }

  get end() {
    return {
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
    };
  }

  get [END_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.end;
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  shouldSkipCommitHook() {
    return this.application[SKIP_COMMIT_HOOK];
  }
};
