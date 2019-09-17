/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
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
const childProcess = require('child_process');
const BaseGenerator = require('../generator-base');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const utils = require('../utils');

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster';
const UPGRADE_BRANCH = 'jhipster_upgrade';
const GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES = '2.9.0';
const FIRST_CLI_SUPPORTED_VERSION = '4.5.1'; // The first version in which CLI support was added
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.force = this.options.force;
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--target-version` flag
        this.option('target-version', {
            desc: 'Upgrade to a specific version instead of the latest',
            type: String
        });
        // This adds support for a `--target-blueprint-versions` flag
        this.option('target-blueprint-versions', {
            desc: 'Upgrade to specific blueprint versions instead of the latest, e.g. --target-blueprint-versions foo@0.0.1,bar@1.0.2',
            type: String
        });

        // This adds support for a `--skip-install` flag
        this.option('skip-install', {
            desc: 'Skips installing dependencies during the upgrade process',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--silent` flag
        this.option('silent', {
            desc: 'Hides output of the generation process',
            type: Boolean,
            defaults: false
        });

        this.targetJhipsterVersion = this.options['target-version'];
        this.targetBlueprintVersions = utils.parseBluePrints(this.options['target-blueprint-versions']);
        this.skipInstall = this.options['skip-install'];
        this.silent = this.options.silent;
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

            loadConfig() {
                this.config = this.getAllJhipsterConfig(this, true);
                this.currentJhipsterVersion = this.config.get('jhipsterVersion');
                this.blueprints = this.config.get('blueprints');
                this.clientPackageManager = this.config.get('clientPackageManager');
                this.clientFramework = this.config.get('clientFramework');
            }
        };
    }

    _gitCheckout(branch, callback) {
        this.gitExec(['checkout', '-q', branch], { silent: this.silent }, (code, msg, err) => {
            if (code !== 0) this.error(`Unable to checkout branch ${branch}:\n${err}`);
            this.success(`Checked out branch "${branch}"`);
            callback();
        });
    }

    _cleanUp() {
        const ignoredFiles = gitignore(fs.readFileSync('.gitignore'));
        const filesToKeep = ['.yo-rc.json', '.jhipster', 'node_modules', '.git', '.idea', '.mvn', ...ignoredFiles];
        shelljs.ls('-A').forEach(file => {
            if (!filesToKeep.includes(file)) {
                this.info(`Removing ${file}`);
                shelljs.rm('-rf', file);
            }
        });
        this.success('Cleaned up project directory');
    }

    _generate(jhipsterVersion, blueprintInfo, callback) {
        this.log(`Regenerating application with JHipster ${jhipsterVersion}${blueprintInfo}...`);
        let generatorCommand = 'yo jhipster';
        if (semver.gte(jhipsterVersion, FIRST_CLI_SUPPORTED_VERSION)) {
            const generatorDir =
                this.clientPackageManager === 'yarn'
                    ? shelljs.exec('yarn bin', { silent: this.silent }).stdout
                    : shelljs.exec('npm bin', { silent: this.silent }).stdout;
            generatorCommand = `"${generatorDir.replace('\n', '')}/jhipster"`;
        }
        const regenerateCmd = `${generatorCommand} --with-entities --force --skip-install --skip-git --no-insight`;
        this.info(regenerateCmd);
        try {
            childProcess.execSync(regenerateCmd, { stdio: 'inherit' });
            this.success(`Successfully regenerated application with JHipster ${jhipsterVersion}${blueprintInfo}`);
            callback();
        } catch (err) {
            this.error(`Something went wrong while generating project! ${err}`);
        }
    }

    _gitCommitAll(commitMsg, callback) {
        const commit = () => {
            this.gitExec(
                ['commit', '-q', '-m', `"${commitMsg}"`, '-a', '--allow-empty', '--no-verify'],
                { silent: this.silent },
                (code, msg, err) => {
                    if (code !== 0) this.error(`Unable to commit in git:\n${err}`);
                    this.success(`Committed with message "${commitMsg}"`);
                    callback();
                }
            );
        };
        this.gitExec(['add', '-A'], { maxBuffer: 1024 * 10000, silent: this.silent }, (code, msg, err) => {
            if (code !== 0) this.error(`Unable to add resources in git:\n${err}`);
            commit();
        });
    }

    _regenerate(jhipsterVersion, blueprintInfo, callback) {
        this._generate(jhipsterVersion, blueprintInfo, () => {
            const keystore = `${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`;
            this.info(`Removing ${keystore}`);
            shelljs.rm('-Rf', keystore);
            this._gitCommitAll(`Generated with JHipster ${jhipsterVersion}${blueprintInfo}`, () => {
                callback();
            });
        });
    }

    _retrieveLatestVersion(npmPackage, callback) {
        this.log(`Looking for latest ${npmPackage} version...`);
        const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn info' : 'npm show';
        shelljs.exec(`${commandPrefix} ${npmPackage} version`, { silent: this.silent }, (code, msg, err) => {
            if (err) {
                this.warning(`Something went wrong fetching the latest ${npmPackage} version number...\n${err}`);
                this.error('Exiting process');
            }
            const latestVersion = this.clientPackageManager === 'yarn' ? msg.split('\n')[1] : msg.replace('\n', '');
            callback(latestVersion);
        });
    }

    _installNpmPackageLocally(npmPackage, version, callback) {
        this.log(`Installing ${npmPackage} ${version} locally`);
        const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
        const devDependencyParam = this.clientPackageManager === 'yarn' ? '--dev' : '--save-dev';
        const noPackageLockParam = this.clientPackageManager === 'yarn' ? '--no-lockfile' : '--no-package-lock';
        const generatorCommand = `${commandPrefix} ${npmPackage}@${version} ${devDependencyParam} ${noPackageLockParam} --ignore-scripts`;
        this.info(generatorCommand);
        shelljs.exec(generatorCommand, { silent: this.silent }, (code, msg, err) => {
            if (code === 0) this.success(`Installed ${npmPackage}@${version}`);
            else this.error(`Something went wrong while installing ${npmPackage}! ${msg} ${err}`);
            callback();
        });
    }

    get configuring() {
        return {
            assertJHipsterProject() {
                const done = this.async();
                if (!this.config.baseName) {
                    this.error('Current directory does not contain a JHipster project.');
                }
                done();
            },

            assertGitPresent() {
                const done = this.async();
                this.isGitInstalled(code => {
                    if (code !== 0) this.error('Exiting the process.');
                    done();
                });
            },

            checkLatestBlueprintVersions() {
                if (!this.blueprints || this.blueprints.length < 0) {
                    this.log('No blueprints detected, skipping check of last blueprint version');
                    return;
                }

                this.success('Checking for new blueprint versions');
                const done = this.async();
                Promise.all(
                    this.blueprints
                        .filter(blueprint => {
                            if (this.targetBlueprintVersions && this.targetBlueprintVersions.length > 0) {
                                const targetBlueprint = this.targetBlueprintVersions.find(elem => {
                                    return elem.name === blueprint.name;
                                });
                                if (targetBlueprint && targetBlueprint.version && targetBlueprint.version !== 'latest') {
                                    this.log(
                                        `Blueprint ${targetBlueprint.name} will be upgraded to target version: ${targetBlueprint.version}`
                                    );
                                    blueprint.latestBlueprintVersion = targetBlueprint.version;
                                    return false;
                                }
                            }
                            return true;
                        })
                        .map(blueprint => {
                            return new Promise(resolve => {
                                this._retrieveLatestVersion(blueprint.name, latestVersion => {
                                    blueprint.latestBlueprintVersion = latestVersion;
                                    if (semver.lt(blueprint.version, blueprint.latestBlueprintVersion)) {
                                        this.newBlueprintVersionFound = true;
                                        this.success(`New ${blueprint.name} version found: ${this.latestBlueprintVersion}`);
                                    } else if (this.force) {
                                        this.newBlueprintVersionFound = true;
                                        this.log(chalk.yellow('Forced re-generation'));
                                    } else {
                                        if (this.newBlueprintVersionFound === undefined) {
                                            this.newBlueprintVersionFound = false;
                                        }
                                        this.warning(
                                            `${chalk.green(
                                                'No update available.'
                                            )} Application has already been generated with latest version for blueprint: ${blueprint.name}`
                                        );
                                    }
                                    this.success(`Done checking for new version for blueprint ${blueprint.name}`);
                                    resolve();
                                });
                            });
                        })
                ).then(() => {
                    this.success('Done checking for new version of blueprints');
                    done();
                });
            },

            checkLatestJhipsterVersion() {
                if (this.targetJhipsterVersion) {
                    this.log(`Upgrading to the target JHipster version: ${this.targetJhipsterVersion}`);
                    this.latestJhipsterVersion = this.targetJhipsterVersion;
                    return;
                }
                this.log(`Looking for latest ${GENERATOR_JHIPSTER} version...`);
                const done = this.async();
                this._retrieveLatestVersion(GENERATOR_JHIPSTER, latestVersion => {
                    this.latestJhipsterVersion = latestVersion;
                    if (semver.lt(this.currentJhipsterVersion, this.latestJhipsterVersion)) {
                        this.success(`New ${GENERATOR_JHIPSTER} version found: ${this.latestJhipsterVersion}`);
                    } else if (this.force) {
                        this.log(chalk.yellow('Forced re-generation'));
                    } else if (!this.newBlueprintVersionFound) {
                        this.error(`${chalk.green('No update available.')} Application has already been generated with latest version.`);
                    }
                    done();
                });
            },

            assertGitRepository() {
                const done = this.async();
                const gitInit = () => {
                    this.gitExec('init', { silent: this.silent }, (code, msg, err) => {
                        if (code !== 0) this.error(`Unable to initialize a new Git repository:\n${msg} ${err}`);
                        this.success('Initialized a new Git repository');
                        this._gitCommitAll('Initial', () => {
                            done();
                        });
                    });
                };
                this.gitExec(['rev-parse', '-q', '--is-inside-work-tree'], { silent: this.silent }, (code, msg, err) => {
                    if (code !== 0) gitInit();
                    else {
                        this.success('Git repository detected');
                        done();
                    }
                });
            },

            assertNoLocalChanges() {
                const done = this.async();
                this.gitExec(['status', '--porcelain'], { silent: this.silent }, (code, msg, err) => {
                    if (code !== 0) this.error(`Unable to check for local changes:\n${msg} ${err}`);
                    if (msg) {
                        this.warning(' local changes found.\n\tPlease commit/stash them before upgrading');
                        this.error('Exiting process');
                    }
                    done();
                });
            },

            detectCurrentBranch() {
                const done = this.async();
                this.gitExec(['rev-parse', '-q', '--abbrev-ref', 'HEAD'], { silent: this.silent }, (code, msg, err) => {
                    if (code !== 0) this.error(`Unable to detect current Git branch:\n${msg} ${err}`);
                    this.sourceBranch = msg.replace('\n', '');
                    done();
                });
            },

            prepareUpgradeBranch() {
                const done = this.async();
                const getGitVersion = callback => {
                    this.gitExec(['--version'], { silent: this.silent }, (code, msg) => {
                        callback(String(msg.match(/([0-9]+\.[0-9]+\.[0-9]+)/g)));
                    });
                };

                const recordCodeHasBeenGenerated = () => {
                    getGitVersion(gitVersion => {
                        let args;
                        if (semver.lt(gitVersion, GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES)) {
                            args = ['merge', '--strategy=ours', '-q', '--no-edit', UPGRADE_BRANCH];
                        } else {
                            args = ['merge', '--strategy=ours', '-q', '--no-edit', '--allow-unrelated-histories', UPGRADE_BRANCH];
                        }
                        this.gitExec(args, { silent: this.silent }, (code, msg, err) => {
                            if (code !== 0) {
                                this.error(
                                    `Unable to record current code has been generated with version ${
                                        this.currentJhipsterVersion
                                    }:\n${msg} ${err}`
                                );
                            }
                            this.success(`Current code has been generated with version ${this.currentJhipsterVersion}`);
                            done();
                        });
                    });
                };

                const installJhipsterLocally = (version, callback) => {
                    this._installNpmPackageLocally(GENERATOR_JHIPSTER, version, callback);
                };

                const installBlueprintsLocally = callback => {
                    if (!this.blueprints || this.blueprints.length < 1) {
                        this.log('Skipping local blueprint installation since no blueprint has been detected');
                        callback();
                        return;
                    }

                    this.success('Installing blueprints locally...');
                    Promise.all(
                        this.blueprints.map(blueprint => {
                            return new Promise(resolve => {
                                this._installNpmPackageLocally(blueprint.name, blueprint.version, () => {
                                    this.success(`Done installing blueprint: ${blueprint.name}@${blueprint.version}`);
                                    resolve();
                                });
                            });
                        })
                    ).then(() => {
                        this.success('Done installing blueprints locally');
                        callback();
                    });
                };

                const regenerate = () => {
                    this._cleanUp();
                    installJhipsterLocally(this.currentJhipsterVersion, () => {
                        installBlueprintsLocally(() => {
                            const blueprintInfo =
                                this.blueprints && this.blueprints.length > 0
                                    ? ` and ${this.blueprints.map(bp => bp.name + bp.version).join(', ')} `
                                    : '';
                            this._regenerate(this.currentJhipsterVersion, blueprintInfo, () => {
                                this._gitCheckout(this.sourceBranch, () => {
                                    // consider code up-to-date
                                    recordCodeHasBeenGenerated();
                                });
                            });
                        });
                    });
                };

                const createUpgradeBranch = () => {
                    this.gitExec(['checkout', '--orphan', UPGRADE_BRANCH], { silent: this.silent }, (code, msg, err) => {
                        if (code !== 0) this.error(`Unable to create ${UPGRADE_BRANCH} branch:\n${msg} ${err}`);
                        this.success(`Created branch ${UPGRADE_BRANCH}`);
                        regenerate();
                    });
                };

                this.gitExec(['rev-parse', '-q', '--verify', UPGRADE_BRANCH], { silent: this.silent }, (code, msg, err) => {
                    if (code !== 0) createUpgradeBranch();
                    else done();
                });
            }
        };
    }

    get default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'upgrade');
            },

            checkoutUpgradeBranch() {
                const done = this.async();
                this._gitCheckout(UPGRADE_BRANCH, done);
            },

            updateJhipster() {
                const done = this.async();
                this._installNpmPackageLocally(GENERATOR_JHIPSTER, this.latestJhipsterVersion, done);
            },

            updateBlueprints() {
                if (!this.blueprints || this.blueprints.length < 1) {
                    this.log('Skipping blueprint update since no blueprint has been detected');
                    return;
                }

                this.success('Upgrading blueprints...');
                const done = this.async();
                Promise.all(
                    this.blueprints.map(blueprint => {
                        return new Promise(resolve => {
                            this._installNpmPackageLocally(blueprint.name, blueprint.latestBlueprintVersion, () => {
                                this.success(`Done upgrading blueprint ${blueprint.name} to version ${blueprint.latestBlueprintVersion}`);
                                resolve();
                            });
                        });
                    })
                ).then(() => {
                    this.success('Done upgrading blueprints');
                    done();
                });
            },

            generateWithLatestVersion() {
                const done = this.async();
                this._cleanUp();

                const blueprintInfo = this.blueprints
                    ? ` and ${this.blueprints.map(bp => bp.name + bp.latestBlueprintVersion).join(', ')} `
                    : '';
                this._regenerate(this.latestJhipsterVersion, blueprintInfo, done);
            },

            checkoutSourceBranch() {
                const done = this.async();
                this._gitCheckout(this.sourceBranch, done);
            },

            mergeChangesBack() {
                this.log(`Merging changes back to ${this.sourceBranch}...`);
                const done = this.async();
                this.gitExec(['merge', '-q', UPGRADE_BRANCH], { silent: this.silent }, (code, msg, err) => {
                    this.success('Merge done!');
                    done();
                });
            },

            checkConflictsInPackageJson() {
                const done = this.async();
                this.gitExec(['diff', '--name-only', '--diff-filter=U', 'package.json'], { silent: this.silent }, (code, msg, err) => {
                    if (code !== 0) this.error(`Unable to check for conflicts in package.json:\n${msg} ${err}`);
                    if (msg) {
                        const installCommand = this.clientPackageManager === 'yarn' ? 'yarn' : 'npm install';
                        this.warning(`There are conflicts in package.json, please fix them and then run ${installCommand}`);
                        this.skipInstall = true;
                    }
                    done();
                });
            }
        };
    }

    install() {
        const done = this.async();
        if (!this.skipInstall) {
            this.log('Installing dependencies, please wait...');
            this.info('Removing the node_modules directory');
            shelljs.rm('-rf', 'node_modules');
            const installCommand = this.clientPackageManager === 'yarn' ? 'yarn' : 'npm install';
            this.info(installCommand);
            shelljs.exec(installCommand, { silent: this.silent }, (code, msg, err) => {
                if (code !== 0) {
                    this.error(`${installCommand} failed.`);
                }
                done();
            });
        } else {
            const logMsg = `Start your Webpack development server with:\n${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;
            this.success(logMsg);
            done();
        }
    }

    end() {
        const done = this.async();
        this.gitExec(['diff', '--name-only', '--diff-filter=U'], { silent: this.silent }, (code, msg, err) => {
            if (code !== 0) this.error(`Unable to check for conflicts:\n${msg} ${err}`);
            this.success(chalk.bold('Upgraded successfully.'));
            if (msg) {
                this.warning(`Please fix conflicts listed below and commit!\n${msg}`);
            }
            done();
        });
    }
};
