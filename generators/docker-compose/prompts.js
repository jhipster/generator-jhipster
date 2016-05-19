'use strict';

var chalk = require('chalk'),
    shelljs = require('shelljs');

module.exports = {
    askForPath,
    askForApps,
    askForClustersMode,
    askForElk,
    askForAdminPassword
};

function askForPath() {
    if (this.regenerate) return;

    var done = this.async();

    var prompts = [{
        type: 'input',
        name: 'directoryPath',
        message: 'Enter the root directory where your gateway(s) and microservices are located',
        default: this.directoryPath || '../',
        validate: function (input) {
            var path = this.destinationPath(input);
            if(shelljs.test('-d', path)) {
                var appsFolders = getAppFolders.call(this, input);

                if(appsFolders.length === 0) {
                    return 'No microservice or gateway found in ' + path;
                } else {
                    return true;
                }
            } else {
                return path + ' is not a directory or doesn\'t exist';
            }
        }.bind(this)
    }];

    this.prompt(prompts, function (props) {
        this.directoryPath = props.directoryPath;

        this.appsFolders = getAppFolders.call(this, this.directoryPath);

        //Removing registry from appsFolders, using reverse for loop
        for(var i = this.appsFolders.length - 1; i >= 0; i--) {
            if (this.appsFolders[i] === 'jhipster-registry' || this.appsFolders[i] === 'registry') {
                this.appsFolders.splice(i,1);
            }
        }

        this.log(chalk.green(this.appsFolders.length + ' applications found at ' + this.destinationPath(this.directoryPath) + '\n'));

        done();
    }.bind(this));
}

function askForApps() {
    if (this.regenerate) return;

    var done = this.async();

    var prompts = [{
        type: 'checkbox',
        name: 'chosenApps',
        message: 'Which applications do you want to include in your Docker Compose configuration?',
        choices: this.appsFolders,
        default: this.defaultAppsFolders,
        validate: function (input) {
            if(input.length === 0) {
                return 'Please choose at least one application';
            } else return true;
        }
    }];

    this.prompt(prompts, function (props) {
        this.appsFolders = props.chosenApps;

        this.appConfigs = [];
        this.gatewayNb = 0;
        this.monolithicNb = 0;
        this.microserviceNb = 0;

        //Loading configs
        this.appsFolders.forEach(function (appFolder) {
            var path = this.destinationPath(this.directoryPath + appFolder +'/.yo-rc.json');
            var fileData = this.fs.readJSON(path);
            var config = fileData['generator-jhipster'];

            if(config.applicationType === 'monolith') {
                this.monolithicNb++;
            } else if(config.applicationType === 'gateway') {
                this.gatewayNb++;
            } else if(config.applicationType === 'microservice') {
                this.microserviceNb++;
            }

            this.portsToBind = this.monolithicNb + this.gatewayNb;
            this.appConfigs.push(config);
        }, this);

        done();
    }.bind(this));
}

function askForClustersMode() {
    if (this.regenerate) return;

    var mongoApps = [];
    this.appConfigs.forEach(function (appConfig, index) {
        if(appConfig.prodDatabaseType === 'mongodb') {
            mongoApps.push(this.appsFolders[index]);
        }
    }, this);
    if(mongoApps.length===0) return;

    var done = this.async();

    var prompts = [{
        type: 'checkbox',
        name: 'clusteredDbApps',
        message: 'Which applications do you want to use with clustered databases (only available with MongoDB)?',
        choices: mongoApps,
        default: this.clusteredDbApps
    }];

    this.prompt(prompts, function (props) {
        this.clusteredDbApps = props.clusteredDbApps;
        for (var i = 0; i < this.appsFolders.length; i++) {
            for (var j = 0; j < props.clusteredDbApps.length; j++) {
                this.appConfigs[i].clusteredDb = this.appsFolders[i] === props.clusteredDbApps[j];
            }
        }

        done();
    }.bind(this));
}

function askForElk() {
    if (this.regenerate) return;

    var done = this.async();

    var prompts = [{
        type: 'confirm',
        name: 'elk',
        message: 'Do you want the JHipster Console (based on ELK) to monitor your applications?',
        default: this.useElk && true
    }];

    this.prompt(prompts, function(props) {
        this.useElk = props.elk;
        done();
    }.bind(this));
}

function askForAdminPassword() {
    if (this.regenerate) return;

    var done = this.async();

    var prompts = [{
        type: 'input',
        name: 'adminPassword',
        message: 'Enter the admin password used to secure the JHipster Registry',
        default: 'admin',
        validate: function (input) {
            if(input.length < 5) {
                return 'The password must have at least 5 characters';
            } else return true;
        }
    }];

    this.prompt(prompts, function(props) {
        this.adminPassword = props.adminPassword;
        done();
    }.bind(this));
}

function getAppFolders(input) {
    var files = shelljs.ls('-l', this.destinationPath(input));
    var appsFolders = [];

    files.forEach(function(file) {
        if(file.isDirectory()) {
            if( (shelljs.test('-f', input + file.name + '/.yo-rc.json'))
                && (shelljs.test('-f', input + file.name + '/src/main/docker/app.yml')) ) {
                try {
                    var fileData = this.fs.readJSON(input + file.name + '/.yo-rc.json');
                    if(fileData['generator-jhipster'].baseName !== undefined) {
                        appsFolders.push(file.name.match(/([^\/]*)\/*$/)[1]);
                    }
                } catch(err) {
                    this.log(chalk.red(file + ': this .yo-rc.json can\'t be read'));
                }
            }
        }
    }, this);

    return appsFolders;
}
