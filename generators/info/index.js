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
            this.log('##### **JHipster Version(s)**\n');
            shelljs.exec('npm list generator-jhipster', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log('```');
                    this.log(stdout);
                    this.log('```');
                }
                done();
            }.bind(this));
        },

        displayYorc: function () {
            var done = this.async();
            this.log('##### **JHipster configuration, a `.yo-rc.json` file generated in the root folder**\n');
            shelljs.exec('cat .yo-rc.json', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log('```yaml');
                    this.log(stdout);
                    this.log('```\n');
                }
                done();
            }.bind(this));
        },

        displayEntities: function () {
            var done = this.async();
            this.log('##### **Entity configuration(s) `entityName.json` files generated in the `.jhipster` directory**\n');
            shelljs.exec('for f in `ls .jhipster`; do echo ${f%} ; cat .jhipster/${f%} ; done', {silent:true}, function (err, stdout, stderr) {
                if (!err) {
                    this.log(stdout);
                }
                done();
            }.bind(this));
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
