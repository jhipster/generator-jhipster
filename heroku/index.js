'use strict';
var util = require('util'),
path = require('path'),
yeoman = require('yeoman-generator'),
exec = require('child_process').exec,
chalk = require('chalk'),
_s = require('underscore.string'),
scriptBase = require('../script-base');

var HerokuGenerator = module.exports = function HerokuGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);
    console.log(chalk.bold('Heroku configuration is starting'));
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.javaVersion = this.config.get('javaVersion');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';
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
        this.herokuDeployedName = this._.slugify(props.herokuDeployedName);
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

    this.log(chalk.bold('\nInitializing deployment repository'));
    this.mkdir('deploy/heroku');
    var child = exec('git init', { cwd: 'deploy/heroku' }, function (err, stdout, stderr) {
        done();
    }.bind(this));
    child.stdout.on('data', function(data) {
        console.log(data.toString());
    });
};

HerokuGenerator.prototype.herokuCreate = function herokuCreate() {
    if(this.abort) return;
    var done = this.async();
    var regionParams = (this.herokuRegion !== 'us') ? ' --region ' + this.herokuRegion : '';

    this.log(chalk.bold('Creating Heroku application and setting up node environment'));
    console.log('heroku apps:create ' + this.herokuDeployedName + regionParams + ' && heroku config:set NODE_ENV=production');
    var child = exec('heroku apps:create ' + this.herokuDeployedName + regionParams + ' && heroku config:set NODE_ENV=production', { cwd: 'deploy/heroku' }, function (err, stdout, stderr) {
        if (err) {
            this.abort = true;
            this.log.error(err);
        } else {
            this.log('stdout: ' + stdout);
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        var output = data.toString();
        this.log(output);
    }.bind(this));
};

HerokuGenerator.prototype.copyHerokuFiles = function copyHerokuFiles() {
    if(this.abort) return;
    var done = this.async();
    this.log(chalk.bold('\nCreating Heroku deployment files'));

    this.copy('slugignore', 'deploy/heroku/.slugignore');
    this.copy('Procfile', 'deploy/heroku/Procfile');
    this.copy('system.properties', 'deploy/heroku/system.properties');
    this.template('src/main/java/package/config/_HerokuDatabaseConfiguration.java', 'deploy/heroku/src/main/java/' + this.packageFolder + '/config/HerokuDatabaseConfiguration.java');
    this.conflicter.resolve(function (err) {
        done();
    });
};

HerokuGenerator.prototype.productionBuild = function productionBuild() {
    if(this.abort) return;
    var done = this.async();

    this.log(chalk.bold('\nBuilding in production mode, and deploying...'));
    var child = exec('grunt buildHeroku', function (err, stdout) {
        done();
    }.bind(this));
    child.stdout.on('data', function(data) {
        console.log(data.toString());
    });
};

HerokuGenerator.prototype.gitCommit = function gitInit() {
    if(this.abort) return;
    var done = this.async();

    this.log(chalk.bold('Adding files for initial commit'));
    var child = exec('git add -A && git commit -m "Initial commit"', { cwd: 'deploy/heroku', maxBuffer: 500*1024 }, function (err, stdout, stderr) {
        if (stdout.search('nothing to commit') >= 0) {
            this.log('Re-pushing the existing build...');
        } else if (err) {
            this.log.error(err);
        } else {
            this.log(chalk.green('Done, without errors.'));
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        console.log(data.toString());
    });
};

HerokuGenerator.prototype.gitForcePush = function gitForcePush() {
    if(this.abort) return;
    var done = this.async();

    this.log(chalk.bold("\nUploading your initial application code.\n This may take " + chalk.cyan('several minutes') + " depending on your connection speed..."));
        var insight = this.insight();
        insight.track('generator', 'heroku');

    var child = exec('git push -f heroku master', { cwd: 'deploy/heroku', maxBuffer: 500*1024 }, function (err, stdout, stderr) {
        console.log(stdout);
        if (err) {
            console.log(chalk.red(err));
        } else {
            console.log(chalk.green('\nYour app should now be live. To view it run\n\t' + chalk.bold('cd deploy/heroku && heroku open')));
            console.log(chalk.yellow('After application modification, re-deploy it with\n\t' + chalk.bold('grunt deployHeroku') +
            ' and then do a \n\t' + chalk.bold('git push') + ' on your Heroku repository.'));
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    child.stderr.on('data', function(data) {
        console.log(chalk.white(data.toString()));
    });
};
