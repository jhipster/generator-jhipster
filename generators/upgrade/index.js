'use strict';
const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const scriptBase = require('../generator-base');
const shelljs = require('shelljs');
const semver = require('semver');

const UpgradeGenerator = generator.extend({});

util.inherits(UpgradeGenerator, scriptBase);

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster',
    UPGRADE_BRANCH = 'jhipster_upgrade',
    GIT_VERSION_NOT_ALLOW_MERGE_UNRELATED_HISTORIES = '2.9.0';

module.exports = UpgradeGenerator.extend({
    constructor: function () {
        generator.apply(this, arguments);
        this.force = this.options['force'];
    },

    initializing: {
        displayLogo: function () {
            this.log(chalk.green('Welcome to the JHipster Upgrade Sub-Generator'));
            this.log(chalk.green('This will upgrade your current application codebase to the latest JHipster version'));
        },

        loadConfig: function () {
            this.currentVersion = this.config.get('jhipsterVersion');
            this.clientPackageManager = this.config.get('clientPackageManager');
            this.clientFramework = this.config.get('clientFramework');
            this.skipInstall = this.options['skip-install'];
        }
    },

    _gitCheckout: function(branch, callback) {
        this.gitExec(['checkout', '-q', branch], (code, msg, err) => {
            if (code !== 0) this.error('Unable to checkout branch ' + branch + ':\n' + err);
            this.log('Checked out branch \"' + branch + '\"');
            callback();
        });
    },

    _cleanUp: function() {
        shelljs.ls('-A').forEach((file) => {
            if(['.yo-rc.json', '.jhipster', 'node_modules', '.git'].indexOf(file) === -1) {
                shelljs.rm('-rf', file);
            }
        });
        this.log('Cleaned up directory');
    },

    _generate: function(version, callback) {
        this.log('Regenerating app with jhipster ' + version + '...');
        shelljs.exec('yo jhipster --with-entities --force --skip-install', { silent: true }, (code, msg, err) => {
            if (code === 0) this.log(chalk.green('Successfully regenerated app with jhipster ' + version));
            else this.error('Something went wrong while generating project! '+ err);
            callback();
        });
    },

    _gitCommitAll: function(commitMsg, callback) {
        const commit = () => {
            this.gitExec(['commit', '-q', '-m', '\"' + commitMsg + '\"', '-a', '--allow-empty'], (code, msg, err) => {
                if (code !== 0) this.error('Unable to commit in git:\n' + err);
                this.log('Committed with message \"' + commitMsg + '\"');
                callback();
            });
        };
        this.gitExec(['add', '-A'], {maxBuffer: 1024 * 500}, (code, msg, err) => {
            if (code !== 0) this.error('Unable to add resources in git:\n' + err);
            commit();
        });
    },

    _regenerate: function(version, callback) {
        this._generate(version, () => {
            if (this.clientFramework === 'angular1' && version === this.latestVersion) {
                const result = this.spawnCommandSync('bower', ['install']);
                if (result.status !== 0) {
                    this.error('bower install failed.');
                }
            }
            this._gitCommitAll('Generated with JHipster ' + version, () => {
                callback();
            });
        });
    },

    configuring: {
        assertGitPresent: function() {
            const done = this.async();
            this.isGitInstalled((code) => {
                if (code !== 0) this.error('Exiting the process.');
                done();
            });
        },

        checkLatestVersion: function() {
            this.log('Looking for latest ' + GENERATOR_JHIPSTER + ' version...');
            const done = this.async();
            const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn info' : 'npm show';
            shelljs.exec(commandPrefix + ' ' + GENERATOR_JHIPSTER + ' version', {silent:true}, (code, msg, err) => {
                this.latestVersion = this.clientPackageManager === 'yarn' ? msg.split('\n')[1] : msg.replace('\n','');
                if (semver.lt(this.currentVersion, this.latestVersion)) {
                    this.log(chalk.green('New ' + GENERATOR_JHIPSTER + ' version found: ' + this.latestVersion));
                } else if (this.force) {
                    this.log(chalk.yellow('Forced re-generation'));
                } else {
                    this.error(chalk.green('No update available.') + ' Application has already been generated with latest version.');
                }
                done();
            });
        },

        assertGitRepository: function() {
            const done = this.async();
            const gitInit = () => {
                this.gitExec('init', (code, msg, err) => {
                    if (code !== 0) this.error('Unable to initialize a new git repository:\n' + msg + ' ' + err);
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

        assertNoLocalChanges: function() {
            const done = this.async();
            this.gitExec(['status', '--porcelain'], (code, msg, err) => {
                if (code !== 0) this.error('Unable to check for local changes:\n' + msg + ' ' + err);
                if (msg != null && msg !== '') {
                    this.warning(' local changes found.\n' +
                        '\tPlease commit/stash them before upgrading');
                    this.error('Exiting process');
                }
                done();
            });
        },

        detectCurrentBranch: function() {
            const done = this.async();
            this.gitExec(['rev-parse', '-q', '--abbrev-ref', 'HEAD'], (code, msg, err) => {
                if (code !== 0) this.error('Unable to detect current git branch:\n' + msg + ' ' + err);
                this.sourceBranch = msg.replace('\n','');
                done();
            });
        },

        prepareUpgradeBranch: function() {
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
                        if (code !== 0) this.error('Unable to record current code has been generated with version ' +
                            this.currentVersion + ':\n' + msg + ' ' + err);
                        this.log('Current code recorded as generated with version ' + this.currentVersion);
                        done();
                    });
                });
            };

            const installJhipsterLocally = (version, callback) => {
                this.log('Installing JHipster ' + version + ' locally');
                const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
                shelljs.exec(commandPrefix + ' ' + GENERATOR_JHIPSTER + '@' + version + ' --dev --no-lockfile', { silent: true }, (code, msg, err) => {
                    if (code === 0) this.log(chalk.green('Installed ' + GENERATOR_JHIPSTER + '@' + version));
                    else this.error('Something went wrong while installing the JHipster generator! ' + msg + ' ' + err);
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
                    if (code !== 0) this.error('Unable to create ' + UPGRADE_BRANCH + ' branch:\n' + msg + ' ' + err);
                    this.log('Created branch ' + UPGRADE_BRANCH);
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
        insight: function () {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'upgrade');
        },

        updateJhipster: function() {
            this.log(chalk.yellow('Updating ' + GENERATOR_JHIPSTER + ' to ' + this.latestVersion +  ' . This might take some time...'));
            const done = this.async();
            const commandPrefix = this.clientPackageManager === 'yarn' ? 'yarn add' : 'npm install';
            shelljs.exec(commandPrefix + ' ' + GENERATOR_JHIPSTER + '@' + this.latestVersion + ' --dev --no-lockfile', { silent: true }, (code, msg, err) => {
                if (code === 0) this.log(chalk.green('Updated ' + GENERATOR_JHIPSTER + ' to version ' + this.latestVersion));
                else this.error('Something went wrong while updating generator! ' + msg + ' ' + err);
                done();
            });
        },

        checkoutUpgradeBranch: function() {
            const done = this.async();
            this._gitCheckout(UPGRADE_BRANCH, done);
        },

        generateWithLatestVersion: function() {
            const done = this.async();
            this._cleanUp();
            this._regenerate(this.latestVersion, done);
        },

        checkoutSourceBranch: function() {
            const done = this.async();
            this._gitCheckout(this.sourceBranch, done);
        },

        mergeChangesBack: function() {
            this.log('Merging changes back to ' + this.sourceBranch + '...');
            const done = this.async();
            this.gitExec(['merge', '-q', UPGRADE_BRANCH], (code, msg, err) => {
                this.log(chalk.green('Merge done!'));
                done();
            });
        }
    },

    install: function () {
        const done = this.async();

        const injectDependenciesAndConstants = () => {
            if (this.clientFramework === 'angular1') {
                this.spawnCommandSync('bower', ['install']);
            }
            if (this.skipInstall) {
                let logMsg =
                    'Start your Webpack development server with:' +
                    '\n ' + chalk.yellow.bold(this.clientPackageManager + ' start') +
                    '\n';

                if (this.clientFramework === 'angular1') {
                    logMsg =
                        'Inject your front end dependencies into your source code:' +
                        '\n ' + chalk.yellow.bold('gulp inject') +
                        '\n' +
                        '\nGenerate the AngularJS constants:' +
                        '\n ' + chalk.yellow.bold('gulp ngconstant:dev') +
                        (this.useSass ?
                        '\n' +
                        '\nCompile your Sass style sheets:' +
                        '\n ' + chalk.yellow.bold('gulp sass') : '') +
                        '\n' +
                        '\nOr do all of the above:' +
                        '\n ' + chalk.yellow.bold('gulp install') +
                        '\n';
                }
                this.log(chalk.green(logMsg));
            } else {
                if (this.clientFramework === 'angular1') {
                    const result = this.spawnCommandSync('gulp', ['install']);
                    if (result.status !== 0) {
                        this.error('gulp install failed.');
                    }
                }
            }
            done();
        };

        if (!this.skipInstall) {
            shelljs.rm('-rf', 'node_modules');
            this.log('Installing dependencies, please wait...');
            const installCommand = this.clientPackageManager === 'yarn' ? 'yarn' : 'npm install';
            shelljs.exec(installCommand, {silent:true}, (code, msg, err) => {
                if (code !== 0) {
                    this.error(installCommand + 'failed.');
                }
                injectDependenciesAndConstants();
            });
        } else {
            injectDependenciesAndConstants();
        }
    },

    end: function () {
        this.log(chalk.green.bold('\nUpgraded successfully. Please now fix conflicts if any, and commit!'));
    }

});
