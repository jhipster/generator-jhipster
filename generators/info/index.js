'use strict';
var generators = require('yeoman-generator'),
    chalk = require('chalk'),
    shelljs = require('shelljs'),
    util = require('util'),
    scriptBase = require('../generator-base');

var ReportGenerator = generators.Base.extend({});

util.inherits(ReportGenerator, scriptBase);

module.exports = ReportGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    initializing: {
        sayHello: function() {
            this.log(chalk.white('Welcome to the JHipster Information Sub-Generator\n'));
        },

        checkJHipster: function () {
            var done = this.async();
            this.log('##### **JHipster Version(s)**');
            shelljs.exec('npm list generator-jhipster', {silent:true}, function (err, stdout, stderr) {
                if (stdout) {
                    this.log('\n```\n' + stdout + '```\n');
                }
                done();
            }.bind(this));
        },

        displayConfiguration: function () {
            var done = this.async();
            var result = shelljs.cat('.yo-rc.json');
            this.log('##### **JHipster configuration, a `.yo-rc.json` file generated in the root folder**\n' +
                '\n```yaml\n' + result + '\n```\n');
            done();
        },

        displayEntities: function () {
            var done = this.async();
            this.log('##### **Entity configuration(s) `entityName.json` files generated in the `.jhipster` directory**\n');
            shelljs.ls('.jhipster/*.json').forEach(function(file) {
                this.log(file.split('/')[1]);
                var result = shelljs.cat(file);
                this.log('\n```yaml\n' + result + '\n```\n');
            }.bind(this));
            done();
        },

        checkJava: function () {
            var done = this.async();
            this.log('##### **Browsers and Operating System**\n');
            shelljs.exec('java -version', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log(stderr);
                }
                done();
            }.bind(this));
        },

        checkGit: function () {
            var done = this.async();
            shelljs.exec('git version', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log(stdout);
                }
                done();
            }.bind(this));
        },

        checkNode: function () {
            var done = this.async();
            shelljs.exec('node -v', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log('node: ' + stdout);
                }
                done();
            }.bind(this));
        },

        checkNpm: function () {
            var done = this.async();
            shelljs.exec('npm -v', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log('npm: ' + stdout);
                }
                done();
            }.bind(this));
        },

        checkBower: function () {
            var done = this.async();
            shelljs.exec('bower -v', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log('bower: ' + stdout);
                }
                done();
            }.bind(this));
        },

        checkGulp: function () {
            var done = this.async();
            shelljs.exec('gulp -v', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log('gulp:');
                    this.log(stdout);
                }
                done();
            }.bind(this));
        },

        checkYeoman: function () {
            var done = this.async();
            shelljs.exec('yo --version', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log('yeoman: ' + stdout);
                }
                done();
            }.bind(this));
        },

        checkDocker: function() {
            var done = this.async();
            shelljs.exec('docker -v', {silent:true}, function(err, stdout, stderr) {
                if (!err) {
                    this.log(stdout);
                }
                done();
            }.bind(this));
        },

        checkDockerCompose: function() {
            var done = this.async();
            shelljs.exec('docker-compose -v', {silent:true}, function(err, stdout, stderr) {
                if (!err) {
                    this.log(stdout);
                }
                done();
            }.bind(this));
        }
    }
});
