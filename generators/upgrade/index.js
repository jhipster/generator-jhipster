'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    scriptBase = require('../generator-base'),
    fs = require('fs'),
    shelljs = require('shelljs'),
    semver = require('semver');

var UpgradeGenerator = generators.Base.extend({});

util.inherits(UpgradeGenerator, scriptBase);

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster',
    UPGRADE_BRANCH = 'jhipster_upgrade';

module.exports = UpgradeGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.force = this.options['force'];
    },

    initializing: {
        displayLogo: function () {
            this.log(chalk.green('Welcome to the JHipster Upgrade Sub-Generator '));
            this.log(chalk.green('This will upgrade your current application codebase to the latest JHipster version'));
        },

        getCurrentJHVersion: function () {
            this.currentVersion = this.config.get('jhipsterVersion');
        }
    },

    _gitCheckout: function(branch) {
        var done = this.async();
        this.gitExec(['checkout', '-q', branch], function(code, msg, err) {
            if (code !== 0) this.error('Unable to checkout branch ' + branch + ':\n' + err);
            this.log('Checked out branch \'' + branch + '\'');
            done();
        }.bind(this));
    },

    _gitCommitAll: function(commitMsg, callback) {
        var commit = function() {
            this.gitExec(['commit', '-q', '-m', '\"' + commitMsg + '\"', '-a', '--allow-empty'], function(code, msg, err) {
                if (code !== 0) this.error('Unable to commit in git:\n' + err);
                this.log('Committed: ' + commitMsg);
                callback();
            }.bind(this));
        }.bind(this);
        this.gitExec(['add', '-A'], {maxBuffer: 1024 * 500}, function(code, msg, err) {
            if (code !== 0) this.error('Unable to add resources in git:\n' + err);
            commit();
        }.bind(this));
    },

    configuring: {
        assertGitPresent: function() {
            var done = this.async();
            this.isGitInstalled(function (code) {
                if (code !== 0) this.error('Exiting the process.');
                done();
            }.bind(this));
        },

        checkLatestVersion: function() {
            this.log('Looking for latest ' + GENERATOR_JHIPSTER + ' version...');
            var done = this.async();
            shelljs.exec('npm show ' + GENERATOR_JHIPSTER + ' version', {silent:true}, function (code, msg, err) {
                this.latestVersion = msg.replace('\n','');
                if (semver.lt(this.currentVersion, this.latestVersion)) {
                    this.log(chalk.green('New ' + GENERATOR_JHIPSTER + ' version found: ' + this.latestVersion));
                } else if (this.force) {
                    this.log(chalk.yellow('Forced re-generation'));
                } else {
                    this.error(chalk.green('No update available.') + ' Application has already been generated with latest version.');
                }
                done();
            }.bind(this));
        },

        assertGitRepository: function() {
            if (! fs.existsSync('.git')) {
                var done = this.async();
                this.gitExec('init', function(code, msg, err) {
                    if (code !== 0) this.error('Unable to initialize a new git repository:\n' + err);
                    this.log('Initialized a new git repository');
                    this._gitCommitAll('Initial', function() {
                        done();
                    });
                }.bind(this));
            }
        },

        assertNoLocalChanges: function() {
            var done = this.async();
            this.gitExec(['status', '--porcelain'], function(code, msg, err) {
                if (code !== 0) this.error('Unable to check for local changes:\n' + err);
                if (msg != null && msg !== '') {
                    this.warning(' local changes found.\n' +
                        '\tPlease commit/stash them before upgrading');
                    this.error('Exiting process');
                }
                done();
            }.bind(this));
        },

        detectCurrentBranch: function() {
            var done = this.async();
            this.gitExec(['rev-parse', '-q', '--abbrev-ref', 'HEAD'], function(code, msg, err) {
                if (code !== 0) this.error('Unable to detect current git branch:\n' + err);
                this.sourceBranch = msg.replace('\n','');
                done();
            }.bind(this));
        },

        prepareUpgradeBranch: function() {
            var done = this.async();
            var createUpgradeBranch = function(callback) {
                this.gitExec(['branch', '-q', UPGRADE_BRANCH], function(code, msg, err) {
                    if (code !== 0) this.error('Unable to create ' + UPGRADE_BRANCH + ':\n' + err);
                    this.log('Created branch ' + UPGRADE_BRANCH);
                    this._gitCheckout(UPGRADE_BRANCH);
                    callback();
                }.bind(this));
            }.bind(this);
            this.gitExec(['rev-parse', '-q', '--verify', UPGRADE_BRANCH], function(code, msg, err) {
                if (code !== 0) createUpgradeBranch(done);
                else done();
            }.bind(this));
        }
    },

    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'upgrade');
        },

        updateJhipster: function() {
            this.log('Updating ' + GENERATOR_JHIPSTER + '. This might take some time...');
            var done = this.async();
            shelljs.exec('npm install -g ' + GENERATOR_JHIPSTER, {silent:true}, function (code, msg, err) {
                if (code === 0) this.log(chalk.green('Updated ' + GENERATOR_JHIPSTER + ' to version ' + this.latestVersion));
                else this.error('Something went wrong while updating generator! ' + err);
                done();
            }.bind(this));
        },

        cleanUp: function() {
            var done = this.async();
            if (shelljs.rm('-rf', '!(.yo-rc.json|.git)').code === 0 ) {
                this.log('Cleaned up directory');
            }
            done();
        },

        generate: function() {
            this.log('Regenerating app with jhipster ' + this.latestVersion + '...');
            var done = this.async();
            shelljs.exec('yo jhipster --force --with-entities', {silent:false}, function (code, msg, err) {
                if (code === 0) this.log(chalk.green('Successfully regenerated app with jhipster ' + this.latestVersion));
                else this.error('Something went wrong while generating project! '+ err);
                done();
            }.bind(this));
        },

        commitChanges: function() {
            var done = this.async();
            this._gitCommitAll('Upgrade to JHipster ' + this.latestVersion, function() {
                done();
            });
        },

        checkoutSourceBranch: function() {
            this._gitCheckout(this.sourceBranch);
        },

        mergeChangesBack: function() {
            this.log('Merging changes back to ' + this.sourceBranch + '...');
            var done = this.async();
            this.gitExec(['merge', '-q', UPGRADE_BRANCH], function(code, msg, err) {
                if (code !== 0) this.error('Unable to merge changes back to ' + this.sourceBranch + ':\n' + err);
                this.log(chalk.green('Merge done !') + '\n\tPlease now fix conflicts if any, and commit !');
                done();
            }.bind(this));
        }
    },

    end: function () {
        this.log(chalk.green.bold('\nUpgraded successfully.\n'));
    }

});
