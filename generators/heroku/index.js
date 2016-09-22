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
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

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
        this.herokuAppName = this.config.get('herokuAppName');
    },

    prompting: function () {
        var done = this.async();

        if (this.herokuAppName) {
            exec('heroku apps:info --json', function (err, stdout) {
                if (err) {
                    this.abort = true;
                    this.log.error(err);
                } else {
                    var json = JSON.parse(stdout);
                    this.herokuAppName = json['app']['name'];
                    this.log(`Deploying as existing app: ${chalk.bold(this.herokuAppName)}`);
                    this.herokuAppExists = true;
                    this.config.set('herokuAppName', this.herokuAppName);
                }
                done();
            }.bind(this));
        } else {
            var prompts = [
                {
                    type: 'input',
                    name: 'herokuAppName',
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

            this.prompt(prompts).then(function (props) {
                this.herokuAppName = _.kebabCase(props.herokuAppName);
                this.herokuRegion = props.herokuRegion;
                this.herokuAppExists = false;
                done();
            }.bind(this));
        }
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
            var child = exec('heroku plugins:install heroku-cli-deploy', function (err, stdout) {
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
            if (this.abort || this.herokuAppExists) return;
            var done = this.async();

            var regionParams = (this.herokuRegion !== 'us') ? ' --region ' + this.herokuRegion : '';

            this.log(chalk.bold('\nCreating Heroku application and setting up node environment'));
            var herokuCreateCmd = 'heroku create ' + this.herokuAppName + regionParams;
            this.log(herokuCreateCmd);

            var child = exec(herokuCreateCmd, {}, function (err, stdout, stderr) {
                if (err) {
                    if (stderr.indexOf('Name is already taken') > -1) {
                        var prompts = [
                            {
                                type: 'list',
                                name: 'herokuForceName',
                                message: 'The Heroku app "' + chalk.cyan(this.herokuAppName) + '" already exists! Use it anyways?',
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
                        this.prompt(prompts).then(function (props) {
                            var getHerokuAppName = function(def, stdout) { return def; };
                            if (props.herokuForceName === 'Yes') {
                                herokuCreateCmd = 'heroku git:remote --app ' + this.herokuAppName;
                            } else {
                                herokuCreateCmd = 'heroku create ' + regionParams;

                                // Extract from "Created random-app-name-1234... done"
                                getHerokuAppName = function(def, stdout) { return stdout.substring(stdout.indexOf('https://') + 8, stdout.indexOf('.herokuapp')); };
                            }
                            exec(herokuCreateCmd, {}, function (err, stdout, stderr) {
                                if (err) {
                                    this.abort = true;
                                    this.log.error(err);
                                } else {
                                    this.herokuAppName = getHerokuAppName(this.herokuAppName, stdout);
                                    this.log(stdout.trim());
                                }
                                this.config.set('herokuAppName', this.herokuAppName);
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
                    this.log(output.trim());
                }
            }.bind(this));
        },

        herokuAddonsCreate: function() {
            if (this.abort) return;
            var done = this.async();

            var dbAddOn = '';
            if (this.prodDatabaseType === 'postgresql') {
                dbAddOn = 'heroku-postgresql --as DATABASE';
            } else if (this.prodDatabaseType === 'mysql') {
                dbAddOn = 'jawsdb:kitefin --as JAWSDB';
            } else if (this.prodDatabaseType === 'mariadb') {
                dbAddOn = 'jawsdb-maria:kitefin --as JAWSDB';
            } else if (this.prodDatabaseType === 'mongodb') {
                dbAddOn = 'mongolab:sandbox --as MONGODB';
            } else {
                return;
            }

            this.log(chalk.bold('\nProvisioning addons'));
            exec(`heroku addons:create ${dbAddOn}`, {}, function (err, stdout, stderr) {
                if (err) {
                    this.log('No new addons created');
                } else {
                    this.log(`Created ${dbAddOn}`);
                }
                done();
            }.bind(this));
        },

        configureJHipsterRegistry: function() {
            if (this.abort || this.herokuAppExists) return;
            var done = this.async();

            if (this.applicationType === 'microservice' || this.applicationType === 'gateway') {
                var prompts = [
                    {
                        type: 'input',
                        name: 'herokuJHipsterRegistry',
                        message: 'What is the URL of your JHipster Registry?'
                    }];

                this.log('');
                this.prompt(prompts).then(function (props) {
                    var configSetCmd = 'heroku config:set ' + 'JHIPSTER_REGISTRY_URL=' + props.herokuJHipsterRegistry + ' --app ' + this.herokuAppName;
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
                var line = data.toString().trim();
                if (line.length !== 0) this.log(line);
            }.bind(this));

        },

        productionDeploy: function () {
            if (this.abort) return;
            var done = this.async();
            this.log(chalk.bold('\nDeploying application'));

            var herokuDeployCommand = 'heroku deploy:jar target/*.war';
            if (this.buildTool === 'gradle') {
                herokuDeployCommand = 'heroku deploy:jar build/libs/*.war';
            }

            herokuDeployCommand += ' --app ' + this.herokuAppName;

            this.log(chalk.bold('\nUploading your application code.\nThis may take ' + chalk.cyan('several minutes') + ' depending on your connection speed...'));
            var child = exec(herokuDeployCommand, function (err, stdout) {
                if (err) {
                    this.abort = true;
                    this.log.error(err);
                }
                this.log(chalk.green('\nYour app should now be live. To view it run\n\t' + chalk.bold('heroku open')));
                this.log(chalk.yellow('And you can view the logs with this command\n\t' + chalk.bold('heroku logs --tail')));
                this.log(chalk.yellow('After application modification, redeploy it with\n\t' + chalk.bold('yo jhipster:heroku')));
                done();
            }.bind(this));

            child.stdout.on('data', function (data) {
                var line = data.toString().trimRight();
                if (line.trim().length !== 0) this.log(line);
            }.bind(this));
        }
    }
});
