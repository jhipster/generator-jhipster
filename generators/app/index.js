'use strict';
var util = require('util'),
    path = require('path'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../generator-base'),
    cleanup = require('../cleanup'),
    packagejs = require('../../package.json'),
    crypto = require("crypto"),
    mkdirp = require('mkdirp'),
    html = require("html-wiring"),
    ejs = require('ejs');

var JhipsterGenerator = generators.Base.extend({});

util.inherits(JhipsterGenerator, scriptBase);

/* Constants use through out */
const QUESTIONS = 15; // making questions a variable to avoid updating each question by hand when adding additional options
const RESOURCE_DIR = 'src/main/resources/';
const WEBAPP_DIR = 'src/main/webapp/';
const ANGULAR_DIR = WEBAPP_DIR + 'app/';
const TEST_JS_DIR = 'src/test/javascript/';
const TEST_RES_DIR = 'src/test/resources/';
const DOCKER_DIR = 'src/main/docker/';
const INTERPOLATE_REGEX = /<%=([\s\S]+?)%>/g; // so that tags in templates do not get mistreated as _ templates

var currentQuestion = 0;
var configOptions = {};

module.exports = JhipsterGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);
        // This adds support for a `--skip-client` flag
        this.option('skip-client', {
            desc: 'Skip the client side app generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--with-entities` flag
        this.option('with-entities', {
            desc: 'Regenerate the existing entities if any',
            type: Boolean,
            defaults: false
        });
        var skipClient = this.config.get('skipClient');
        this.skipClient = this.options['skip-client'] || skipClient;
        configOptions.skipClient = this.skipClient;
        this.withEntities = this.options['with-entities'];

    },
    initializing : {
        displayLogo : function () {
            this.printJHipsterLogo();
        },

        setupVars : function () {
            this.baseName = this.config.get('baseName');
            this.jhipsterVersion = this.config.get('jhipsterVersion');
            this.applicationType = this.config.get('applicationType');
            this.testFrameworks = this.config.get('testFrameworks');

            var configFound = this.baseName != null && this.jhipsterVersion != null && this.applicationType != null;
            if (configFound) {
                this.existingProject = true;
            }
        }
    },

    prompting: {
        askForInsightOptIn: function () {
            if(this.existingProject){
                return;
            }
            var done = this.async();
            var insight = this.insight();
            this.prompt({
                when: function () {
                    return insight.optOut === undefined;
                },
                type: 'confirm',
                name: 'insight',
                message: 'May ' + chalk.cyan('JHipster') + ' anonymously report usage statistics to improve the tool over time?',
                default: true
            }, function (prompt) {
                if (prompt.insight !== undefined) {
                    insight.optOut = !prompt.insight;
                }
                done();
            }.bind(this));
        },

        askForApplicationType: function () {
            if(this.existingProject){
                return;
            }
            var done = this.async();

            this.prompt({
                type: 'list',
                name: 'applicationType',
                message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Which *type* of application would you like to create?',
                choices: [
                    {
                        value: 'monolith',
                        name: 'Monolithic application'
                    },
                    {
                        value: 'microservice',
                        name: 'Microservice application'
                    },
                    {
                        value: 'gateway',
                        name: 'Microservice gateway'
                    }
                ],
                default: 'monolith'
            }, function (prompt) {
                this.applicationType = prompt.applicationType;
                done();
            }.bind(this));
        },

        askForModuleName: function () {
            if(this.existingProject){
                return;
            }
            this.askModuleName(this, ++currentQuestion, QUESTIONS);
            configOptions.lastQuestion = currentQuestion;
        },
    },

    configuring: {

        composeServer : function () {
            if(this.skipClient){
                configOptions.enableTranslation = false;
            }
            this.composeWith('jhipster:server', {
                options: {
                    'logo': false,
                    'base-name' : this.baseName,
                    'client-hook': !this.skipClient,
                    configOptions : configOptions
                }
            }, {
                local: require.resolve('../server')
            });
        },

        composeClient : function () {
            if(this.skipClient){
                return;
            }
            this.composeWith('jhipster:client', {
                options: {
                    'logo': false,
                    'base-name' : this.baseName,
                    'skip-install': this.options['skip-install'],
                    configOptions : configOptions
                }
            }, {
                local: require.resolve('../client')
            });

        }
    },

    default: {
        askForTestOpts: function () {
            if(this.existingProject){
                return;
            }
            var choices = [
                {name: 'Gatling', value: 'gatling'},
                {name: 'Cucumber', value: 'cucumber'}
            ];
            if(!this.skipClient){
                // all client side test frameworks are addded here
                choices.push(
                    {name: 'Protractor', value: 'protractor'}
                );
            }
            var done = this.async();

            this.prompt({
                type: 'checkbox',
                name: 'testFrameworks',
                message: '(15/' + QUESTIONS + ') Which testing frameworks would you like to use?',
                choices: choices,
                default: [ 'gatling' ]
            }, function (prompt) {
                this.testFrameworks = prompt.testFrameworks;
                done();
            }.bind(this));
        },

        setSharedConfigOptions: function () {
            configOptions.testFrameworks = this.testFrameworks;
        },

        insight: function () {
            var insight = this.insight();
            insight.track('generator', 'app');
            insight.track('app/applicationType', this.applicationType);
            insight.track('app/testFrameworks', this.testFrameworks);
        },

        saveConfig: function () {
            this.config.set('jhipsterVersion', packagejs.version);
            this.config.set('applicationType', this.applicationType);
            this.config.set('baseName', this.baseName);
            this.config.set('testFrameworks', this.testFrameworks);
            if(this.skipClient){
                this.config.set('skipClient', true);
            }
        }
    },

    writing: {

        cleanup: function () {
            cleanup.cleanupOldFiles(this, this.javaDir, this.testDir, RESOURCE_DIR, WEBAPP_DIR, TEST_JS_DIR);
        },

        regenerateEntities: function () {
            if (this.withEntities) {
                this.getExistingEntities().forEach( function(entity) {
                    this.composeWith('jhipster:entity', {options: {regenerate: true}, args:[entity.name]});
                }, this);
            }
        }
    },

    end: function () {
        this.log(chalk.green.bold('\nWeb app generated succesfully.\n'));
    }

});
