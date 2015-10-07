'use strict';
var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    yeoman = require('yeoman-generator'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../script-base');

var HerokuGenerator = module.exports = function HerokuGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);
    console.log(chalk.bold('Heroku configuration is starting'));
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
    this.buildTool = this.config.get('buildTool');
};

util.inherits(HerokuGenerator, yeoman.generators.Base);
util.inherits(HerokuGenerator, scriptBase);

HerokuGenerator.prototype.askFor = function askFor() {
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
        choices: [ "us", "eu"],
        default: 0
    }];

    this.prompt(prompts, function (props) {
        this.herokuDeployedName = _.slugify(props.herokuDeployedName);
        this.herokuRegion = props.herokuRegion;
        done();
    }.bind(this));
};

HerokuGenerator.prototype.checkInstallation = function checkInstallation() {
    if(this.abort) return;
    var done = this.async();

    exec('heroku --version', function (err) {
        if (err) {
            this.log.error('You don\'t have the Heroku Toolbelt installed. ' +
            'Download it from https://toolbelt.heroku.com/');
            this.abort = true;
        }
        done();
    }.bind(this));
};

HerokuGenerator.prototype.gitInit = function gitInit() {
    if(this.abort) return;
    var done = this.async();

    try {
      var stats = fs.lstatSync('.git');
      this.log(chalk.bold('\nUsing existing Git repository'));
      done();
    } catch(e) {
      // An exception is thrown if the folder doesn't exist
      this.log(chalk.bold('\nInitializing Git repository'));
      var child = exec('git init', {}, function (err, stdout, stderr) {
        done();
      }.bind(this));
      child.stdout.on('data', function(data) {
        console.log(data.toString());
      });
    }
};

HerokuGenerator.prototype.installHerokuDeployPlugin = function installHerokuDeployPlugin() {
  if(this.abort) return;
  var done = this.async();
  this.log(chalk.bold('\nInstalling Heroku CLI deployment plugin'));
  var child = exec('heroku plugins:install https://github.com/heroku/heroku-deploy', function (err, stdout) {
    if (err) {
      this.abort = true;
      this.log.error(err);
    }
    done();
  }.bind(this));

  child.stdout.on('data', function(data) {
    this.log(data.toString());
  }.bind(this));
};

HerokuGenerator.prototype.herokuCreate = function herokuCreate() {
    if(this.abort) return;
    var done = this.async();

    var regionParams = (this.herokuRegion !== 'us') ? ' --region ' + this.herokuRegion : '';

    var dbAddOn = (this.prodDatabaseType != 'postgresql') ? ' --addons cleardb' : ' --addons heroku-postgresql';

    this.log(chalk.bold('\nCreating Heroku application and setting up node environment'));
    var herokuCreateCmd = 'heroku create ' + this.herokuDeployedName + regionParams + dbAddOn;

    console.log(herokuCreateCmd);
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
              },{
                value: 'No',
                name: 'No, generate a random name'
              }],
              default: 0
            }];

            console.log("");
            this.prompt(prompts, function (props) {
              if (props.herokuForceName == 'Yes') {
                herokuCreateCmd = 'heroku git:remote --app ' + this.herokuDeployedName
              } else {
                herokuCreateCmd = 'heroku create ' + regionParams + ' --addons heroku-postgresql:hobby-dev';
              }
              var forceCreateChild = exec(herokuCreateCmd, {}, function (err, stdout, stderr) {
                if (err) {
                  this.abort = true;
                  this.log.error(err);
                } else {
                  // Extract from "Created random-app-name-1234... done"
                  this.herokuDeployedName = stdout.substring(9, stdout.indexOf('...'));
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

    child.stdout.on('data', function(data) {
        var output = data.toString();
        this.log(output);
    }.bind(this));

};

HerokuGenerator.prototype.copyHerokuFiles = function copyHerokuFiles() {
    if(this.abort) return;
    var insight = this.insight();
    insight.track('generator', 'heroku');
    var done = this.async();
    this.log(chalk.bold('\nCreating Heroku deployment files'));

    this.template('src/main/java/package/config/_HerokuDatabaseConfiguration.java', 'src/main/java/' + this.packageFolder + '/config/HerokuDatabaseConfiguration.java');
    this.template('_Procfile', 'Procfile');

    this.conflicter.resolve(function (err) {
      done();
    });
};

HerokuGenerator.prototype.productionDeploy = function productionDeploy() {
    this.on('end', function () {
        if(this.abort) return;
        var done = this.async();
        this.log(chalk.bold('\nBuilding and deploying application'));

        var herokuDeployCommand = 'mvn package -Pprod -DskipTests=true && heroku deploy:jar --jar target/*.war --app ' + this.herokuDeployedName;
        if (this.buildTool == 'gradle') {
            herokuDeployCommand = './gradlew -Pprod bootRepackage -x test && heroku deploy:jar --jar build/libs/*.war'
        }

        this.log(chalk.bold("\nUploading your application code.\n This may take " + chalk.cyan('several minutes') + " depending on your connection speed..."));
        var child = exec(herokuDeployCommand, function (err, stdout) {
            if (err) {
                this.abort = true;
                this.log.error(err);
            }
            console.log(stdout);
            if (err) {
                console.log(chalk.red(err));
            } else {
                console.log(chalk.green('\nYour app should now be live. To view it run\n\t' + chalk.bold('heroku open')));
                console.log(chalk.yellow('And you can view the logs with this command\n\t' + chalk.bold('heroku logs --tail')));
            if (this.buildTool == 'gradle') {
                console.log(chalk.yellow('After application modification, repackage it with\n\t' + chalk.bold('./gradlew -Pprod bootRepackage -x test')));
            } else {
                console.log(chalk.yellow('After application modification, repackage it with\n\t' + chalk.bold('mvn package -Pprod -DskipTests')));
            }
                console.log(chalk.yellow('And then re-deploy it with\n\t' + chalk.bold(herokuDeployCommand)));
            }
            done();
        }.bind(this));

        child.stdout.on('data', function(data) {
            this.log(data.toString());
        }.bind(this));
    });
};
