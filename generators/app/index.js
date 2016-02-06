'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    scriptBase = require('../generator-base'),
    constants = require('../generator-constants'),
    cleanup = require('../cleanup'),
    packagejs = require('../../package.json');

var JhipsterGenerator = generators.Base.extend({});

util.inherits(JhipsterGenerator, scriptBase);

/* Constants use through out */
const QUESTIONS = constants.QUESTIONS;
const RESOURCE_DIR = constants.RESOURCE_DIR;
const WEBAPP_DIR =  constants.WEBAPP_DIR;
const TEST_JS_DIR =  constants.TEST_JS_DIR;

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

        // This adds support for a `--[no-]i18n` flag
        this.option('i18n', {
            desc: 'Disable or enable i18n when skipping client side generation, has no effect otherwise',
            type: Boolean,
            defaults: true
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
            this.applicationType = this.config.get('applicationType');
            if (!this.applicationType) {
                this.applicationType = 'monolith';
            }
            this.baseName = this.config.get('baseName');
            this.jhipsterVersion = this.config.get('jhipsterVersion');
            this.testFrameworks = this.config.get('testFrameworks');

            var configFound = this.baseName != null && this.applicationType != null;
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
                this.applicationType = configOptions.applicationType = prompt.applicationType;
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
        setup : function () {
            if(this.skipClient){
                configOptions.enableTranslation = this.options['i18n'];
            }
        },

        composeServer : function () {
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
            if(this.skipClient) return;

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
            cleanup.cleanupOldFiles(this, this.javaDir, this.testDir);
        },

        regenerateEntities: function () {
            if (this.withEntities) {
                this.getExistingEntities().forEach( function(entity) {
                    this.composeWith('jhipster:entity', {
                        options: { regenerate: true },
                        args:[ entity.name ]
                    }, {
                        local: require.resolve('../entity')
                    });
                }, this);
            }
        }
    },

    end: function () {
        this.log(chalk.green.bold('\nWeb app generated succesfully.\n'));
    }

});
