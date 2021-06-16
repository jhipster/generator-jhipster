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
const _ = require('lodash');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const constants = require('../generator-constants');
const packagejs = require('../../package.json');
const dependabotPackagejs = require('./templates/package.json');
const prompts = require('./prompts');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.option('skip-build', {
      desc: 'Skips building the application',
      type: Boolean,
      defaults: false,
    });
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        this.log(chalk.white('⬢ Welcome to the JHipster Init ⬢'));
      },
      getConfig() {
        this.jhipsterVersion = packagejs.version;
        const configuration = this.config;

        this.projectName = configuration.get('projectName');
        this.baseName = configuration.get('baseName');
        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.humanizedBaseName = _.startCase(this.baseName);
        this.dependencies = packagejs.dependencies;
        this.dependabotDependencies = dependabotPackagejs.devDependencies;
      },
      initConstant() {
        this.NODE_VERSION = constants.NODE_VERSION;
      },
    };
  }

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _prompting() {
    return {
      askProjectName: prompts.askProjectName,
      askBaseName: prompts.askBaseName,
    };
  }

  get prompting() {
    if (useBlueprints) return;
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      setup() {
        this.jhipsterConfig.jhipsterVersion = packagejs.version;
        this.jhipsterConfig.projectName = this.projectName;
        this.jhipsterConfig.baseName = this.baseName;
        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.humanizedBaseName = _.startCase(this.baseName);
      },
    };
  }

  get configuring() {
    if (useBlueprints) return;
    return this._configuring();
  }

  _writing() {
    return {
      writeFiles() {
        this.template('editorconfig.ejs', '.editorconfig');

        this.template('gitattributes.ejs', '.gitattributes');
        this.template('gitignore.ejs', '.gitignore');

        this.template('.huskyrc.ejs', '.huskyrc');
        this.template('.lintstagedrc.js.ejs', '.lintstagedrc.js');
        this.template('.prettierignore.ejs', '.prettierignore');
        this.template('.prettierrc.ejs', '.prettierrc');

        this.template('package.json.ejs', 'package.json');

        this.template('README.md.ejs', 'README.md');
      },
    };
  }

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _install() {
    return {
      // Initialize git repository before package manager install for commit hooks */
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
    if (useBlueprints) return;
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

      afterRunHook() {
        try {
          const modules = this.getModuleHooks();
          if (modules.length > 0) {
            this.log(`\n${chalk.bold.green('Running post run module hooks\n')}`);
            // run through all post app creation module hooks
            this.callHooks('app', 'post', {
              appConfig: this.configOptions,
              force: this.options.force,
            });
          }
        } catch (err) {
          this.log(`\n${chalk.bold.red('Running post run module hooks failed. No modification done to the generated app.')}`);
          this.debug('Error:', err);
        }
        this.log(
          chalk.green(
            `\nIf you find JHipster useful consider sponsoring the project ${chalk.yellow('https://www.jhipster.tech/sponsors/')}`
          )
        );
      },
    };
  }

  get end() {
    if (useBlueprints) return;
    return this._end();
  }
};
