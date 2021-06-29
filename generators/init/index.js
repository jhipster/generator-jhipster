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

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { files } = require('./files');
const constants = require('../generator-constants');
const { initDefaultPromptConfig } = require('../generator-defaults');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.option('jhipster-version', {
      desc: 'Force jhipsterVersion for reproducibility',
      type: Boolean,
      hide: true,
    });

    if (this.options.help) return;

    this.instantiateBlueprints('init');
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
      loadCliOptions() {
        this.loadInitCliOptions();
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
              default: 2,
            },
            {
              name: 'prettierJavaIndent',
              when: () => !this.abort,
              type: 'input',
              message: 'What is the Java indentation?',
              default: 4,
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
        this.config.defaults(initDefaultPromptConfig);
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
        this.loadDependabotDependencies(this.fetchFromInstalledJHipster('init', 'templates', 'package.json'));
      },
    };
  }

  get loading() {
    if (this.fromBlueprint) return;
    return this._loading();
  }

  _writing() {
    return {
      writeFiles() {
        return this.writeFilesToDisk(files);
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
      initGitRepo() {
        if (!this.options.skipGit) {
          if (this.gitInstalled || this.isGitInstalled()) {
            const gitDir = this.gitExec('rev-parse --is-inside-work-tree', { trace: false }).stdout;
            // gitDir has a line break to remove (at least on windows)
            if (gitDir && gitDir.trim() === 'true') {
              this.gitInitialized = true;
            } else {
              const shellStr = this.gitExec('init', { trace: false });
              this.gitInitialized = shellStr.code === 0;
              if (this.gitInitialized) this.log(chalk.green.bold('Git repository initialized.'));
              else this.warning(`Failed to initialize Git repository.\n ${shellStr.stderr}`);
            }
          } else {
            this.warning('Git repository could not be initialized, as Git is not installed on your system');
          }
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
      gitCommit() {
        if (!this.options.skipGit && this.isGitInstalled()) {
          if (this.gitInitialized) {
            this.debug('Committing files to git');
            const done = this.async();
            this.gitExec('log --oneline -n 1 -- .', { trace: false }, (code, commits) => {
              if (code !== 0 || !commits || !commits.trim()) {
                // if no files in Git from current folder then we assume that this is initial application generation
                this.gitExec('add .', { trace: false }, code => {
                  if (code === 0) {
                    let commitMsg = `Initial version of ${this.jhipsterConfig.baseName} generated by generator-jhipster@${this.jhipsterConfig.jhipsterVersion}`;
                    if (this.jhipsterConfig.blueprints && this.jhipsterConfig.blueprints.length > 0) {
                      const bpInfo = this.jhipsterConfig.blueprints.map(bp => `${bp.name}@${bp.version}`).join(', ');
                      commitMsg += ` with blueprints ${bpInfo}`;
                    }
                    this.gitExec(`commit -m "${commitMsg}" -- .`, { trace: false }, code => {
                      if (code === 0) {
                        this.log(chalk.green.bold(`Application successfully committed to Git from ${process.cwd()}.`));
                      } else {
                        this.log(chalk.red.bold(`Application commit to Git failed from ${process.cwd()}. Try to commit manually.`));
                      }
                      done();
                    });
                  } else {
                    this.warning(
                      `The generated application could not be committed to Git, because ${chalk.bold('git add')} command failed.`
                    );
                    done();
                  }
                });
              } else {
                // if found files in Git from current folder then we assume that this is application regeneration
                // if there are changes in current folder then inform user about manual commit needed
                this.gitExec('diff --name-only .', { trace: false }, (code, diffs) => {
                  if (code === 0 && diffs && diffs.trim()) {
                    this.log(
                      `Found commits in Git from ${process.cwd()}. So we assume this is application regeneration. Therefore automatic Git commit is not done. You can do Git commit manually.`
                    );
                  }
                  done();
                });
              }
            });
          } else {
            this.warning('The generated application could not be committed to Git, as a Git repository could not be initialized.');
          }
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
    return initDefaultPromptConfig.projectName;
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
};
