'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    scriptBase = require('../generator-base'),
    packagejs = require('../../package.json'),
    fs = require('fs'),
    shelljs = require('shelljs'),
    exec = require('child_process').exec,
    semver = require('semver'),
    Git = require('git-wrapper');

var UpgradeGenerator = generators.Base.extend({});

util.inherits(UpgradeGenerator, scriptBase);

/* Constants used throughout */
const GENERATOR_JHIPSTER = 'generator-jhipster',
    UPGRADE_BRANCH = 'jhipster_upgrade';

module.exports = UpgradeGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        this.currentVersion = packagejs.version;
        this.force = true;

        this.gitCheckout = function(branch) {
            var git = new Git();
            var done = this.async();
            git.exec('checkout', {q: true}, [branch], function(err, msg) {
                if (err != null) throw new Error(err);
                this.log('Checked out branch ' + branch);
                done();
            }.bind(this));
        };
    },

    initializing: {
        displayLogo: function () {
            this.printJHipsterLogo();
        }
    },

    configuring: {
        assertGitPresent: function() {
            var done = this.async();
            exec('git --version', function (err) {
                if (err) {
                    this.log(chalk.yellow.bold('WARNING!') + ' git is not found on your computer.\n',
                        ' Install git: ' + chalk.yellow('http://git-scm.com/')
                    );
                    return;
                }
                done();
            }.bind(this));
        },

        assertGitRepository: function() {
            if (! fs.existsSync('.git')) {
                this.log(chalk.yellow.bold('WARNING!') + ' no git repository found.\n',
                    ' Please initialize a git repository here');
                return;
            }
        },

        assertNoLocalChanges: function() {
            var git = new Git();
            var done = this.async();
            git.exec('status', {}, ['--porcelain'], function(err, msg) {
                if (err != null) throw new Error(err);
                if (msg != null && msg !== '') {
                    this.log(chalk.yellow.bold('WARNING!') + ' local changes found.\n',
                        ' Please initialize commit/stash them before upgrading');
                    return;
                } else {
                    this.log('No local changes found');
                }
                done();
            }.bind(this));
        },

        checkLatestVersion: function() {
            this.log(chalk.green.bold('Looking for latest ' + GENERATOR_JHIPSTER + ' version\n'));
            var done = this.async();
            shelljs.exec('npm show ' + GENERATOR_JHIPSTER + ' version', {silent:true}, function (code, stdout, stderr) {
                this.latestVersion = stdout.replace('\n','');
                if (this.force || semver.lt(this.currentVersion, this.latestVersion)) {
                    this.log(chalk.green('New ' + GENERATOR_JHIPSTER + ' version found: ' + this.latestVersion));
                } else {
                    this.log(chalk.green('No update available'));
                    return;
                }
                done();
            }.bind(this));
        },

        detectCurrentBranch: function() {
//            this.log(chalk.green.bold('detectCurrentBranch\n'));
            var git = new Git();
            var done = this.async();
            git.exec('rev-parse', {q: true}, ['--abbrev-ref', 'HEAD'], function(err, msg) {
                this.currentBranch = msg;
//                this.log(chalk.green.bold('current branch: ' + this.currentBranch));
                done();
            }.bind(this));
        },

        prepareUpgradeBranch: function() {
            this.log(chalk.green.bold('prepareUpgradeBranch\n'));
            var git = new Git();
            var done = this.async();
            var createUpgradeBranch = function() {
                this.log(chalk.green.bold('create branch'));
                git.exec('branch', {q: true}, [UPGRADE_BRANCH], function(err, msg) {
                    if (err != null) throw new Error(err);
                    this.log('Created branch ' + UPGRADE_BRANCH);
                }.bind(this));
            }.bind(this);
            git.exec('rev-parse', {q: true}, ['--verify', UPGRADE_BRANCH], function(err, msg) {
                if (err != null) createUpgradeBranch();
                else this.log('Branch ' + UPGRADE_BRANCH + ' already exists');
                done();
            }.bind(this));
        },

        checkoutUpgradeBranch: function() {
            this.gitCheckout(UPGRADE_BRANCH);
        }
    },

    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'upgrade');
        },

        updateJhipster: function() {
            this.log(chalk.green.bold('Update ' + GENERATOR_JHIPSTER));
            var done = this.async();
            shelljs.exec('npm uninstall -g ' + GENERATOR_JHIPSTER, {silent:true}, function (code, stdout, stderr) {
            }.bind(this));
            shelljs.exec('npm install -g ' + GENERATOR_JHIPSTER, {silent:true}, function (code, stdout, stderr) {
                done();
            }.bind(this));
            this.log(chalk.green.bold('Updated ' + GENERATOR_JHIPSTER + ' to version ' + this.latestVersion));
        },

        generate: function() {
            this.log(chalk.green.bold('Regenerate app with jhipster ' + this.currentVersion));
            this.log('Remove all resources in folder');
            var git = new Git();
            var done = this.async();
            git.exec('rm', {q: true}, ['-rf', '--ignore-unmatch', '*'], function(err, msg) {
                if (err != null) throw new Error(err);
                this.log('Removed every git resource in directory');
            }.bind(this));
            shelljs.exec('rm -rf *', {silent:true}, function (code, stdout, stderr) {
            }.bind(this));
            shelljs.exec('yo jhipster --force --with-entities', {silent:true}, function (code, stdout, stderr) {
                done();
            }.bind(this));
        },

        checkoutSourceBranch: function() {
            this.gitCheckout(this.currentBranch);
        },

        mergeChangesBack: function() {
            this.log(chalk.green.bold('Merging changes back to ' + this.currentBranch + '...'));
            var git = new Git();
            var done = this.async();
            git.exec('merge', {q: true}, [UPGRADE_BRANCH], function(err, msg) {
                if (err != null) throw new Error(err);
                this.log('Please now fix conflicts if any, and commit !');
                done();
            }.bind(this));
        }
    },

    end: function () {
        if (this.abort) return;
        this.log(chalk.green.bold('\nUpgraded successfully.\n'));
    }

});
