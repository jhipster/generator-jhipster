/**
 * Copyright 2013-2017 the original author or authors.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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

const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const BaseGenerator = require('../generator-base');
const shelljs = require('shelljs');
const semver = require('semver');

const UpgradeGenerator = generator.extend({});

util.inherits(UpgradeGenerator, BaseGenerator);

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster';
const UPGRADE_BRANCH = 'jhipster_upgrade';
const GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES = '2.9.0';

module.exports = UpgradeGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);
        this.force = this.options.force;
    },

    initializing: {
        displayLogo() {
            this.log(chalk.green('Welcome to the JHipster Upgrade Sub-Generator'));
            this.log(chalk.green('This will upgrade your current application codebase to the latest JHipster version'));
        },

        loadConfig() {
            this.currentVersion = this.config.get('jhipsterVersion');
            this.clientPackageManager = this.config.get('clientPackageManager');
            this.clientFramework = this.config.get('clientFramework');
            this.skipInstall = this.options['skip-install'];
            this.silent = !this.options.verbose;
            this.targetVersion = this.options['target-version'];
        }
    },

    _gitCheckout(branch, callback) {
        this.gitExec(['checkout', '-q', branch], (code, msg, err) => {
            if (code !== 0) this.error(`Unable to checkout branch ${branch}:\n${err}`);
            this.log(`Checked out branch "${branch}"`);
            callback();
        });
    },

    _cleanUp() {
        shelljs.ls('-A').forEach((file) => {
            if (['.yo-rc.json', '.jhipster', 'node_modules', '.git', '.idea'].indexOf(file) === -1) {
                shelljs.rm('-rf', file);
            }
        });
        this.log('Cleaned up directory');
    },

    _generate(version, callback) {
        this.log(`Regenerating app with jhipster ${version}...`);
        shelljs.exec('yo jhipster --with-entities --force --skip-install', { silent: this.silent }, (code, msg, err) => {
            if (code === 0) this.log(chalk.green(`Successfully regenerated app with jhipster ${version}`));
            else this.error(`Something went wrong while generating project! ${err}`);
            callback();
        });
    },

    _gitCommitAll(commitMsg, callback) {
        const commit = () => {
            this.gitExec(['commit', '-q', '-m', `"${commitMsg}"`, '-a', '--allow-empty'], (code, msg, err) => {
                if (code !== 0) this.error(`Unable to commit in git:\n${err}`);
                this.log(`Committed with message "${commitMsg}"`);
                callback();
            });
        };
        this.gitExec(['add', '-A'], { maxBuffer: 1024 * 500 }, (code, msg, err) => {
            if (code !== 0) this.error(`Unable to add resources in git:\n${err}`);
            commit();
        });
    },

    _regenerate(version, callback) {
        this._generate(version, () => {
            if (this.clientFramework === 'angular1' && version === this.latestVersion) {
                const result = this.spawnCommandSync('bower', ['install']);
                if (result.status !== 0) {
                    this.error('bower install failed.');
                }
            }
            this._gitCommitAll(`Generated with JHipster ${version}`, () => {
                callback();
            });
        });
    },

    configuring: {
        assertGitPresent() {
            const done = this.async();
            this.isGitInstalled((code) => {
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
                    this.log(chalk.green(`New ${GENERATOR_JHIPSTER} version found: ${this.latestVersion}`));
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
                this.gitExec('init', (code, msg, err) => {
                    if (code !== 0) this.error(`Unable to initialize a new git repository:\n${msg} ${err}`);
                    this.log('Initialized a new git repository');
                    this._gitCommitAll('Initial', () => {
                        done();
                    });
                });
            };
            this.gitExec(['rev-parse', '-q', '--is-inside-work-tree'], (code, msg, err) => {
                if (code !== 0) gitInit();
                else {
                    this.log('Git repository detected');
                    done();
                }
            });
        },

        assertNoLocalChanges() {
            const done = this.async();
            this.gitExec(['status', '--porcelain'], (code, msg, err) => {
                if (code !== 0) this.error(`Unable to check for local changes:\n${msg} ${err}`);
                if (msg != null && msg !== '') {
                    this.warning(' local changes found.\n' +
                        '\tPlease commit/stash them before upgrading');
                    this.error('Exiting process');
                }
                done();
            });
        },

        detectCurrentBranch() {
            const done = this.async();
            this.gitExec(['rev-parse', '-q', '--abbrev-ref', 'HEAD'], (code, msg, err) => {
                if (code !== 0) this.error(`Unable to detect current git branch:\n${msg} ${err}`);
                this.sourceBranch = msg.replace('\n', '');
                done();
            });
        },

        prepareUpgradeBranch() {
            const done = this.async();
            const getGitVersion = (callback) => {
                this.gitExec(['--version'], (code, msg) => {
                    callback(String(msg.match(/([0-9]+\.[0-9]+\.[0-9]+)/g)));
                });
            };

            const recordCodeHasBeenGenerated = () => {
                getGitVersion((gitVersion) => {
                    let args;
                    if (semver.lt(gitVersion, GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES)) {
                        args = ['merge', '--strategy=ours', '-q', '--no-edit', UPGRADE_BRANCH];
                    } else {
                        args = ['merge', '--strategy=ours', '-q', '--no-edit', '--allow-unrelated-histories', UPGRADE_BRANCH];
                    }
                    this.gitExec(args, (code, msg, err) => {
                        if (code !== 0) {
                            this.error(`Unable to record current code has been generated with version ${
                            this.currentVersion}:\n${msg} ${err}`);
                        }
                        this.log(`Current code recorded as generated with version ${this.currentVersion}`);
                        done();
                    });
                });
            };

            const installJhipsterLocally = (version, callback) => {
                this.log(`Installing JHipster ${version} locally`);
                const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
                shelljs.exec(`${commandPrefix} ${GENERATOR_JHIPSTER}@${version} --dev --no-lockfile`, { silent: this.silent }, (code, msg, err) => {
                    if (code === 0) this.log(chalk.green(`Installed ${GENERATOR_JHIPSTER}@${version}`));
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
                this.gitExec(['checkout', '--orphan', UPGRADE_BRANCH], (code, msg, err) => {
                    if (code !== 0) this.error(`Unable to create ${UPGRADE_BRANCH} branch:\n${msg} ${err}`);
                    this.log(`Created branch ${UPGRADE_BRANCH}`);
                    regenerate();
                });
            };

            this.gitExec(['rev-parse', '-q', '--verify', UPGRADE_BRANCH], (code, msg, err) => {
                if (code !== 0) createUpgradeBranch();
                else done();
            });
        }
    },

    default: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'upgrade');
        },

        updateJhipster() {
            this.log(chalk.yellow(`Updating ${GENERATOR_JHIPSTER} to ${this.latestVersion} . This might take some time...`));
            const done = this.async();
            const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
            shelljs.exec(`${commandPrefix} ${GENERATOR_JHIPSTER}@${this.latestVersion} --dev --no-lockfile`, { silent: this.silent }, (code, msg, err) => {
                if (code === 0) this.log(chalk.green(`Updated ${GENERATOR_JHIPSTER} to version ${this.latestVersion}`));
                else this.error(`Something went wrong while updating generator! ${msg} ${err}`);
                done();
            });
        },

        checkoutUpgradeBranch() {
            const done = this.async();
            this._gitCheckout(UPGRADE_BRANCH, done);
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
            this.gitExec(['merge', '-q', UPGRADE_BRANCH], (code, msg, err) => {
                this.log(chalk.green('Merge done!'));
                done();
            });
        }
    },

    install() {
        const done = this.async();
        if (!this.skipInstall) {
            shelljs.rm('-rf', 'node_modules');
            this.log('Installing dependencies, please wait...');
            const installCommand = this.clientPackageManager === 'yarn' ? 'yarn' : 'npm install';
            shelljs.exec(installCommand, { silent: this.silent }, (code, msg, err) => {
                if (code !== 0) {
                    this.error(`${installCommand} failed.`);
                }
                if (this.clientFramework === 'angular1') {
                    this.spawnCommandSync('bower', ['install']);
                }
                done();
            });
        } else {
            if (this.clientFramework !== 'angular1') {
                const logMsg =
                    `Start your Webpack development server with:\n${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;
                this.log(chalk.green(logMsg));
            }
            done();
        }
    },

    end() {
        this.log(chalk.green.bold('\nUpgraded successfully. Please now fix conflicts if any, and commit!'));
    }

});
