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
        this.git = new Git();

        this.gitCheckout = function(branch) {
            var done = this.async();
            this.git.exec('checkout', {q: true}, [branch], function(err, msg) {
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
            var done = this.async();
            this.git.exec('status', {}, ['--porcelain'], function(err, msg) {
                if (err != null) throw new Error(err);
                if (msg != null && msg !== '') {
                    this.log(chalk.yellow.bold('WARNING!') + ' local changes found.\n',
                        ' Please commit/stash them before upgrading');
                    return;
                }
                done();
            }.bind(this));
        },

        checkLatestVersion: function() {
            this.log('Looking for latest ' + GENERATOR_JHIPSTER + ' version...');
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
            var done = this.async();
            this.git.exec('rev-parse', {q: true}, ['--abbrev-ref', 'HEAD'], function(err, msg) {
                if (err != null) throw new Error(err);
                this.currentBranch = msg;
                done();
            }.bind(this));
        },

        prepareUpgradeBranch: function() {
            var done = this.async();
            var createUpgradeBranch = function() {
                this.git.exec('branch', {q: true}, [UPGRADE_BRANCH], function(err, msg) {
                    if (err != null) throw new Error(err);
                    this.log('Created branch ' + UPGRADE_BRANCH);
                }.bind(this));
            }.bind(this);
            this.git.exec('rev-parse', {q: true}, ['--verify', UPGRADE_BRANCH], function(err, msg) {
                if (err != null) createUpgradeBranch();
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
            this.log('Updating ' + GENERATOR_JHIPSTER + '...');
            var done = this.async();
            shelljs.exec('npm uninstall -g ' + GENERATOR_JHIPSTER, {silent:true}, function (code, stdout, stderr) {
            }.bind(this));
            shelljs.exec('npm install -g ' + GENERATOR_JHIPSTER, {silent:true}, function (code, stdout, stderr) {
                done();
            }.bind(this));
            this.log(chalk.green('Updated ' + GENERATOR_JHIPSTER + ' to version ' + this.latestVersion));
        },

        cleanUp: function() {
            var done = this.async();
            this.git.exec('rm', {q: true}, ['-rf', '--ignore-unmatch', '*'], function(err, msg) {
                if (err != null) throw new Error(err);
            }.bind(this));
            shelljs.exec('rm -rf *', {silent:true}, function (code, stdout, stderr) {
                this.log('Removed everything in directory');
                done();
            }.bind(this));
        },

        generate: function() {
            this.log('Regenerating app with jhipster ' + this.latestVersion + '...');
            var done = this.async();
            shelljs.exec('yo jhipster --force --with-entities', {silent:true}, function (code, stdout, stderr) {
                this.log(chalk.green('Successfully regenerated app with jhipster ' + this.latestVersion + ' !'));
                done();
            }.bind(this));
        },

        checkoutSourceBranch: function() {
            this.gitCheckout(this.currentBranch);
        },

        mergeChangesBack: function() {
            this.log(chalk.green.bold('Merging changes back to ' + this.currentBranch + '...'));
            var done = this.async();
            this.git.exec('merge', {q: true}, [UPGRADE_BRANCH], function(err, msg) {
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
