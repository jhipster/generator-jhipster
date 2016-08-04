'use strict';
var util = require('util'),
    fs = require('fs'),
    generators = require('yeoman-generator'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    _ = require('lodash'),
    scriptBase = require('../generator-base');

const constants = require('../generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

var HerokuGenerator = generators.Base.extend({});

util.inherits(HerokuGenerator, scriptBase);

module.exports = HerokuGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
    },
    initializing: function () {
        this.log(chalk.bold('Heroku configuration is starting'));
        this.env.options.appPath = this.config.get('appPath') || CLIENT_MAIN_SRC_DIR;
        this.baseName = this.config.get('baseName');
        this.packageName = this.config.get('packageName');
        this.packageFolder = this.config.get('packageFolder');
        this.hibernateCache = this.config.get('hibernateCache');
        this.databaseType = this.config.get('databaseType');
        this.prodDatabaseType = this.config.get('prodDatabaseType');
        this.angularAppName = this.getAngularAppName();
        this.buildTool = this.config.get('buildTool');
        this.applicationType = this.config.get('applicationType');
    },

    prompting: function () {
        var done = this.async();

        var prompts = [
            {
                type: 'input',
                name: 'herokuDeployedName',
                message: 'Name to deploy as:',
                default: this.baseName
            },
            {
                type: 'list',
                name: 'herokuRegion',
                message: 'On which region do you want to deploy ?',
                choices: ['us', 'eu'],
                default: 0
            }];

        this.prompt(prompts, function (props) {
            this.herokuDeployedName = _.kebabCase(props.herokuDeployedName);
            this.herokuRegion = props.herokuRegion;
            done();
        }.bind(this));
    },
    configuring: {
        checkInstallation: function () {
            if (this.abort) return;
            var done = this.async();

            exec('heroku --version', function (err) {
                if (err) {
                    this.log.error('You don\'t have the Heroku Toolbelt installed. ' +
                        'Download it from https://toolbelt.heroku.com/');
                    this.abort = true;
                }
                done();
            }.bind(this));
        }
    },

    default: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'heroku');
        },

        gitInit: function () {
            if (this.abort) return;
            var done = this.async();

            try {
                fs.lstatSync('.git');
                this.log(chalk.bold('\nUsing existing Git repository'));
                done();
            } catch (e) {
                // An exception is thrown if the folder doesn't exist
                this.log(chalk.bold('\nInitializing Git repository'));
                var child = exec('git init', {}, function (err, stdout, stderr) {
                    done();
                }.bind(this));
                child.stdout.on('data', function (data) {
                    this.log(data.toString());
                }.bind(this));
            }
        },

        installHerokuDeployPlugin: function () {
            if (this.abort) return;
            var done = this.async();
            this.log(chalk.bold('\nInstalling Heroku CLI deployment plugin'));
            var child = exec('heroku plugins:install https://github.com/heroku/heroku-deploy', function (err, stdout) {
                if (err) {
                    this.abort = true;
                    this.log.error(err);
                }
                done();
            }.bind(this));

            child.stdout.on('data', function (data) {
                this.log(data.toString());
            }.bind(this));
        },

        herokuCreate: function () {
            if (this.abort) return;
            var done = this.async();

            var regionParams = (this.herokuRegion !== 'us') ? ' --region ' + this.herokuRegion : '';

            var dbAddOn = '';
            if (this.prodDatabaseType === 'postgresql') {
                dbAddOn = ' --addons heroku-postgresql';
            } else if (this.prodDatabaseType === 'mysql') {
                dbAddOn = ' --addons jawsdb:kitefin';
            } else if (this.prodDatabaseType === 'mongodb') {
                dbAddOn = ' --addons mongolab:sandbox';
            }

            this.log(chalk.bold('\nCreating Heroku application and setting up node environment'));
            var herokuCreateCmd = 'heroku create ' + this.herokuDeployedName + regionParams + dbAddOn;
            this.log(herokuCreateCmd);

            var child = exec(herokuCreateCmd, {}, function (err, stdout, stderr) {
                if (err) {
                    if (stderr.indexOf('Name is already taken') > -1) {
                        var prompts = [
                            {
                                type: 'list',
                                name: 'herokuForceName',
                                message: 'The Heroku app "' + chalk.cyan(this.herokuDeployedName) + '" already exists! Use it anyways?',
                                choices: [{
                                    value: 'Yes',
                                    name: 'Yes, I have access to it'
                                }, {
                                    value: 'No',
                                    name: 'No, generate a random name'
                                }],
                                default: 0
                            }];

                        this.log('');
                        this.prompt(prompts, function (props) {
                            var getHerokuAppName = function(def, stdout) { return def; };
                            if (props.herokuForceName === 'Yes') {
                                herokuCreateCmd = 'heroku git:remote --app ' + this.herokuDeployedName;
                            } else {
                                herokuCreateCmd = 'heroku create ' + regionParams + dbAddOn;

                                // Extract from "Created random-app-name-1234... done"
                                getHerokuAppName = function(def, stdout) { return stdout.substring(stdout.indexOf('https://') + 8, stdout.indexOf('.herokuapp')); };
                            }
                            exec(herokuCreateCmd, {}, function (err, stdout, stderr) {
                                if (err) {
                                    this.abort = true;
                                    this.log.error(err);
                                } else {
                                    this.herokuDeployedName = getHerokuAppName(this.herokuDeployedName, stdout);
                                    this.log(stdout);
                                }
                                done();
                            }.bind(this));
                        }.bind(this));
                    } else {
                        this.abort = true;
                        this.log.error(err);
                        done();
                    }
                } else {
                    done();
                }
            }.bind(this));

            child.stdout.on('data', function (data) {
                var output = data.toString();
                if (data.search('Heroku credentials') >= 0) {
                    this.abort = true;
                    this.log.error('Error: Not authenticated. Run \'heroku login\' to login to your heroku account and try again.');
                    done();
                } else {
                    this.log(output);
                }
            }.bind(this));
        },

        configureJHipsterRegistry: function() {
            if (this.abort) return;
            var done = this.async();

            if (this.applicationType === 'microservice' || this.applicationType === 'gateway') {
                var prompts = [
                    {
                        type: 'input',
                        name: 'herokuJHipsterRegistry',
                        message: 'What is the URL of your JHipster Registry?'
                    }];

                this.log('');
                this.prompt(prompts, function (props) {
                    var configSetCmd = 'heroku config:set ' + 'JHIPSTER_REGISTRY_URL=' + props.herokuJHipsterRegistry + ' --app ' + this.herokuDeployedName;
                    var child = exec(configSetCmd, {}, function (err, stdout, stderr) {
                        if (err) {
                            this.abort = true;
                            this.log.error(err);
                        }
                        done();
                    }.bind(this));

                    child.stdout.on('data', function (data) {
                        this.log(data.toString());
                    }.bind(this));
                }.bind(this));
            } else {
                this.conflicter.resolve(function (err) {
                    done();
                });
            }
        },

        copyHerokuFiles: function () {
            if (this.abort) return;

            var done = this.async();
            this.log(chalk.bold('\nCreating Heroku deployment files'));

            if (this.prodDatabaseType === 'postgresql' || this.prodDatabaseType === 'mysql') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_HerokuDatabaseConfiguration.java', SERVER_MAIN_SRC_DIR + this.packageFolder + '/config/HerokuDatabaseConfiguration.java');
            }

            this.template('_bootstrap-heroku.yml', SERVER_MAIN_RES_DIR + '/config/bootstrap-heroku.yml');
            this.template('_application-heroku.yml', SERVER_MAIN_RES_DIR + '/config/application-heroku.yml');
            this.template('_Procfile', 'Procfile');

            this.conflicter.resolve(function (err) {
                done();
            });
        }
    },

    end: {
        productionBuild: function () {
            if (this.abort) return;
            var done = this.async();
            this.log(chalk.bold('\nBuilding application'));

            var child = this.buildApplication(this.buildTool, 'prod', function (err) {
                if (err) {
                    this.abort = true;
                    this.log.error(err);
                }
                done();
            }.bind(this));

            this.buildCmd = child.buildCmd;

            child.stdout.on('data', function (data) {
                this.log(data.toString());
            }.bind(this));

        },

        productionDeploy: function () {
            if (this.abort) return;
            var done = this.async();
            this.log(chalk.bold('\nDeploying application'));

            var herokuDeployCommand = 'heroku deploy:jar --jar target/*.war';
            if (this.buildTool === 'gradle') {
                herokuDeployCommand = 'heroku deploy:jar --jar build/libs/*.war';
            }

            herokuDeployCommand += ' --app ' + this.herokuDeployedName;

            this.log(chalk.bold('\nUploading your application code.\n This may take ' + chalk.cyan('several minutes') + ' depending on your connection speed...'));
            var child = exec(herokuDeployCommand, function (err, stdout) {
                if (err) {
                    this.abort = true;
                    this.log.error(err);
                }
                this.log(stdout);
                this.log(chalk.green('\nYour app should now be live. To view it run\n\t' + chalk.bold('heroku open')));
                this.log(chalk.yellow('And you can view the logs with this command\n\t' + chalk.bold('heroku logs --tail')));
                this.log(chalk.yellow('After application modification, repackage it with\n\t' + chalk.bold(this.buildCmd)));
                this.log(chalk.yellow('And then re-deploy it with\n\t' + chalk.bold(herokuDeployCommand)));
                done();
            }.bind(this));

            child.stdout.on('data', function (data) {
                this.log(data.toString());
            }.bind(this));
        }
    }
});
