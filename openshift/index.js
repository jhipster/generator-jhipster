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

var OpenshiftGenerator = module.exports = function OpenshiftGenerator() {
    yeoman.generators.Base.apply(this, arguments);
    console.log(chalk.bold('Openshift configuration is starting'));
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
};

util.inherits(OpenshiftGenerator, yeoman.generators.Base);
util.inherits(OpenshiftGenerator, scriptBase);

OpenshiftGenerator.prototype.askForName = function askForName() {
    var done = this.async();

    var prompts = [{
        name: 'openShiftDeployedName',
        message: 'Name to deploy as:',
        default: this.baseName
    }];

    this.prompt(prompts, function (props) {
        this.openShiftDeployedName = _.slugify(props.openShiftDeployedName).split('-').join('');
        done();
    }.bind(this));
};

OpenshiftGenerator.prototype.checkInstallation = function checkInstallation() {
    if(this.abort) return;
    var done = this.async();

    exec('rhc --version', function (err) {
        if (err) {
            this.log.error('Openshift\'s rhc command line interface is not available. ' +
            'You can install it via RubyGems with: gem install rhc');
            this.abort = true;
        }
        done();
    }.bind(this));
};

OpenshiftGenerator.prototype.dirInit = function dirInit() {
    if(this.abort) return;
    var done = this.async();

    this.log(chalk.bold('Initializing deployment repo'));
    this.mkdir('deploy/openshift');
    done();
};

OpenshiftGenerator.prototype.gitRemoteCheck = function gitRemoteCheck() {
    this.openshift_remote_exists = false;
    if(this.abort || typeof this.dist_repo_url !== 'undefined') return;
    var done = this.async();

    this.log(chalk.bold("\nChecking for an existing git remote named '"+'openshift'+"'..."));
    exec('git remote -v', { cwd: 'deploy/openshift' }, function (err, stdout, stderr) {
        var lines = stdout.split('\n');
        var dist_repo = '';
        if (err && stderr.search('DL is deprecated') === -1) {
            this.log.error(err);
        } else {
            var repo_url_finder = new RegExp('openshift'+"[  ]*");
            lines.forEach(function(line) {
                if(line.search(repo_url_finder) === 0 && dist_repo === '') {
                    var dist_repo_detailed = line.slice(line.match(repo_url_finder)[0].length);
                    dist_repo = dist_repo_detailed.slice(0, dist_repo_detailed.length - 7);
                }
            });
            if (dist_repo !== ''){
                console.log("Found an existing git remote for this app: "+dist_repo);
                this.dist_repo_url = dist_repo;
                this.openshift_remote_exists = true;
            } else {
                console.log('No existing remote found.');
            }
        }
        done();
    }.bind(this));
};

OpenshiftGenerator.prototype.rhcAppShow = function rhcAppShow() {
    if(this.abort || typeof this.dist_repo_url !== 'undefined') return;
    var done = this.async();

    this.log(chalk.bold("\nChecking for an existing Openshift hosting environment..."));
    var child = exec('rhc app show '+this.openShiftDeployedName+' --noprompt', { cwd: 'deploy/openshift' }, function (err, stdout, stderr) {
        var lines = stdout.split('\n');
        var dist_repo = '';
        // Unauthenticated
        if (stdout.search('Not authenticated') >= 0 || stdout.search('Invalid characters found in login') >= 0) {
            this.log.error('Error: Not authenticated. Run "rhc setup" to login to your Openshift account and try again.');
            this.abort = true;
        }
        // No remote found
        else if (stderr.search('not found.') < 0) {
            console.log('No existing app found.');
        }
        // Error
        else if (err && stderr.search('DL is deprecated') === -1) {
            this.log.error(err);
        } else {   // Remote found
            this.log(stdout);
            var repo_url_finder = / *Git URL: */;
            lines.forEach(function(line) {
                if(line.search(repo_url_finder) === 0) {
                    dist_repo = line.slice(line.match(repo_url_finder)[0].length);
                    console.log("Found an existing git remote for this app: "+dist_repo);
                }
            });
            if (dist_repo !== '') this.dist_repo_url = dist_repo;
        }
        done();
    }.bind(this));
};

