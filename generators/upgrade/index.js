/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const BaseGenerator = require('../generator-base');
const constants = require('../generator-constants');
const statistics = require('../statistics');

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

        this.targetVersion = this.options['target-version'];
        this.skipInstall = this.options['skip-install'];
        this.silent = this.options.silent;
    }

    get initializing() {
        return {
            validateFromCli() {
                if (!this.options['from-cli']) {
                    this.warning(
                        `Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI. Run ${chalk.red(
                            'jhipster <command>'
                        )} instead of ${chalk.red('yo jhipster:<command>')}`
                    );
                }
            },

            displayLogo() {
                this.log(chalk.green('Welcome to the JHipster Upgrade Sub-Generator'));
                this.log(chalk.green('This will upgrade your current application codebase to the latest JHipster version'));
            },

            loadConfig() {
                this.config = this.getAllJhipsterConfig(this, true);
                this.currentVersion = this.config.get('jhipsterVersion');
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

    _generate(version, callback) {
        this.log(`Regenerating application with JHipster ${version}...`);
        let generatorCommand = 'yo jhipster';
        if (semver.gte(version, FIRST_CLI_SUPPORTED_VERSION)) {
            const generatorDir =
                this.clientPackageManager === 'yarn'
                    ? shelljs.exec('yarn bin', { silent: this.silent }).stdout
                    : shelljs.exec('npm bin', { silent: this.silent }).stdout;
            generatorCommand = `"${generatorDir.replace('\n', '')}/jhipster"`;
        }
        const regenerateCmd = `${generatorCommand} --with-entities --force --skip-install --no-insight`;
        this.info(regenerateCmd);
        shelljs.exec(regenerateCmd, { silent: this.silent }, (code, msg, err) => {
            if (code === 0) this.success(`Successfully regenerated application with JHipster ${version}`);
            else this.error(`Something went wrong while generating project! ${err}`);
            callback();
        });
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

    _regenerate(version, callback) {
        this._generate(version, () => {
            const keystore = `${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`;
            this.info(`Removing ${keystore}`);
            shelljs.rm('-Rf', keystore);
            this._gitCommitAll(`Generated with JHipster ${version}`, () => {
                callback();
            });
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

            checkLatestVersion() {
                if (this.targetVersion) {
                    this.log(`Upgrading to the target version: ${this.targetVersion}`);
                    this.latestVersion = this.targetVersion;
                    return;
                }
                this.log(`Looking for latest ${GENERATOR_JHIPSTER} version...`);
                const done = this.async();
                const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn info' : 'npm show';
                shelljs.exec(`${commandPrefix} ${GENERATOR_JHIPSTER} version`, { silent: this.silent }, (code, msg, err) => {
                    if (err) {
                        this.warning(`Something went wrong fetching the latest JHipster version number...\n${err}`);
                        this.error('Exiting process');
                    }
                    this.latestVersion = this.clientPackageManager === 'yarn' ? msg.split('\n')[1] : msg.replace('\n', '');
                    if (semver.lt(this.currentVersion, this.latestVersion)) {
                        this.success(`New ${GENERATOR_JHIPSTER} version found: ${this.latestVersion}`);
                    } else if (this.force) {
                        this.log(chalk.yellow('Forced re-generation'));
                    } else {
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
                                    `Unable to record current code has been generated with version ${this.currentVersion}:\n${msg} ${err}`
                                );
                            }
                            this.success(`Current code has been generated with version ${this.currentVersion}`);
                            done();
                        });
                    });
                };

                const installJhipsterLocally = (version, callback) => {
                    this.log(`Installing JHipster ${version} locally`);
                    const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
                    const generatorCommand = `${commandPrefix} ${GENERATOR_JHIPSTER}@${version} --dev --no-lockfile --ignore-scripts`;
                    this.info(generatorCommand);
                    shelljs.exec(generatorCommand, { silent: this.silent }, (code, msg, err) => {
                        if (code === 0) this.success(`Installed ${GENERATOR_JHIPSTER}@${version}`);
                        else this.error(`Something went wrong while installing the JHipster generator! ${msg} ${err}`);
                        callback();
                    });
                };

                const regenerate = () => {
                    this._cleanUp();
                    installJhipsterLocally(this.currentVersion, () => {
                        this._regenerate(this.currentVersion, () => {
                            this._gitCheckout(this.sourceBranch, () => {
                                // consider code up-to-date
                                recordCodeHasBeenGenerated();
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
                this.log(chalk.yellow(`Updating ${GENERATOR_JHIPSTER} to ${this.latestVersion} . This might take some time...`));
                const done = this.async();
                const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
                const generatorCommand = `${commandPrefix} ${GENERATOR_JHIPSTER}@${
                    this.latestVersion
                } --dev --no-lockfile --ignore-scripts`;
                this.info(generatorCommand);
                shelljs.exec(generatorCommand, { silent: this.silent }, (code, msg, err) => {
                    if (code === 0) this.success(`Updated ${GENERATOR_JHIPSTER} to version ${this.latestVersion}`);
                    else this.error(`Something went wrong while updating JHipster! ${msg} ${err}`);
                    done();
                });
            },

            generateWithLatestVersion() {
                const done = this.async();
                this._cleanUp();
                this._regenerate(this.latestVersion, done);
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
