'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    scriptBase = require('../generator-base'),
    jhutil = require('../util'),
    fs = require('fs'),
    shelljs = require('shelljs');

var RemoveEntityGenerator = generators.Base.extend({});

util.inherits(RemoveEntityGenerator, scriptBase);

/* Constants used throughout */
const REMOVE_ENTITY_BRANCH = 'jhipster_remove_entity';

module.exports = RemoveEntityGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.force = this.options['force'];
        this.argument('entityName', { type: String, required: true });
    },

    initializing: {
        displayLogo: function () {
            this.log(chalk.green('Welcome to the JHipster Remove entity Sub-Generator '));
            this.log(chalk.green('This will remove the entity ' + this.entityName));
        },

        getCurrentJHVersion: function () {
            this.currentVersion = this.config.get('jhipsterVersion');
        }
    },

    configuring: {
        assertGitPresent: function() {
            var done = this.async();
            this.isGitInstalled(function (code) {
                if (code !== 0) this.error('Exiting the process.');
                done();
            }.bind(this));
        },

        assertGitRepository: function() {
            var done = this.async();
            jhutil.initGitRepoIfNeeded(this, done);
        },

        assertNoLocalChanges: function() {
            var done = this.async();
            jhutil.assertNoLocalChangesInRepository(this, done);
        },

        detectCurrentBranch: function() {
            var done = this.async();
            jhutil.getCurrentBranchName(this, function(branchName) {
                this.sourceBranch = branchName;
                done();
            }.bind(this));
        },

        prepareEntityRemovalBranch: function() {
            var done = this.async();
            jhutil.createBranchAndGenerateApp(
                REMOVE_ENTITY_BRANCH,
                this.sourceBranch,
                true,
                this.currentVersion,
                'Generated app with entity ' + this.entityName,
                this,
                done
            );
        }
    },

    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'remove_entity');
        },

        removeEntityFile: function() {
            shelljs.rm('.jhipster/' + this.entityName + '.json');
        },

        checkoutEntityRemovalBranch: function() {
            var done = this.async();
            jhutil.gitCheckoutBranch(REMOVE_ENTITY_BRANCH, this, done);
        },

        generateWithLatestVersion: function() {
            var done = this.async();
            jhutil.cleanUpDirBeforeAppGeneration(this);
            jhutil.regenerateJHipsterApp(this.currentVersion, 'Generated app without entity ' + this.entityName, this, done);
        },

        checkoutSourceBranch: function() {
            var done = this.async();
            jhutil.gitCheckoutBranch(this.sourceBranch, this, done);
        },

        mergeChanges: function() {
            this.log('Merging changes to ' + this.sourceBranch + '...');
            var done = this.async();
            // Merge using theirs strategy for modified files
            this.gitExec(['merge', '-q', REMOVE_ENTITY_BRANCH, '--no-commit', '--no-ff', '-X', 'theirs'], function(code, msg, err) {
                done();
            }.bind(this));
        },

        resolveDeletedByThemConflicts: function() {
            var done = this.async();
            //Resolve remaining unmerged files by deleting them
            this.gitExec(['diff', '--name-only', '--diff-filter', 'U'], function(code, msg, err) {
                msg.trim().split('\n').forEach( file => shelljs.rm(file));
                done();
                this.gitExec(['add', '-A'], {maxBuffer: 1024 * 500}, function(code, msg, err) {
                    if (code !== 0) this.error('Unable to add resources in git:\n' + err);
                    //Cancel merge preserving changes
                    shelljs.rm('.git/MERGE_HEAD');
                    done();
                }.bind(this));
            }.bind(this));
        },

        revertMergeCommit: function() {
            var done = this.async();
            this.gitExec(['reset', 'HEAD~'], function(code, msg, err) {
                done();
            });
        },

        removeEntityRemovalBranch: function() {
            var done = this.async();
            this.gitExec(['branch', '-D', REMOVE_ENTITY_BRANCH], function(code, msg, err) {
                done();
            });
        }
    },

    install: function () {
        if (!this.config.get('skipClient')) {
            this.spawnCommandSync('gulp', ['inject']);
        }
    },

    end: function () {
        this.log(chalk.green.bold('\nSuccessfully removed entity ' + this.entityName + '. Please check and commit!'));
    }

});
