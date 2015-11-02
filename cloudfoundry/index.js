'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    childProcess = require('child_process'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../script-base');

var exec = childProcess.exec;
var spawn = childProcess.spawn;

var CloudFoundryGenerator = module.exports = function CloudFoundryGenerator() {
    yeoman.generators.Base.apply(this, arguments);
    console.log(chalk.bold('CloudFoundry configuration is starting'));
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    this.devDatabaseType = this.config.get('devDatabaseType');
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
};

util.inherits(CloudFoundryGenerator, yeoman.generators.Base);
util.inherits(CloudFoundryGenerator, scriptBase);

CloudFoundryGenerator.prototype.askForName = function askForName() {
    var done = this.async();
    var prompts = [{
        name: 'cloudfoundryDeployedName',
        message: 'Name to deploy as:',
        default: this.baseName
    },
    {
        type: 'list',
        name: 'cloudfoundryProfile',
        message: 'Which profile would you like to use?',
        choices: [
            {
                value: 'dev',
                name: 'dev'
            },
            {
                value: 'prod',
                name: 'prod'
            }
        ],
        default: 0
    },
    {
        name: 'cloudfoundryDatabaseServiceName',
        message: 'What is the name of your database service?',
        default: 'elephantsql'
    },
    {
        name: 'cloudfoundryDatabaseServicePlan',
        message: 'What is the name of your database plan?',
        default: 'turtle'
    }];

    this.prompt(prompts, function (props) {
        this.cloudfoundryDeployedName = _.slugify(props.cloudfoundryDeployedName).split('-').join('');
        this.cloudfoundryProfile = props.cloudfoundryProfile;
        this.cloudfoundryDatabaseServiceName = props.cloudfoundryDatabaseServiceName;
        this.cloudfoundryDatabaseServicePlan = props.cloudfoundryDatabaseServicePlan;
        done();
    }.bind(this));
};

CloudFoundryGenerator.prototype.copyCloudFoundryFiles = function copyCloudFoundryFiles() {
    if(this.abort) return;
    this.log(chalk.bold('\nCreating Cloud Foundry deployment files'));
    this.template('_manifest.yml', 'deploy/cloudfoundry/manifest.yml');
};

CloudFoundryGenerator.prototype.checkInstallation = function checkInstallation() {
    if(this.abort) return;
    var done = this.async();

    exec('cf -v', function (err) {
        if (err) {
            this.log.error('cloudfoundry\'s cf command line interface is not available. ' +
            'You can install it via https://github.com/cloudfoundry/cli/releases');
            this.abort = true;
        }
        done();
    }.bind(this));
};

CloudFoundryGenerator.prototype.cloudfoundryAppShow = function cloudfoundryAppShow() {
    if(this.abort || typeof this.dist_repo_url !== 'undefined') return;
    var done = this.async();

    this.log(chalk.bold("\nChecking for an existing Cloud Foundry hosting environment..."));
    var child = exec('cf app '+this.cloudfoundryDeployedName+' ', { }, function (err, stdout, stderr) {
        var lines = stdout.split('\n');
        var dist_repo = '';
        // Unauthenticated
        if (stdout.search('cf login') >= 0) {
            this.log.error('Error: Not authenticated. Run \'cf login\' to login to your cloudfoundry account and try again.');
            this.abort = true;
        }
        done();
    }.bind(this));
};

CloudFoundryGenerator.prototype.cloudfoundryAppCreate = function cloudfoundryAppCreate() {
    if(this.abort || typeof this.dist_repo_url !== 'undefined') return;
    var done = this.async();

    this.log(chalk.bold("\nCreating your Cloud Foundry hosting environment, this may take a couple minutes..."));
    var insight = this.insight();
    insight.track('generator', 'cloudfoundry');
    this.log(chalk.bold("Creating the database"));
    var child = exec('cf create-service ' + this.cloudfoundryDatabaseServiceName + ' ' + this.cloudfoundryDatabaseServicePlan + ' ' + this.cloudfoundryDeployedName, { }, function (err, stdout, stderr) {
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        this.log(data.toString());
    }.bind(this));
};

CloudFoundryGenerator.prototype.productionBuild = function productionBuild() {
    if(this.abort) return;
    var done = this.async();
    var mvn = 'mvn package -Pprod -DskipTests';
    if (this.cloudfoundryProfile == 'prod') {
        this.log(chalk.bold('\nBuilding the application with the production profile'));
    } else {
        this.log(chalk.bold('\nBuilding the application with the development profile'));
        mvn = 'mvn package -DskipTests';
    }
    var child = exec(mvn, function (err, stdout) {
        if (err) {
            this.log.error(err);
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        this.log(data.toString());
    }.bind(this));
};

CloudFoundryGenerator.prototype.cloudfoundryPush = function cloudfoundryPush() {
    this.on('end', function () {
        if(this.abort) return;
        var done = this.async();

        this.log(chalk.bold('\nPushing the application to Cloud Foundry'));
        var child = exec('cf push -f ./deploy/cloudfoundry/manifest.yml -p target/*.war', function (err, stdout) {
            if (err) {
                this.log.error(err);
            }
            done();
        }.bind(this));

        child.stdout.on('data', function(data) {
            this.log(data.toString());
        }.bind(this));
    });
};

CloudFoundryGenerator.prototype.restartApp = function restartApp() {
    if(this.abort || !this.cloudfoundry_remote_exists ) return;
    this.log(chalk.bold("\nRestarting your cloudfoundry app.\n"));

    var child = exec('cf restart ' + this.cloudfoundryDeployedName, function(err, stdout, stderr) {
        this.log(chalk.green('\nYour app should now be live'));
        if(hasWarning) {
            this.log(chalk.green('\nYou may need to address the issues mentioned above and restart the server for the app to work correctly \n\t' +
            'cf restart ' + this.cloudfoundryDeployedName));
        }
        this.log(chalk.yellow('After application modification, re-deploy it with\n\t' + chalk.bold('grunt deploycloudfoundry')));
    }.bind(this));
};
