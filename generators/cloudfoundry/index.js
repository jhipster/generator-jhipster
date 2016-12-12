'use strict';
var util = require('util'),
    os = require('os'),
    generators = require('yeoman-generator'),
    childProcess = require('child_process'),
    chalk = require('chalk'),
    glob = require('glob'),
    prompts = require('./prompts'),
    scriptBase = require('../generator-base');

const constants = require('../generator-constants');

var exec = childProcess.exec;

var CloudFoundryGenerator = generators.Base.extend({});

util.inherits(CloudFoundryGenerator, scriptBase);

module.exports = CloudFoundryGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    initializing: {
        getConfig: function () {
            this.log(chalk.bold('CloudFoundry configuration is starting'));
            this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
            this.baseName = this.config.get('baseName');
            this.buildTool = this.config.get('buildTool');
            this.packageName = this.config.get('packageName');
            this.packageFolder = this.config.get('packageFolder');
            this.hibernateCache = this.config.get('hibernateCache');
            this.databaseType = this.config.get('databaseType');
            this.devDatabaseType = this.config.get('devDatabaseType');
            this.prodDatabaseType = this.config.get('prodDatabaseType');
            this.angularAppName = this.getAngularAppName();
        }
    },

    prompting: prompts.prompting,

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'cloudfoundry');
        },

        copyCloudFoundryFiles: function () {
            if (this.abort) return;
            this.log(chalk.bold('\nCreating Cloud Foundry deployment files'));
            this.template('_manifest.yml', 'deploy/cloudfoundry/manifest.yml');
            this.template('_application-cloudfoundry.yml', constants.SERVER_MAIN_RES_DIR + 'config/application-cloudfoundry.yml');
        },

        checkInstallation: function () {
            if (this.abort) return;
            var done = this.async();

            exec('cf -v', function (err) {
                if (err) {
                    this.log.error('cloudfoundry\'s cf command line interface is not available. ' +
                        'You can install it via https://github.com/cloudfoundry/cli/releases');
                    this.abort = true;
                }
                done();
            }.bind(this));
        }
    },

    default: {
        cloudfoundryAppShow: function () {
            if (this.abort || typeof this.dist_repo_url !== 'undefined') return;
            var done = this.async();

            this.log(chalk.bold('\nChecking for an existing Cloud Foundry hosting environment...'));
            exec('cf app ' + this.cloudfoundryDeployedName + ' ', {}, function (err, stdout, stderr) {
                // Unauthenticated
                if (stdout.search('cf login') >= 0) {
                    this.log.error('Error: Not authenticated. Run \'cf login\' to login to your cloudfoundry account and try again.');
                    this.abort = true;
                }
                done();
            }.bind(this));
        },

        cloudfoundryAppCreate: function () {
            if (this.abort || typeof this.dist_repo_url !== 'undefined') return;
            var done = this.async();

            this.log(chalk.bold('\nCreating your Cloud Foundry hosting environment, this may take a couple minutes...'));

            if (this.databaseType !== 'no') {
                this.log(chalk.bold('Creating the database'));
                var child = exec('cf create-service ' + this.cloudfoundryDatabaseServiceName + ' ' + this.cloudfoundryDatabaseServicePlan + ' ' + this.cloudfoundryDeployedName, {}, function (err, stdout, stderr) {
                    done();
                }.bind(this));
                child.stdout.on('data', function (data) {
                    this.log(data.toString());
                }.bind(this));
            } else {
                done();
            }
        },

        productionBuild: function () {
            if (this.abort) return;
            var done = this.async();

            this.log(chalk.bold('\nBuilding the application with the ' + this.cloudfoundryProfile + ' profile'));

            var child = this.buildApplication(this.buildTool, this.cloudfoundryProfile, function (err) {
                if (err) {
                    this.log.error(err);
                }
                done();
            }.bind(this));

            this.buildCmd = child.buildCmd;

            child.stdout.on('data', function (data) {
                this.log(data.toString());
            }.bind(this));
        }
    },

    end: {
        cloudfoundryPush: function () {
            if (this.abort) return;
            var done = this.async();
            var cloudfoundryDeployCommand = 'cf push -f ./deploy/cloudfoundry/manifest.yml -p';
            var warFolder = '';
            if (this.buildTool === 'maven') {
                warFolder = ' target/';
            } else if (this.buildTool === 'gradle') {
                warFolder = ' build/libs/';
            }
            if (os.platform() === 'win32') {
                cloudfoundryDeployCommand += ' ' + glob.sync(warFolder.trim() + '*.war')[0];
            } else {
                cloudfoundryDeployCommand += warFolder + '*.war';
            }

            this.log(chalk.bold('\nPushing the application to Cloud Foundry'));
            var child = exec(cloudfoundryDeployCommand, function (err) {
                if (err) {
                    this.log.error(err);
                }
                this.log(chalk.green('\nYour app should now be live'));
                this.log(chalk.yellow('After application modification, repackage it with\n\t' + chalk.bold(this.buildCmd)));
                this.log(chalk.yellow('And then re-deploy it with\n\t' + chalk.bold(cloudfoundryDeployCommand)));
                done();
            }.bind(this));

            child.stdout.on('data', function (data) {
                this.log(data.toString());
            }.bind(this));
        },

        restartApp: function () {
            if (this.abort || !this.cloudfoundry_remote_exists) return;
            this.log(chalk.bold('\nRestarting your cloudfoundry app.\n'));

            exec('cf restart ' + this.cloudfoundryDeployedName, function (err, stdout, stderr) {
                this.log(chalk.green('\nYour app should now be live'));
                this.log(chalk.yellow('After application modification, re-deploy it with\n\t' + chalk.bold('gulp deploycloudfoundry')));
            }.bind(this));
        }
    }
});
