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

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { GENERATOR_INIT } = require('../generator-list');
const { files } = require('./files');
const { commonOptions, initOptions } = require('../options');
const constants = require('../generator-constants');
const { defaultConfig, requiredConfig } = require('./config');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

    this.jhipsterOptions(commonOptions);
    this.jhipsterOptions(initOptions);

    if (this.options.help) return;

    if (this.options.defaults) {
      this.config.defaults({
        ...requiredConfig,
        baseName: this.getDefaultAppName(),
      });
    }

    this.instantiateBlueprints(GENERATOR_INIT);
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
    };
  }

  get initializing() {
    if (this.fromBlueprint) return;
    return this._initializing();
  }

  _prompting() {
    return {
      async showPrompts() {
        if (this.options.skipPrompts) return;
        // Consider existing baseName a project regeneration.
        if (this.jhipsterConfig.baseName && !this.options.askAnswered) return;
        await this.prompt(
          [
            {
              name: 'projectName',
              when: () => !this.abort,
              type: 'input',
              message: 'What is the project name of your application?',
              default: () => this._getDefaultProjectName(),
            },
            {
              name: 'baseName',
              when: () => !this.abort,
              type: 'input',
              validate: input => this._validateBaseName(input),
              message: 'What is the base name of your application?',
              default: () => this.getDefaultAppName(),
            },
            {
              name: 'prettierDefaultIndent',
              when: () => !this.abort,
              type: 'input',
              message: 'What is the default indentation?',
              default: defaultConfig.prettierDefaultIndent,
            },
            {
              name: 'prettierJavaIndent',
              when: () => !this.abort,
              type: 'input',
              message: 'What is the Java indentation?',
              default: defaultConfig.prettierJavaIndent,
            },
          ],
          this.config
        );
      },
    };
  }

  get prompting() {
    if (this.fromBlueprint) return;
    return this._prompting();
  }

  _configuring() {
    return {
      setDefaults() {
        this.config.defaults({
          baseName: this.getDefaultAppName(),
          ...requiredConfig,
        });
      },
    };
  }

  get configuring() {
    if (this.fromBlueprint) return;
    return this._configuring();
  }

  _loading() {
    return {
      loadConfig() {
        this.loadInitConfig();
      },
      loadDerivedConfig() {
        this.loadDerivedInitConfig();
      },
      loadConstant() {
        this.NODE_VERSION = constants.NODE_VERSION;
      },
      loadDependabotDependencies() {
        this.loadDependabotDependencies(this.fetchFromInstalledJHipster(GENERATOR_INIT, 'templates', 'package.json'));
      },
    };
  }

  get loading() {
    if (this.fromBlueprint) return;
    return this._loading();
  }

  _writing() {
    return {
      async writeFiles() {
        await this.writeFilesToDisk(files);
      },
    };
  }

  get writing() {
    if (this.fromBlueprint) return;
    return this._writing();
  }

  _install() {
    return {
      // Initialize git repository before package manager install for commit hooks
      async initGitRepo() {
        if (this.options.skipGit) return;
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
    if (this.fromBlueprint) return;
    return this._install();
  }

  _end() {
    return {
      /** Initial commit to git repository after package manager install for package-lock.json */
      async gitCommit() {
        if (this.options.skipGit || !this.isGitInstalled()) return;
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
    if (this.fromBlueprint) return;
    return this._end();
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  /**
   * @returns default app name
   */
  _getDefaultProjectName() {
    return defaultConfig.projectName;
  }

  /**
   * Validates baseName
   * @param String input - Base name to be checked
   * @returns Boolean
   */
  _validateBaseName(input) {
    if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
      return 'Your base name cannot contain special characters or a blank space';
    }
    if (/_/.test(input)) {
      return 'Your base name cannot contain underscores as this does not meet the URI spec';
    }
    if (input === 'application') {
      return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
    }
    return true;
  }

  _createGit() {
    return simpleGit({ baseDir: this.destinationPath() }).env({
      ...process.env,
      LANG: 'en',
    });
  }
};
