'use strict';
var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    generators = require('yeoman-generator'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    _ = require('lodash'),
    scriptBase = require('../generator-base');

const constants = require('../generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
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
                type: "list",
                name: 'herokuRegion',
                message: 'On which region do you want to deploy ?',
                choices: ["us", "eu"],
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

    gitInit: function () {
        if (this.abort) return;
        var done = this.async();

        try {
            var stats = fs.lstatSync('.git');
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

        var dbAddOn = (this.prodDatabaseType != 'postgresql') ? ' --addons jawsdb:kitefin' : ' --addons heroku-postgresql';

        this.log(chalk.bold('\nCreating Heroku application and setting up node environment'));
        var herokuCreateCmd = 'heroku create ' + this.herokuDeployedName + regionParams + dbAddOn;
        this.log(herokuCreateCmd);

        var child = exec(herokuCreateCmd, {}, function (err, stdout, stderr) {
            if (err) {
                if (stderr.indexOf('Name is already taken') > -1) {
                    var prompts = [
                        {
                            type: "list",
                            name: 'herokuForceName',
                            message: 'The Heroku app "' + chalk.cyan(this.herokuDeployedName) + '" already exists! Use it anyways?',
                            choices: [{
                                value: 'Yes',
                                name: 'Yes, I have access to it',
                            }, {
                                value: 'No',
                                name: 'No, generate a random name'
                            }],
                            default: 0
                        }];

                    this.log("");
                    this.prompt(prompts, function (props) {
                        if (props.herokuForceName == 'Yes') {
                            herokuCreateCmd = 'heroku git:remote --app ' + this.herokuDeployedName
                        } else {
                            herokuCreateCmd = 'heroku create ' + regionParams + dbAddOn;
                        }
                        var forceCreateChild = exec(herokuCreateCmd, {}, function (err, stdout, stderr) {
                            if (err) {
                                this.abort = true;
                                this.log.error(err);
                            } else {
                                // Extract from "Created random-app-name-1234... done"
                                this.herokuDeployedName = stdout.substring(stdout.indexOf('https://') + 8, stdout.indexOf('.herokuapp'));
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

    copyHerokuFiles: function () {
        if (this.abort) return;
        var insight = this.insight();
        insight.track('generator', 'heroku');
        var done = this.async();
        this.log(chalk.bold('\nCreating Heroku deployment files'));

        this.template(SERVER_MAIN_SRC_DIR + 'package/config/_HerokuDatabaseConfiguration.java', SERVER_MAIN_SRC_DIR + this.packageFolder + '/config/HerokuDatabaseConfiguration.java');
        this.template('_Procfile', 'Procfile');

        this.conflicter.resolve(function (err) {
            done();
        });
    },

    productionDeploy: function () {
        this.on('end', function () {
            if (this.abort) return;
            var done = this.async();
            this.log(chalk.bold('\nBuilding and deploying application'));
            
            var buildCmd = 'mvnw package -Pprod -DskipTests=true';
            var herokuDeployCommand = 'heroku deploy:jar --jar target/*.war';
            if (this.buildTool === 'gradle') {
                buildCmd = 'gradlew -Pprod bootRepackage -x test';
                herokuDeployCommand = 'heroku deploy:jar --jar build/libs/*.war';
            }
            if (os.platform() !== 'win32') {
                buildCmd = './' + buildCmd;
            }
            herokuDeployCommand += ' --app ' + this.herokuDeployedName;

            var runCmd = buildCmd + ' && ' + herokuDeployCommand;

            this.log(chalk.bold("\nUploading your application code.\n This may take " + chalk.cyan('several minutes') + " depending on your connection speed..."));
            var child = exec(runCmd, function (err, stdout) {
                if (err) {
                    this.abort = true;
                    this.log.error(err);
                }
                this.log(stdout);
                if (err) {
                    this.log(chalk.red(err));
                } else {
                    this.log(chalk.green('\nYour app should now be live. To view it run\n\t' + chalk.bold('heroku open')));
                    this.log(chalk.yellow('And you can view the logs with this command\n\t' + chalk.bold('heroku logs --tail')));
                    this.log(chalk.yellow('After application modification, repackage it with\n\t' + chalk.bold(buildCmd)));
                    this.log(chalk.yellow('And then re-deploy it with\n\t' + chalk.bold(herokuDeployCommand)));
                }
                done();
            }.bind(this));

            child.stdout.on('data', function (data) {
                this.log(data.toString());
            }.bind(this));
        });
    }
});
