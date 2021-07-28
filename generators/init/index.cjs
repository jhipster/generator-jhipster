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
/* eslint-disable consistent-return */
const chalk = require('chalk');
const simpleGit = require('simple-git');
const { generateMixedChain } = require('generator-jhipster/support');

const { GENERATOR_INIT } = require('../generator-list');
const { SKIP_COMMIT_HOOK } = require('./constants.cjs');
const { files, commitHooksFiles } = require('./files.cjs');
const { defaultConfig } = require('./config.cjs');
const { dependencyChain } = require('./mixin.cjs');

const MixedChain = generateMixedChain(GENERATOR_INIT);

module.exports = class extends MixedChain {
  constructor(args, opts, features) {
    super(args, opts, { jhipsterModular: true, unique: 'namespace', ...features });

    // Register options available to cli.
    if (!this.fromBlueprint) {
      this.registerCommonOptions();
      this.registerChainOptions();
    }

    if (this.options.help) return;

    if (this.options.defaults) {
      this.configureChain();
    }
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      const configure = this.options.configure || !this.shouldComposeModular();
      // eslint-disable-next-line no-restricted-syntax
      for (const generator of dependencyChain) {
        // eslint-disable-next-line no-await-in-loop
        await this.dependsOnJHipster(generator, [], { configure });
      }
      await this.composeWithBlueprints(GENERATOR_INIT);
    }
  }

  _initializing() {
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

  get initializing() {
    if (this.delegateToBlueprint) return;
    return this._initializing();
  }

  _prompting() {
    return {
      async showPrompts() {
        if (this.shouldSkipPrompts()) return;
        await this.prompt(
          [
            {
              name: 'prettierDefaultIndent',
              when: () => !this.abort,
              type: 'input',
              message: 'What is the default indentation?',
              default: defaultConfig.prettierDefaultIndent,
            },
          ],
          this.config
        );
      },
    };
  }

  get prompting() {
    if (this.delegateToBlueprint) return;
    return this._prompting();
  }

  _configuring() {
    return {
      configure() {
        this.configureChain();
      },
    };
  }

  get configuring() {
    if (this.delegateToBlueprint) return;
    return this._configuring();
  }

  _loading() {
    return {
      loadConstants() {
        this.loadChainConstants();
      },
      loadConfig() {
        this.loadChainConfig();
      },
      loadDerivedConfig() {
        this.loadDerivedChainConfig();
      },
      loadDependabotDependencies() {
        this.loadDependabotDependencies(this.fetchFromInstalledJHipster(GENERATOR_INIT, 'templates', 'package.json'));
      },
    };
  }

  get loading() {
    if (this.delegateToBlueprint) return;
    return this._loading();
  }

  _writing() {
    return {
      async writeFiles() {
        if (this.shouldSkipFiles()) return;
        await this.writeFilesToDisk(files);
      },
      async writeCommitHookFiles() {
        if (this.shouldSkipFiles() || this[SKIP_COMMIT_HOOK]) return;
        await this.writeFilesToDisk(commitHooksFiles);
      },
    };
  }

  get writing() {
    if (this.delegateToBlueprint) return;
    return this._writing();
  }

  _postWriting() {
    return {
      addCommitHookDependencies() {
        if (this.shouldSkipFiles() || this[SKIP_COMMIT_HOOK]) return;
        this.packageJson.merge({
          devDependencies: {
            husky: this.dependabotDependencies.husky,
            'lint-staged': this.dependabotDependencies['lint-staged'],
          },
        });
      },
    };
  }

  get postWriting() {
    if (this.delegateToBlueprint) return;
    return this._postWriting();
  }

  _install() {
    return {
      // Initialize git repository before package manager install for commit hooks
      async initGitRepo() {
        if (this.shouldSkipFiles() || this.options.skipGit) return;
        if (!this.isGitInstalled()) {
          this.warning('Git repository could not be initialized, as Git is not installed on your system');
          return;
        }
        try {
          const git = this._createGit();
          this.gitInitialized = (await git.checkIsRepo()) || ((await git.init()) && true);
          this.log(chalk.green.bold('Git repository initialized.'));
        } catch (error) {
          this.warning(`Failed to initialize Git repository.\n ${error}`);
        }
      },
    };
  }

  get install() {
    if (this.delegateToBlueprint) return;
    return this._install();
  }

  _end() {
    return {
      /** Initial commit to git repository after package manager install for package-lock.json */
      async gitCommit() {
        if (this.shouldSkipFiles() || this.options.skipGit || !this.isGitInstalled()) return;
        if (!this.gitInitialized) {
          this.warning('The generated application could not be committed to Git, as a Git repository could not be initialized.');
          return;
        }
        this.debug('Committing files to git');
        const git = this._createGit();
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

  get end() {
    if (this.delegateToBlueprint) return;
    return this._end();
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  _createGit() {
    return simpleGit({ baseDir: this.destinationPath() }).env({
      ...process.env,
      LANG: 'en',
    });
  }
};