OpenshiftGenerator.prototype.rhcAppCreate = function rhcAppCreate() {
    if(this.abort || typeof this.dist_repo_url !== 'undefined') return;
    var done = this.async();

    this.log(chalk.bold("\nCreating your Openshift hosting environment, this may take a couple minutes..."));
    var db = this.prodDatabaseType === 'postgresql' ? 'postgresql-9.2' : 'mysql-5.5';
    var child = exec('rhc app create ' + this.openShiftDeployedName + ' diy-0.1 ' + db + ' -r ./', { cwd: 'deploy/openshift' }, function (err, stdout, stderr) {
        var lines = stdout.split('\n');
        this.log(stdout);
        if (stdout.search('Not authenticated') >= 0 || stdout.search('Invalid characters found in login') >= 0) {
            this.log.error('Error: Not authenticated. Run "rhc setup" to login to your Openshift account and try again.');
            this.abort = true;
        } else if (err && stderr.search('DL is deprecated') === -1) {
            this.log.error(err);
        } else {
            var dist_repo = '';
            var repo_url_finder = / *Git remote: */;
            lines.forEach(function(line) {
                if(line.search(repo_url_finder) === 0) {
                    dist_repo = line.slice(line.match(repo_url_finder)[0].length);
                }
            });

            if (dist_repo !== '') this.dist_repo_url = dist_repo;
            if(this.dist_repo_url !== undefined) {
                this.log("New remote git repo at: "+this.dist_repo_url);
            }
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        this.log(data.toString());
    }.bind(this));
};

OpenshiftGenerator.prototype.gitRemoteAdd = function gitRemoteAdd() {
    if(this.abort || typeof this.dist_repo_url === 'undefined' || this.openshift_remote_exists) return;
    var done = this.async();
    this.log(chalk.bold("\nAdding remote repo url: "+this.dist_repo_url));

    var child = exec('git remote add '+'openshift'+' '+this.dist_repo_url, { cwd: 'deploy/openshift' }, function (err, stdout, stderr) {
        if (err) {
            this.log.error(err);
        } else {
            this.openshift_remote_exists = true;
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        this.log(data.toString());
    }.bind(this));
};

OpenshiftGenerator.prototype.copyOpenshiftFiles = function copyOpenshiftFiles() {
    if(this.abort || !this.openshift_remote_exists ) return;
    var done = this.async();
    this.log(chalk.bold('\nCreating Openshift deployment files'));

    this.template('openshift/action_hooks/_build', 'deploy/openshift/.openshift/action_hooks/build', null, { 'interpolate': /<%=([\s\S]+?)%>/g });
    this.template('openshift/action_hooks/_start', 'deploy/openshift/.openshift/action_hooks/start', null, { 'interpolate': /<%=([\s\S]+?)%>/g });
    this.copy('openshift/action_hooks/stop', 'deploy/openshift/.openshift/action_hooks/stop');
    this.copy('openshift/action_hooks/pre_build', 'deploy/openshift/.openshift/action_hooks/pre_build');
    this.conflicter.resolve(function (err) {
        done();
    });
};

OpenshiftGenerator.prototype.productionBuild = function productionBuild() {
    if(this.abort || !this.openshift_remote_exists ) return;
    var done = this.async();

    this.log(chalk.bold('\nBuilding deploy/openshift folder, please wait...'));
    var child = exec('grunt buildOpenshift', function (err, stdout) {
        if (err) {
            this.log.error(err);
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        this.log(data.toString());
    }.bind(this));
};

OpenshiftGenerator.prototype.gitCommit = function gitCommit() {
    if(this.abort || !this.openshift_remote_exists ) return;
    var done = this.async();

    this.log(chalk.bold('\nAdding files for initial commit'));
    var child = exec('git add -A && git commit -m "Initial commit"', { cwd: 'deploy/openshift', maxBuffer: 1000*1024 }, function (err, stdout, stderr) {
        if (stdout.search('nothing to commit') >= 0) {
            this.log('Re-pushing the existing "deploy/openshift" build...');
        } else if (err) {
            this.log.error(err);
        } else {
            this.log(chalk.green('Done, without errors.'));
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        this.log(data.toString());
    }.bind(this));
};

OpenshiftGenerator.prototype.gitChmod = function gitChmod() {
    if(this.abort || !this.openshift_remote_exists ) return;
    var done = this.async();

    this.log(chalk.bold('\nChmod action hooks'));
    var child = exec('git update-index --chmod=+x .openshift/action_hooks/build && '+
        'git update-index --chmod=+x .openshift/action_hooks/start && '+
        'git update-index --chmod=+x .openshift/action_hooks/stop && ' +
        'git update-index --chmod=+x .openshift/action_hooks/pre_build && ' +
        'git commit -m "Chmod"', { cwd: 'deploy/openshift' }, function (err, stdout, stderr) {
        if (stdout.search('nothing to commit') >= 0) {
            this.log('+x already set');
        } else if (err) {
            this.log.error(err);
        } else {
            this.log(chalk.green('Done, without errors.'));
        }
        done();
    }.bind(this));

    child.stdout.on('data', function(data) {
        this.log(data.toString());
    }.bind(this));
};

OpenshiftGenerator.prototype.gitForcePush = function gitForcePush() {
    if (this.abort || !this.openshift_remote_exists) return;
    var done = this.async();
    this.log(chalk.bold("\nUploading your initial application code.\n This may take " + chalk.cyan('several minutes') + " depending on your connection speed..."));
    var insight = this.insight();
    insight.track('generator', 'openshift');

    var push = spawn('git', ['push', '-f', 'openshift', 'master'], {cwd: 'deploy/openshift'});
    var error = null;

    push.stderr.on('data', function (data) {
        var output = data.toString();
        this.log.error(output);
    }.bind(this));

    push.stdout.on('data', function (data) {
        var output = data.toString();
        this.log.stdin(output);
    }.bind(this));

    push.on('exit', function (code) {
        if (code !== 0) {
            this.abort = true;
            return done();
        }
        done();
    }.bind(this));
};

OpenshiftGenerator.prototype.restartApp = function restartApp() {
    if(this.abort || !this.openshift_remote_exists ) return;
    this.log(chalk.bold("\nRestarting your Openshift app.\n"));

    var child = exec('rhc app restart -a ' + this.openShiftDeployedName, function(err, stdout, stderr) {

        var host_url = '';
        var hasWarning = false;
        var before_hostname = this.dist_repo_url.indexOf('@') + 1;
        var after_hostname = this.dist_repo_url.length - ( 'openshift'.length + 12 );
        host_url = 'http://' + this.dist_repo_url.slice(before_hostname, after_hostname);

        this.log(chalk.green('\nYour app should now be live at \n\t' + chalk.bold(host_url)));
        if(hasWarning) {
            this.log(chalk.green('\nYou may need to address the issues mentioned above and restart the server for the app to work correctly \n\t' +
            'rhc app-restart -a ' + this.openShiftDeployedName));
        }
        this.log(chalk.yellow('After application modification, re-deploy it with\n\t' + chalk.bold('grunt deployOpenshift') +
        ' and then do a \n\t' + chalk.bold('git push') + ' on your Openshift repository.'));
    }.bind(this));
};
