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
import process from 'node:process';
import fs, { rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import semver from 'semver';
import gitignore from 'parse-gitignore';
import latestVersion from 'latest-version';

import BaseGenerator from '../base/index.js';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import statistics from '../statistics.js';
import { parseBluePrints } from '../base/internal/index.js';
import { packageJson } from '../../lib/index.js';
import command from './command.js';

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster';
const UPGRADE_BRANCH = 'jhipster_upgrade';
const GLOBAL_VERSION = 'global';
const GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES = '2.9.0';
const FIRST_CLI_SUPPORTED_VERSION = '4.5.1'; // The first version in which CLI support was added

export default class UpgradeGenerator extends BaseGenerator {
  fromV7;
  fromV7_9_3App;

  get [BaseGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      displayLogo() {
        this.log.log(chalk.green('Welcome to the JHipster Upgrade Sub-Generator'));
        this.log.log(chalk.green('This will upgrade your current application codebase to the latest JHipster version'));
      },

      loadOptions() {
        if (!this.config.existed) {
          throw new Error(
            "Could not find a valid JHipster application configuration, check if the '.yo-rc.json' file exists and if the 'generator-jhipster' key exists inside it.",
          );
        }

        this.parseJHipsterOptions(command.options);

        this.force = this.options.force;
        this.targetBlueprintVersions = parseBluePrints(this.options.targetBlueprintVersions);
        this.skipInstall = this.options.skipInstall;

        this.fromV7 = this.jhipsterConfig.jhipsterVersion && semver.satisfies(this.jhipsterConfig.jhipsterVersion, '^7.0.0');
        const currentNodeVersion = process.versions.node;
        if (this.jhipsterConfig.jhipsterVersion === '7.9.3') {
          if (!semver.satisfies(currentNodeVersion, '^16.0.0')) {
            throw new Error('Upgrading a v7.9.3 generated application requires node 16 to upgrade');
          }
          this.fromV7_9_3App = true;
        } else if (!semver.satisfies(currentNodeVersion, packageJson.engines.node)) {
          this.log.fatal(
            `You are running Node version ${currentNodeVersion}\nJHipster requires Node version ${packageJson.engines.node}\nPlease update your version of Node.`,
          );
        }
      },
      parseBlueprints() {
        this.blueprints = parseBluePrints(this.options.blueprints || this.config.get('blueprints') || this.config.get('blueprint')) || [];
      },

      loadConfig() {
        this.currentJhipsterVersion = this.config.get('jhipsterVersion');
        this.clientPackageManager = this.config.get('clientPackageManager');
      },
    });
  }

  _rmRf(file) {
    const absolutePath = path.resolve(file);
    this.log.verboseInfo(`Removing ${absolutePath}`);
    rmSync(absolutePath, { recursive: true, force: true });
  }

  _gitCheckout(branch, options = {}) {
    const args = ['checkout', '-q', branch];
    if (options.force) {
      args.push('-f');
    }
    const gitCheckout = this.spawnSync('git', args, { stdio: 'pipe', reject: false });
    if (gitCheckout.exitCode !== 0) throw new Error(`Unable to checkout branch ${branch}:\n${gitCheckout.stderr}`);
    this.log.ok(`Checked out branch "${branch}"`);
  }

  _cleanUp() {
    const ignoredFiles = gitignore(fs.readFileSync('.gitignore')).patterns || [];
    const filesToKeep = ['.yo-rc.json', '.jhipster', 'node_modules', '.git', '.idea', '.mvn', ...ignoredFiles];
    const files = readdirSync(this.destinationPath());
    files.forEach(file => {
      if (!filesToKeep.includes(file)) {
        this._rmRf(file);
      }
    });
    this.log.ok('Cleaned up project directory');
  }

  _generate(jhipsterVersion, blueprintInfo, { target }) {
    this.log.verboseInfo(`Regenerating application with JHipster ${jhipsterVersion}${blueprintInfo}...`);
    let generatorCommand = 'yo jhipster';
    if (this.options.regenerateExecutable) {
      generatorCommand = this.options.regenerateExecutable;
    } else if (jhipsterVersion.startsWith(GLOBAL_VERSION)) {
      this._rmRf('node_modules');
      generatorCommand = 'jhipster';
    } else if (semver.gte(jhipsterVersion, FIRST_CLI_SUPPORTED_VERSION)) {
      const result = this.spawnCommandSync('npm bin', { stdio: 'pipe', reject: false });
      if (result.exitCode === 0) {
        generatorCommand = `"${result.stdout.replace('\n', '')}/jhipster"`;
      } else {
        generatorCommand = 'npm exec --no jhipster --';
      }
    }
    const skipChecksOption = this.skipChecks || (!target && this.fromV7_9_3App) ? '--skip-checks' : '';
    const regenerateCmd = `${generatorCommand} ${
      this.fromV7 ? '--with-entities ' : ''
    }--force --skip-install --skip-git --ignore-errors --no-insight ${skipChecksOption}`;
    this.log.verboseInfo(regenerateCmd);
    const result = this.spawnCommandSync(regenerateCmd);
    if (result.exitCode !== 0) {
      throw new Error(`Something went wrong while generating project! ${result.exitCode}`);
    }

    this.log.ok(`Successfully regenerated application with JHipster ${jhipsterVersion}${blueprintInfo}`);
  }

  _gitCommitAll(commitMsg) {
    const gitAdd = this.spawnSync('git', ['add', '-A'], { stdio: 'pipe', reject: false });
    if (gitAdd.exitCode !== 0) throw new Error(`Unable to add resources in git:\n${gitAdd.stderr}`);

    const gitCommit = this.spawnSync('git', ['commit', '-q', '-m', commitMsg, '-a', '--allow-empty', '--no-verify'], {
      stdio: 'pipe',
    });
    if (gitCommit.exitCode !== 0) throw new Error(`Unable to commit in git:\n${gitCommit.stderr}`);
    this.log.ok(`Committed with message "${commitMsg}"`);
  }

  _regenerate(jhipsterVersion, blueprintInfo, { target }) {
    this._generate(jhipsterVersion, blueprintInfo, { target });
    const keystore = `${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`;
    this.log.verboseInfo(`Removing ${keystore}`);
    this._rmRf(keystore);
    this._gitCommitAll(`Generated with JHipster ${jhipsterVersion}${blueprintInfo}`);
  }

  _installNpmPackageLocally(npmPackage, version) {
    this.log.verboseInfo(`Installing ${npmPackage} ${version} locally`);
    const commandPrefix = 'npm install';
    const devDependencyParam = '--save-dev';
    const noPackageLockParam = '--no-package-lock';
    const generatorCommand = `${commandPrefix} ${npmPackage}@${version} ${devDependencyParam} ${noPackageLockParam} --ignore-scripts --force`;
    this.log.verboseInfo(generatorCommand);

    const npmInstall = this.spawnCommandSync(generatorCommand, { stdio: 'pipe', reject: false });
    if (npmInstall.exitCode === 0) this.log.ok(`Installed ${npmPackage}@${version}`);
    else throw new Error(`Something went wrong while installing ${npmPackage}! ${npmInstall.stdout} ${npmInstall.stderr}`);
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      assertJHipsterProject() {
        if (!this.config.get('baseName')) {
          throw new Error('Current directory does not contain a JHipster project.');
        }
      },

      async assertGitPresent() {
        if (!(await this.createGit().version()).installed) {
          this.log.warn(`git is not found on your computer.\n, Install git: ${chalk.yellow('https://git-scm.com/')}`);
          throw new Error('Exiting the process.');
        }
      },

      checkLatestBlueprintVersions() {
        if (!this.blueprints || this.blueprints.length === 0) {
          this.log.warn('No blueprints detected, skipping check of last blueprint version');
          return undefined;
        }

        this.log.ok('Checking for new blueprint versions');
        return Promise.all(
          this.blueprints
            .filter(blueprint => {
              if (this.targetBlueprintVersions && this.targetBlueprintVersions.length > 0) {
                const targetBlueprint = this.targetBlueprintVersions.find(elem => {
                  return elem.name === blueprint.name;
                });
                if (targetBlueprint && targetBlueprint.version && targetBlueprint.version !== 'latest') {
                  this.log.warn(`Blueprint ${targetBlueprint.name} will be upgraded to target version: ${targetBlueprint.version}`);
                  blueprint.latestBlueprintVersion = targetBlueprint.version;
                  return false;
                }
              }
              return true;
            })
            .map(async blueprint => {
              blueprint.latestBlueprintVersion = await latestVersion(blueprint.name);
              if (semver.lt(blueprint.version, blueprint.latestBlueprintVersion)) {
                this.newBlueprintVersionFound = true;
                this.log.ok(`New ${blueprint.name} version found: ${blueprint.latestBlueprintVersion}`);
              } else if (this.force) {
                this.newBlueprintVersionFound = true;
                this.log.log(chalk.yellow('Forced re-generation'));
              } else {
                if (this.newBlueprintVersionFound === undefined) {
                  this.newBlueprintVersionFound = false;
                }
                this.log.warn(
                  `${chalk.green('No update available.')} Application has already been generated with latest version for blueprint: ${
                    blueprint.name
                  }`,
                );
              }
              this.log.ok(`Done checking for new version for blueprint ${blueprint.name}`);
            }),
        ).then(() => {
          this.log.ok('Done checking for new version of blueprints');
        });
      },

      async checkLatestJhipsterVersion() {
        if (this.targetJhipsterVersion) {
          if (this.targetJhipsterVersion === GLOBAL_VERSION) {
            this.originalTargetJhipsterVersion = this.targetJhipsterVersion;
            this.targetJhipsterVersion = packageJson.version;
          }
          this.log.warn(`Upgrading to the target JHipster version: ${this.targetJhipsterVersion}`);
          return;
        }
        this.log.verboseInfo(`Looking for latest ${GENERATOR_JHIPSTER} version...`);
        this.targetJhipsterVersion = await latestVersion(GENERATOR_JHIPSTER);
        if (semver.lt(this.currentJhipsterVersion, this.targetJhipsterVersion)) {
          this.log.ok(`New ${GENERATOR_JHIPSTER} version found: ${this.targetJhipsterVersion}`);
        } else if (this.force) {
          this.log.log(chalk.yellow('Forced re-generation'));
        } else if (!this.newBlueprintVersionFound) {
          throw new Error(`${chalk.green('No update available.')} Application has already been generated with latest version.`);
        }
      },

      assertGitRepository() {
        const gitInit = () => {
          const gitInit = this.spawnSync('git', ['init'], { stdio: 'pipe', reject: false });
          if (gitInit.exitCode !== 0) throw new Error(`Unable to initialize a new Git repository:\n${gitInit.stdout} ${gitInit.stderr}`);
          this.log.ok('Initialized a new Git repository');
          this._gitCommitAll('Initial');
        };
        const gitRevParse = this.spawnSync('git', ['rev-parse', '-q', '--is-inside-work-tree'], { stdio: 'pipe', reject: false });
        if (gitRevParse.exitCode !== 0) gitInit();
        else this.log.ok('Git repository detected');
      },

      assertNoLocalChanges() {
        const gitStatus = this.spawnSync('git', ['status', '--porcelain'], { stdio: 'pipe', reject: false });
        if (gitStatus.exitCode !== 0) throw new Error(`Unable to check for local changes:\n${gitStatus.stdout} ${gitStatus.stderr}`);
        if (gitStatus.stdout) {
          this.log.warn(gitStatus.stdout);
          throw new Error(' local changes found.\n\tPlease commit/stash them before upgrading');
        }
      },

      detectCurrentBranch() {
        const gitRevParse = this.spawnSync('git', ['rev-parse', '-q', '--abbrev-ref', 'HEAD'], { stdio: 'pipe', reject: false });
        if (gitRevParse.exitCode !== 0)
          throw new Error(`Unable to detect current Git branch:\n${gitRevParse.stdout} ${gitRevParse.stderr}`);
        this.sourceBranch = gitRevParse.stdout.replace('\n', '');
      },

      async prepareUpgradeBranch() {
        const getGitVersion = () => {
          const gitVersion = this.spawnSync('git', ['--version'], { stdio: 'pipe', reject: false });
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
          const gitMerge = this.spawnSync('git', args, { stdio: 'pipe', reject: false });
          if (gitMerge.exitCode !== 0) {
            throw new Error(
              `Unable to record current code has been generated with version ${this.currentJhipsterVersion}:\n${gitMerge.stdout} ${gitMerge.stderr}`,
            );
          }
          this.log.ok(`Current code has been generated with version ${this.currentJhipsterVersion}`);
        };

        const installJhipsterLocally = version => {
          this._installNpmPackageLocally(GENERATOR_JHIPSTER, version);
        };

        const installBlueprintsLocally = () => {
          if (!this.blueprints || this.blueprints.length < 1) {
            this.log.verboseInfo('Skipping local blueprint installation since no blueprint has been detected');
            return Promise.resolve(false);
          }

          this.log.ok('Installing blueprints locally...');
          return Promise.all(
            this.blueprints.map(blueprint => {
              return new Promise(resolve => {
                this._installNpmPackageLocally(blueprint.name, blueprint.version);
                this.log.ok(`Done installing blueprint: ${blueprint.name}@${blueprint.version}`);
                resolve();
              });
            }),
          ).then(() => {
            this.log.ok('Done installing blueprints locally');
            return true;
          });
        };

        const createUpgradeBranch = () => {
          const gitCheckout = this.spawnSync('git', ['checkout', '--orphan', UPGRADE_BRANCH], { stdio: 'pipe', reject: false });
          if (gitCheckout.exitCode !== 0)
            throw new Error(`Unable to create ${UPGRADE_BRANCH} branch:\n${gitCheckout.stdout} ${gitCheckout.stderr}`);
          this.log.ok(`Created branch ${UPGRADE_BRANCH}`);
        };

        const gitRevParse = this.spawnSync('git', ['rev-parse', '-q', '--verify', UPGRADE_BRANCH], { stdio: 'pipe', reject: false });
        if (gitRevParse.exitCode !== 0) {
          // Create and checkout upgrade branch
          createUpgradeBranch();
          // Remove/rename old files
          this._cleanUp();
          // Install jhipster
          if (!this.options.regenerateExecutable) {
            installJhipsterLocally(this.currentJhipsterVersion);
          }
          // Install blueprints
          await installBlueprintsLocally();
          const blueprintInfo =
            this.blueprints && this.blueprints.length > 0 ? ` and ${this.blueprints.map(bp => bp.name + bp.version).join(', ')} ` : '';
          // Regenerate the project
          this._regenerate(this.currentJhipsterVersion, blueprintInfo, { target: false });
          // Checkout original branch
          this._gitCheckout(this.sourceBranch);
          // Register reference for merging
          recordCodeHasBeenGenerated();
        }
      },
    });
  }

  get [BaseGenerator.DEFAULT]() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', 'upgrade');
      },

      checkoutUpgradeBranch() {
        this._gitCheckout(UPGRADE_BRANCH);
      },

      updateJhipster() {
        if (this.originalTargetJhipsterVersion === GLOBAL_VERSION || this.options.regenerateExecutable) {
          return;
        }
        this._installNpmPackageLocally(GENERATOR_JHIPSTER, this.targetJhipsterVersion);
      },

      updateBlueprints() {
        if (!this.blueprints || this.blueprints.length < 1) {
          this.log.verboseInfo('Skipping blueprint update since no blueprint has been detected');
          return undefined;
        }

        this.log.ok('Upgrading blueprints...');
        return Promise.all(
          this.blueprints.map(blueprint => {
            return new Promise(resolve => {
              this._installNpmPackageLocally(blueprint.name, blueprint.latestBlueprintVersion);
              this.log.ok(`Done upgrading blueprint ${blueprint.name} to version ${blueprint.latestBlueprintVersion}`);
              resolve();
            });
          }),
        ).then(() => {
          this.log.ok('Done upgrading blueprints');
        });
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
        this._regenerate(targetJhipsterVersion, blueprintInfo, { target: true });
      },

      checkoutSourceBranch() {
        this._gitCheckout(this.sourceBranch, { force: true });
      },

      mergeChangesBack() {
        this.log.verboseInfo(`Merging changes back to ${this.sourceBranch}...`);
        this.spawnSync('git', ['merge', '-q', UPGRADE_BRANCH], { stdio: 'pipe', reject: false });
        this.log.ok('Merge done!');
      },

      checkConflictsInPackageJson() {
        const gitDiff = this.spawnSync('git', ['diff', '--name-only', '--diff-filter=U', 'package.json'], { stdio: 'pipe', reject: false });
        if (gitDiff.exitCode !== 0) throw new Error(`Unable to check for conflicts in package.json:\n${gitDiff.stdout} ${gitDiff.stderr}`);
        if (gitDiff.stdout) {
          const installCommand = 'npm install';
          this.log.warn(`There are conflicts in package.json, please fix them and then run ${installCommand}`);
          this.skipInstall = true;
        }
      },
    };
  }

  get [BaseGenerator.INSTALL]() {
    return this.asInstallTaskGroup({
      install() {
        if (!this.skipInstall) {
          this.log.verboseInfo('Installing dependencies, please wait...');
          this.log.verboseInfo('Removing the node_modules directory');
          this._rmRf('node_modules');
          const installCommand = 'npm install';
          this.log.verboseInfo(installCommand);

          const pkgInstall = this.spawnSync(installCommand, { stdio: 'pipe', reject: false });
          if (pkgInstall.exitCode !== 0) {
            throw new Error(`${installCommand} failed.`);
          }
        } else {
          const logMsg = `Start your Webpack development server with:\n${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;
          this.log.ok(logMsg);
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return {
      end() {
        const gitDiff = this.spawnSync('git', ['diff', '--name-only', '--diff-filter=U'], { stdio: 'pipe', reject: false });
        if (gitDiff.exitCode !== 0) throw new Error(`Unable to check for conflicts:\n${gitDiff.stdout} ${gitDiff.stderr}`);
        this.log.ok(chalk.bold('Upgraded successfully.'));
        if (gitDiff.stdout) {
          this.log.warn(`Please fix conflicts listed below and commit!\n${gitDiff.stdout}`);
        }
      },
    };
  }
}
