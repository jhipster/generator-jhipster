'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    scriptBase = require('../generator-base'),
    cleanup = require('../cleanup'),
    prompts = require('./prompts'),
    packagejs = require('../../package.json'),
    exec = require('child_process').exec;

var JhipsterGenerator = generators.Base.extend({});

util.inherits(JhipsterGenerator, scriptBase);

/* Constants use throughout */
const constants = require('../generator-constants');

module.exports = JhipsterGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        this.configOptions = {};
        // This adds support for a `--skip-client` flag
        this.option('skip-client', {
            desc: 'Skip the client-side application generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-server` flag
        this.option('skip-server', {
            desc: 'Skip the server-side application generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-user-management` flag
        this.option('skip-user-management', {
            desc: 'Skip the user management module during app generation',
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

        // This adds support for a `--[no-]check-install` flag
        this.option('check-install', {
            desc: 'Check the status of the required tools',
            type: Boolean,
            defaults: true
        });

        // This adds support for a `--jhi-prefix` flag
        this.option('jhi-prefix', {
            desc: 'Add prefix before services, controllers and states name',
            type: String,
            defaults: 'jhi'
        });

        this.currentQuestion = 0;
        this.totalQuestions = constants.QUESTIONS;
        this.skipClient = this.configOptions.skipClient = this.options['skip-client'] || this.config.get('skipClient');
        this.skipServer = this.configOptions.skipServer = this.options['skip-server'] || this.config.get('skipServer');
        this.skipUserManagement = this.configOptions.skipUserManagement = this.options['skip-user-management'] || this.config.get('skipUserManagement');
        this.jhiPrefix = this.configOptions.jhiPrefix || this.config.get('jhiPrefix') || this.options['jhi-prefix'];
        this.withEntities = this.options['with-entities'];
        this.checkInstall = this.options['check-install'];

    },
    initializing: {
        displayLogo: function () {
            this.printJHipsterLogo();
        },

        checkJava: function () {
            if (!this.checkInstall || this.skipServer) return;
            var done = this.async();
            exec('java -version', function (err, stdout, stderr) {
                if (err) {
                    this.warning('Java 8 is not found on your computer.');
                } else {
                    var javaVersion = stderr.match(/(?:java|openjdk) version "(.*)"/)[1];
                    if (!javaVersion.match(/1\.8/)) {
                        this.warning('Java 8 is not found on your computer. Your Java version is: ' + chalk.yellow(javaVersion));
                    }
                }
                done();
            }.bind(this));
        },

        checkGit: function () {
            if (!this.checkInstall || this.skipClient) return;
            var done = this.async();
            this.isGitInstalled(function (code) {
                this.gitInstalled = code === 0;
                done();
            }.bind(this));
        },

        checkGitConnection: function () {
            if (!this.gitInstalled) return;
            var done = this.async();
            exec('git ls-remote git://github.com/jhipster/generator-jhipster.git HEAD', {timeout: 15000}, function (error) {
                if (error) {
                    this.warning('Failed to connect to "git://github.com"\n',
                        ' 1. Check your Internet connection.\n',
                        ' 2. If you are using an HTTP proxy, try this command: ' + chalk.yellow('git config --global url."https://".insteadOf git://')
                    );
                }
                done();
            }.bind(this));
        },

        checkBower: function () {
            if (!this.checkInstall || this.skipClient) return;
            var done = this.async();
            exec('bower --version', function (err) {
                if (err) {
                    this.warning('bower is not found on your computer.\n',
                        ' Install bower using npm command: ' + chalk.yellow('npm install -g bower')
                    );
                }
                done();
            }.bind(this));
        },

        checkGulp: function () {
            if (!this.checkInstall || this.skipClient) return;
            var done = this.async();
            exec('gulp --version', function (err) {
                if (err) {
                    this.warning('gulp is not found on your computer.\n',
                        ' Install gulp using npm command: ' + chalk.yellow('npm install -g gulp-cli')
                    );
                }
                done();
            }.bind(this));
        },

        validate: function () {
            if (this.skipServer && this.skipClient) {
                this.error(chalk.red('You can not pass both ' + chalk.yellow('--skip-client') + ' and ' + chalk.yellow('--skip-server') + ' together'));
            }
        },

        setupVars: function () {
            this.applicationType = this.config.get('applicationType');
            if (!this.applicationType) {
                this.applicationType = 'monolith';
            }
            this.baseName = this.config.get('baseName');
            this.jhipsterVersion = this.config.get('jhipsterVersion');
            this.testFrameworks = this.config.get('testFrameworks');
            this.enableTranslation = this.config.get('enableTranslation');
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
            var configFound = this.baseName !== undefined && this.applicationType !== undefined;
            if (configFound) {
                this.existingProject = true;
            }
        }
    },

    prompting: {
        askForInsightOptIn: prompts.askForInsightOptIn,

        askForApplicationType: prompts.askForApplicationType,

        askForModuleName: prompts.askForModuleName
    },

    configuring: {
        setup: function () {
            this.configOptions.skipI18nQuestion = true;
            this.configOptions.baseName = this.baseName;
            this.configOptions.logo = false;
            this.generatorType = 'app';
            if (this.applicationType === 'microservice') {
                this.skipClient = true;
                this.generatorType = 'server';
                this.skipUserManagement = this.configOptions.skipUserManagement = true;
            }
            if (this.applicationType === 'uaa') {
                this.skipClient = true;
                this.generatorType = 'server';
                this.skipUserManagement = this.configOptions.skipUserManagement = false;
                this.authenticationType = this.configOptions.authenticationType = 'uaa';
            }
            if (this.skipClient) {
                // defaults to use when skipping client
                this.generatorType = 'server';
                this.configOptions.enableTranslation = this.options['i18n'];
            }
            if (this.skipServer) {
                this.generatorType = 'client';
                // defaults to use when skipping server
            }
        },

        composeServer: function () {
            if (this.skipServer) return;

            this.composeWith('jhipster:server', {
                options: {
                    'client-hook': !this.skipClient,
                    configOptions: this.configOptions,
                    force: this.options['force']
                }
            }, {
                local: require.resolve('../server')
            });
        },

        composeClient: function () {
            if (this.skipClient) return;

            this.composeWith('jhipster:client', {
                options: {
                    'skip-install': this.options['skip-install'],
                    configOptions: this.configOptions,
                    force: this.options['force']
                }
            }, {
                local: require.resolve('../client')
            });

        },

        askFori18n: prompts.askFori18n
    },

    default: {

        askForTestOpts: prompts.askForTestOpts,

        setSharedConfigOptions: function () {
            this.configOptions.lastQuestion = this.currentQuestion;
            this.configOptions.totalQuestions = this.totalQuestions;
            this.configOptions.testFrameworks = this.testFrameworks;
            this.configOptions.enableTranslation = this.enableTranslation;
            this.configOptions.nativeLanguage = this.nativeLanguage;
            this.configOptions.languages = this.languages;
        },

        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'app');
            insight.track('app/applicationType', this.applicationType);
            insight.track('app/testFrameworks', this.testFrameworks);
        },

        composeLanguages: function () {
            if (this.skipI18n) return;
            this.composeLanguagesSub(this, this.configOptions, this.generatorType);
        },

        saveConfig: function () {
            this.config.set('jhipsterVersion', packagejs.version);
            this.config.set('applicationType', this.applicationType);
            this.config.set('baseName', this.baseName);
            this.config.set('testFrameworks', this.testFrameworks);
            this.config.set('jhiPrefix', this.jhiPrefix);
            this.skipClient && this.config.set('skipClient', true);
            this.skipServer && this.config.set('skipServer', true);
            this.skipUserManagement && this.config.set('skipUserManagement', true);
            this.config.set('enableTranslation', this.enableTranslation);
            if (this.enableTranslation) {
                this.config.set('nativeLanguage', this.nativeLanguage);
                this.config.set('languages', this.languages);
            }
        }
    },

    writing: {

        cleanup: function () {
            cleanup.cleanupOldFiles(this, this.javaDir, this.testDir);
        },

        regenerateEntities: function () {
            if (this.withEntities) {
                this.getExistingEntities().forEach(function (entity) {
                    this.composeWith('jhipster:entity', {
                        options: {
                            regenerate: true,
                            'skip-install': true,
                            force: this.options['force']
                        },
                        args: [entity.name]
                    }, {
                        local: require.resolve('../entity')
                    });
                }, this);
            }
        }
    },

    end: {
        afterRunHook: function () {
            try {
                var modules = this.getModuleHooks();
                if (modules.length > 0) {
                    this.log('\n' + chalk.bold.green('Running post run module hooks\n'));
                    // run through all post app creation module hooks
                    modules.forEach(function (module) {
                        if (module.hookFor === 'app' && module.hookType === 'post') {
                            // compose with the modules callback generator
                            try {
                                this.composeWith(module.generatorCallback, {
                                    options: {
                                        appConfig: this.configOptions,
                                        force: this.options['force']
                                    }
                                });
                            } catch (err) {
                                this.log(chalk.red('Could not compose module ') + chalk.bold.yellow(module.npmPackageName) +
                                    chalk.red('. \nMake sure you have installed the module with ') + chalk.bold.yellow('\'npm -g ' + module.npmPackageName + '\''));
                            }
                        }
                    }, this);
                }
            } catch (err) {
                this.log('\n' + chalk.bold.red('Running post run module hooks failed. No modification done to the generated app.'));
            }
        }
    }
});
