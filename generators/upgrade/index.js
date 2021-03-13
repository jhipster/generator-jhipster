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

const chalk = require('chalk');
const shelljs = require('shelljs');
const semver = require('semver');
const fs = require('fs');
const gitignore = require('parse-gitignore');
const path = require('path');
const childProcess = require('child_process');
const BaseGenerator = require('../generator-base');
const cleanup = require('../cleanup');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { parseBluePrints } = require('../../utils/blueprint');
const packagejs = require('../../package.json');

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster';
const UPGRADE_BRANCH = 'jhipster_upgrade';
const GLOBAL_VERSION = 'global';
const GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES = '2.9.0';
const FIRST_CLI_SUPPORTED_VERSION = '4.5.1'; // The first version in which CLI support was added
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

module.exports = class extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    // This adds support for a `--target-version` flag
    this.option('target-version', {
      desc: 'Upgrade to a specific version instead of the latest',
      type: String,
    });
    // This adds support for a `--target-blueprint-versions` flag
    this.option('target-blueprint-versions', {
      desc: 'Upgrade to specific blueprint versions instead of the latest, e.g. --target-blueprint-versions foo@0.0.1,bar@1.0.2',
      type: String,
    });

    // This adds support for a `--skip-install` flag
    this.option('skip-install', {
      desc: 'Skips installing dependencies during the upgrade process',
      type: Boolean,
      defaults: false,
    });

    // This adds support for a `--silent` flag
    this.option('silent', {
      desc: 'Hides output of the generation process',
      type: Boolean,
      defaults: false,
    });

    // This adds support for a `--skip-checks` flag
    this.option('skip-checks', {
      desc: 'Disable checks during project regeneration',
      type: Boolean,
      defaults: false,
    });

    if (this.options.help) {
      return;
    }

    this.force = this.options.force;
    this.targetJhipsterVersion = this.options.targetVersion;
    this.targetBlueprintVersions = parseBluePrints(this.options.targetBlueprintVersions);
    this.skipInstall = this.options.skipInstall;
    this.silent = this.options.silent;
    this.skipChecks = this.options.skipChecks;

    // Used for isJhipsterVersionLessThan on cleanup.upgradeFiles
    this.jhipsterOldVersion = this.config.get('jhipsterVersion');

    // Verify 6.6.0 app blueprint bug
    if (!this.config.existed && !this.options.blueprints && !this.options.help) {
      this.error(
        'This seems to be an app blueprinted project with jhipster 6.6.0 bug (https://github.com/jhipster/generator-jhipster/issues/11045), you should pass --blueprints to jhipster upgrade commmand.'
      );
    }
  }

  get initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      displayLogo() {
        this.log(chalk.green('Welcome to the JHipster Upgrade Sub-Generator'));
        this.log(chalk.green('This will upgrade your current application codebase to the latest JHipster version'));
      },

      parseBlueprints() {
        this.blueprints = parseBluePrints(this.options.blueprints || this.config.get('blueprints') || this.config.get('blueprint'));
      },

      loadConfig() {
        this.currentJhipsterVersion = this.config.get('jhipsterVersion');
        this.clientPackageManager = this.config.get('clientPackageManager');
      },
    };
  }

  _rmRf(file) {
    const absolutePath = path.resolve(file);
    this.info(`Removing ${absolutePath}`);
    shelljs.rm('-rf', absolutePath);
  }

  _gitCheckout(branch, options = {}) {
    const args = ['checkout', '-q', branch];
    if (options.force) {
      args.push('-f');
    }
    const gitCheckout = this.gitExec(args, { silent: this.silent });
    if (gitCheckout.code !== 0) this.error(`Unable to checkout branch ${branch}:\n${gitCheckout.stderr}`);
    this.success(`Checked out branch "${branch}"`);
  }

  _upgradeFiles() {
    if (cleanup.upgradeFiles(this)) {
      const gitCommit = this.gitExec(['commit', '-q', '-m', '"Upgrade preparation."', '--no-verify'], { silent: this.silent });
      if (gitCommit.code !== 0) this.error(`Unable to prepare upgrade:\n${gitCommit.stderr}`);
      this.success('Upgrade preparation');
    }
  }

  _cleanUp() {
    const ignoredFiles = gitignore(fs.readFileSync('.gitignore'));
    const filesToKeep = ['.yo-rc.json', '.jhipster', 'node_modules', '.git', '.idea', '.mvn', ...ignoredFiles];
    shelljs.ls('-A').forEach(file => {
      if (!filesToKeep.includes(file)) {
        this._rmRf(file);
      }
    });
    this.success('Cleaned up project directory');
  }

  _generate(jhipsterVersion, blueprintInfo) {
    this.log(`Regenerating application with JHipster ${jhipsterVersion}${blueprintInfo}...`);
    let generatorCommand = 'yo jhipster';
    if (jhipsterVersion.startsWith(GLOBAL_VERSION)) {
      this._rmRf('node_modules');
      generatorCommand = 'jhipster';
    } else if (semver.gte(jhipsterVersion, FIRST_CLI_SUPPORTED_VERSION)) {
      const generatorDir = shelljs.exec('npm bin', { silent: this.silent }).stdout;
      generatorCommand = `"${generatorDir.replace('\n', '')}/jhipster"`;
    }
    const skipChecksOption = this.skipChecks ? '--skip-checks' : '';
    const regenerateCmd = `${generatorCommand} --with-entities --force --skip-install --skip-git --no-insight ${skipChecksOption}`;
    this.info(regenerateCmd);
    try {
      childProcess.execSync(regenerateCmd, { stdio: 'inherit' });
      this.success(`Successfully regenerated application with JHipster ${jhipsterVersion}${blueprintInfo}`);
    } catch (err) {
      this.error(`Something went wrong while generating project! ${err}`);
    }
  }

  _gitCommitAll(commitMsg) {
    const gitAdd = this.gitExec(['add', '-A'], { maxBuffer: 1024 * 10000, silent: this.silent });
    if (gitAdd.code !== 0) this.error(`Unable to add resources in git:\n${gitAdd.stderr}`);

    const gitCommit = this.gitExec(['commit', '-q', '-m', `"${commitMsg}"`, '-a', '--allow-empty', '--no-verify'], {
      silent: this.silent,
    });
    if (gitCommit.code !== 0) this.error(`Unable to commit in git:\n${gitCommit.stderr}`);
    this.success(`Committed with message "${commitMsg}"`);
  }

  _regenerate(jhipsterVersion, blueprintInfo) {
    this._generate(jhipsterVersion, blueprintInfo);
    const keystore = `${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`;
    this.info(`Removing ${keystore}`);
    this._rmRf(keystore);
    this._gitCommitAll(`Generated with JHipster ${jhipsterVersion}${blueprintInfo}`);
  }

  _retrieveLatestVersion(packageName) {
    this.log(`Looking for latest ${packageName} version...`);
    const commandPrefix = 'npm show';
    const pkgInfo = shelljs.exec(`${commandPrefix} ${packageName} version`, { silent: this.silent });
    if (pkgInfo.stderr) {
      this.warning(pkgInfo.stderr);
      throw new Error(`Something went wrong fetching the latest ${packageName} version number...\n${pkgInfo.stderr}`);
    }
    const msg = pkgInfo.stdout;
    return msg.replace('\n', '');
  }

  _installNpmPackageLocally(npmPackage, version) {
    this.log(`Installing ${npmPackage} ${version} locally`);
    const commandPrefix = 'npm install';
    const devDependencyParam = '--save-dev';
    const noPackageLockParam = '--no-package-lock';
    const generatorCommand = `${commandPrefix} ${npmPackage}@${version} ${devDependencyParam} ${noPackageLockParam} --ignore-scripts --legacy-peer-deps`;
    this.info(generatorCommand);

    const npmIntall = shelljs.exec(generatorCommand, { silent: this.silent });
    if (npmIntall.code === 0) this.success(`Installed ${npmPackage}@${version}`);
    else this.error(`Something went wrong while installing ${npmPackage}! ${npmIntall.stdout} ${npmIntall.stderr}`);
  }

  get configuring() {
    return {
      assertJHipsterProject() {
        if (!this.config.get('baseName')) {
          this.error('Current directory does not contain a JHipster project.');
        }
      },

      assertGitPresent() {
        if (!this.isGitInstalled()) {
          this.warning('git is not found on your computer.\n', ` Install git: ${chalk.yellow('https://git-scm.com/')}`);
          this.error('Exiting the process.');
        }
      },

      checkLatestBlueprintVersions() {
        if (!this.blueprints || this.blueprints.length === 0) {
          this.log('No blueprints detected, skipping check of last blueprint version');
          return undefined;
        }

        this.success('Checking for new blueprint versions');
        return Promise.all(
          this.blueprints
            .filter(blueprint => {
              if (this.targetBlueprintVersions && this.targetBlueprintVersions.length > 0) {
                const targetBlueprint = this.targetBlueprintVersions.find(elem => {
                  return elem.name === blueprint.name;
                });
                if (targetBlueprint && targetBlueprint.version && targetBlueprint.version !== 'latest') {
                  this.log(`Blueprint ${targetBlueprint.name} will be upgraded to target version: ${targetBlueprint.version}`);
                  blueprint.latestBlueprintVersion = targetBlueprint.version;
                  return false;
                }
              }
              return true;
            })
            .map(blueprint => {
              return new Promise(resolve => {
                const latestVersion = this._retrieveLatestVersion(blueprint.name);
                blueprint.latestBlueprintVersion = latestVersion;
                if (semver.lt(blueprint.version, blueprint.latestBlueprintVersion)) {
                  this.newBlueprintVersionFound = true;
                  this.success(`New ${blueprint.name} version found: ${blueprint.latestBlueprintVersion}`);
                } else if (this.force) {
                  this.newBlueprintVersionFound = true;
                  this.log(chalk.yellow('Forced re-generation'));
                } else {
                  if (this.newBlueprintVersionFound === undefined) {
                    this.newBlueprintVersionFound = false;
                  }
                  this.warning(
                    `${chalk.green('No update available.')} Application has already been generated with latest version for blueprint: ${
                      blueprint.name
                    }`
                  );
                }
                this.success(`Done checking for new version for blueprint ${blueprint.name}`);
                resolve();
              });
            })
        ).then(() => {
          this.success('Done checking for new version of blueprints');
        });
      },

      checkLatestJhipsterVersion() {
        if (this.targetJhipsterVersion) {
          if (this.targetJhipsterVersion === GLOBAL_VERSION) {
            this.originalTargetJhipsterVersion = this.targetJhipsterVersion;
            this.targetJhipsterVersion = packagejs.version;
          }
          this.log(`Upgrading to the target JHipster version: ${this.targetJhipsterVersion}`);
          return;
        }
        this.log(`Looking for latest ${GENERATOR_JHIPSTER} version...`);
        const latestVersion = this._retrieveLatestVersion(GENERATOR_JHIPSTER);
        this.targetJhipsterVersion = latestVersion;
        if (semver.lt(this.currentJhipsterVersion, this.targetJhipsterVersion)) {
          this.success(`New ${GENERATOR_JHIPSTER} version found: ${this.targetJhipsterVersion}`);
        } else if (this.force) {
          this.log(chalk.yellow('Forced re-generation'));
        } else if (!this.newBlueprintVersionFound) {
          this.error(`${chalk.green('No update available.')} Application has already been generated with latest version.`);
        }
      },

      assertGitRepository() {
        const gitInit = () => {
          const gitInit = this.gitExec('init', { silent: this.silent });
          if (gitInit.code !== 0) this.error(`Unable to initialize a new Git repository:\n${gitInit.stdout} ${gitInit.stderr}`);
          this.success('Initialized a new Git repository');
          this._gitCommitAll('Initial');
        };
        const gitRevParse = this.gitExec(['rev-parse', '-q', '--is-inside-work-tree'], { silent: this.silent });
        if (gitRevParse.code !== 0) gitInit();
        else this.success('Git repository detected');
      },

      assertNoLocalChanges() {
        const gitStatus = this.gitExec(['status', '--porcelain'], { silent: this.silent });
        if (gitStatus.code !== 0) this.error(`Unable to check for local changes:\n${gitStatus.stdout} ${gitStatus.stderr}`);
        if (gitStatus.stdout) {
          this.warning(gitStatus.stdout);
          throw new Error(' local changes found.\n\tPlease commit/stash them before upgrading');
        }
      },

      detectCurrentBranch() {
        const gitRevParse = this.gitExec(['rev-parse', '-q', '--abbrev-ref', 'HEAD'], { silent: this.silent });
        if (gitRevParse.code !== 0) this.error(`Unable to detect current Git branch:\n${gitRevParse.stdout} ${gitRevParse.stderr}`);
        this.sourceBranch = gitRevParse.stdout.replace('\n', '');
      },

      async upgradeConfig() {
        return this.prompt({
          type: 'confirm',
          name: 'upgradeConfig',
          message: 'Unify blueprints configurations?',
        }).then(
          function (answer) {
            if (answer.upgradeConfig) {
              this.composeWith(require.resolve('../upgrade-config'), this.options);
            }
          }.bind(this)
        );
      },

      async prepareUpgradeBranch() {
        const getGitVersion = () => {
          const gitVersion = this.gitExec(['--version'], { silent: this.silent });
          return String(gitVersion.stdout.match(/([0-9]+\.[0-9]+\.[0-9]+)/g));
        };

        const recordCodeHasBeenGenerated = () => {
          const gitVersion = getGitVersion();
          let args;
          if (semver.lt(gitVersion, GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES)) {
            args = ['merge', '--strategy=ours', '-q', '--no-edit', UPGRADE_BRANCH];
          } else {
            args = ['merge', '--strategy=ours', '-q', '--no-edit', '--allow-unrelated-histories', UPGRADE_BRANCH];
          }
          const gitMerge = this.gitExec(args, { silent: this.silent });
          if (gitMerge.code !== 0) {
            this.error(
              `Unable to record current code has been generated with version ${this.currentJhipsterVersion}:\n${gitMerge.stdout} ${gitMerge.stderr}`
            );
          }
          this.success(`Current code has been generated with version ${this.currentJhipsterVersion}`);
        };

        const installJhipsterLocally = version => {
          this._installNpmPackageLocally(GENERATOR_JHIPSTER, version);
        };

        const installBlueprintsLocally = () => {
          if (!this.blueprints || this.blueprints.length < 1) {
            this.log('Skipping local blueprint installation since no blueprint has been detected');
            return Promise.resolve(false);
          }

          this.success('Installing blueprints locally...');
          return Promise.all(
            this.blueprints.map(blueprint => {
              return new Promise(resolve => {
                this._installNpmPackageLocally(blueprint.name, blueprint.version);
                this.success(`Done installing blueprint: ${blueprint.name}@${blueprint.version}`);
                resolve();
              });
            })
          ).then(() => {
            this.success('Done installing blueprints locally');
            return true;
          });
        };

        const createUpgradeBranch = () => {
          const gitCheckout = this.gitExec(['checkout', '--orphan', UPGRADE_BRANCH], { silent: this.silent });
          if (gitCheckout.code !== 0) this.error(`Unable to create ${UPGRADE_BRANCH} branch:\n${gitCheckout.stdout} ${gitCheckout.stderr}`);
          this.success(`Created branch ${UPGRADE_BRANCH}`);
        };

        const gitRevParse = this.gitExec(['rev-parse', '-q', '--verify', UPGRADE_BRANCH], { silent: this.silent });
        if (gitRevParse.code !== 0) {
          // Create and checkout upgrade branch
          createUpgradeBranch();
          // Remove/rename old files
          this._cleanUp();
          // Install jhipster
          installJhipsterLocally(this.currentJhipsterVersion);
          // Install blueprints
          await installBlueprintsLocally();
          const blueprintInfo =
            this.blueprints && this.blueprints.length > 0 ? ` and ${this.blueprints.map(bp => bp.name + bp.version).join(', ')} ` : '';
          // Regenerate the project
          this._regenerate(this.currentJhipsterVersion, blueprintInfo);
          // Checkout original branch
          this._gitCheckout(this.sourceBranch);
          // Register reference for merging
          recordCodeHasBeenGenerated();
        }
      },
    };
  }

  get default() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', 'upgrade');
      },

      checkoutUpgradeBranch() {
        this._gitCheckout(UPGRADE_BRANCH);
      },

      updateJhipster() {
        if (this.originalTargetJhipsterVersion === GLOBAL_VERSION) {
          return;
        }
        this._installNpmPackageLocally(GENERATOR_JHIPSTER, this.targetJhipsterVersion);
      },

      updateBlueprints() {
        if (!this.blueprints || this.blueprints.length < 1) {
          this.log('Skipping blueprint update since no blueprint has been detected');
          return undefined;
        }

        this.success('Upgrading blueprints...');
        return Promise.all(
          this.blueprints.map(blueprint => {
            return new Promise(resolve => {
              this._installNpmPackageLocally(blueprint.name, blueprint.latestBlueprintVersion);
              this.success(`Done upgrading blueprint ${blueprint.name} to version ${blueprint.latestBlueprintVersion}`);
              resolve();
            });
          })
        ).then(() => {
          this.success('Done upgrading blueprints');
        });
      },

      upgradeFiles() {
        this._upgradeFiles();
      },

      generateWithTargetVersion() {
        this._cleanUp();

        const blueprintInfo =
          this.blueprints && this.blueprints.length > 0
            ? ` and ${this.blueprints.map(bp => bp.name + bp.latestBlueprintVersion).join(', ')} `
            : '';
        const targetJhipsterVersion = this.originalTargetJhipsterVersion
          ? `${this.originalTargetJhipsterVersion} ${this.targetJhipsterVersion}`
          : this.targetJhipsterVersion;
        this._regenerate(targetJhipsterVersion, blueprintInfo);
      },

      checkoutSourceBranch() {
        this._gitCheckout(this.sourceBranch, { force: true });
      },

      mergeChangesBack() {
        this.log(`Merging changes back to ${this.sourceBranch}...`);
        this.gitExec(['merge', '-q', UPGRADE_BRANCH], { silent: this.silent });
        this.success('Merge done!');
      },

      checkConflictsInPackageJson() {
        const gitDiff = this.gitExec(['diff', '--name-only', '--diff-filter=U', 'package.json'], { silent: this.silent });
        if (gitDiff.code !== 0) this.error(`Unable to check for conflicts in package.json:\n${gitDiff.stdout} ${gitDiff.stderr}`);
        if (gitDiff.stdout) {
          const installCommand = 'npm install';
          this.warning(`There are conflicts in package.json, please fix them and then run ${installCommand}`);
          this.skipInstall = true;
        }
      },
    };
  }

  install() {
    if (!this.skipInstall) {
      this.log('Installing dependencies, please wait...');
      this.info('Removing the node_modules directory');
      this._rmRf('node_modules');
      const installCommand = 'npm install';
      this.info(installCommand);

      const pkgInstall = shelljs.exec(installCommand, { silent: this.silent });
      if (pkgInstall.code !== 0) {
        this.error(`${installCommand} failed.`);
      }
    } else {
      const logMsg = `Start your Webpack development server with:\n${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;
      this.success(logMsg);
    }
  }

  end() {
    const gitDiff = this.gitExec(['diff', '--name-only', '--diff-filter=U'], { silent: this.silent });
    if (gitDiff.code !== 0) this.error(`Unable to check for conflicts:\n${gitDiff.stdout} ${gitDiff.stderr}`);
    this.success(chalk.bold('Upgraded successfully.'));
    if (gitDiff.stdout) {
      this.warning(`Please fix conflicts listed below and commit!\n${gitDiff.stdout}`);
    }
  }
};
