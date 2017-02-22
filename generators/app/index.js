'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    scriptBase = require('../generator-base'),
    cleanup = require('../cleanup'),
    prompts = require('./prompts'),
    packagejs = require('../../package.json'),
    exec = require('child_process').exec,
    semver = require('semver');

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

        // This adds support for a `--skip-checks` flag
        this.option('skip-checks', {
            desc: 'Check the status of the required tools',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--jhi-prefix` flag
        this.option('jhi-prefix', {
            desc: 'Add prefix before services, controllers and states name',
            type: String,
            defaults: 'jhi'
        });

        // This adds support for a `--npm` flag
        this.option('npm', {
            desc: 'Use npm instead of yarn',
            type: Boolean,
            defaults: false
        });

        this.currentQuestion = 0;
        this.totalQuestions = constants.QUESTIONS;
        this.skipClient = this.configOptions.skipClient = this.options['skip-client'] || this.config.get('skipClient');
        this.skipServer = this.configOptions.skipServer = this.options['skip-server'] || this.config.get('skipServer');
        this.skipUserManagement = this.configOptions.skipUserManagement = this.options['skip-user-management'] || this.config.get('skipUserManagement');
        this.jhiPrefix = this.configOptions.jhiPrefix || this.config.get('jhiPrefix') || this.options['jhi-prefix'];
        this.withEntities = this.options['with-entities'];
        this.skipChecks = this.options['skip-checks'];
        this.yarnInstall = this.configOptions.yarnInstall = !this.options['npm'];
    },

    initializing: {
        displayLogo: function () {
            this.printJHipsterLogo();
        },

        checkJava: function () {
            if (this.skipChecks || this.skipServer) return;
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

        checkNode: function () {
            if (this.skipChecks || this.skipServer) return;
            var done = this.async();
            exec('node -v', function (err, stdout, stderr) {
                if (err) {
                    this.warning('NodeJS is not found on your system.');
                } else {
                    var nodeVersion = semver.clean(stdout);
                    var nodeFromPackageJson = packagejs.engines.node;
                    if (!semver.satisfies(nodeVersion, nodeFromPackageJson)) {
                        this.warning('Your NodeJS version is too old (' + nodeVersion + '). You should use at least NodeJS ' + chalk.bold(nodeFromPackageJson));
                    }
                }
                done();
            }.bind(this));
        },

        checkGit: function () {
            if (this.skipChecks || this.skipClient) return;
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

        checkYarn: function () {
            if (this.skipChecks || !this.yarnInstall) return;
            var done = this.async();
            exec('yarn --version', function (err) {
                if (err) {
                    this.warning('yarn is not found on your computer.\n',
                        ' Using npm instead');
                    this.yarnInstall = false;
                } else {
                    this.yarnInstall = true;
                }
                done();
            }.bind(this));
        },

        checkForNewVersion: function () {
            if (!this.skipChecks) {
                this.checkForNewVersion();
            }
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
            this.jhipsterVersion = packagejs.version;
            if (this.jhipsterVersion === undefined) {
                this.jhipsterVersion = this.config.get('jhipsterVersion');
            }
            this.otherModules = this.config.get('otherModules');
            this.testFrameworks = this.config.get('testFrameworks');
            this.enableTranslation = this.config.get('enableTranslation');
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
            var configFound = this.baseName !== undefined && this.applicationType !== undefined;
            if (configFound) {
                this.existingProject = true;
                // If translation is not defined, it is enabled by default
                if (this.enableTranslation === undefined) {
                    this.enableTranslation = true;
                }
            }
            this.clientPackageManager = this.config.get('clientPackageManager');
            if (!this.clientPackageManager) {
                if (this.yarnInstall) {
                    this.clientPackageManager = 'yarn';
                } else {
                    this.clientPackageManager = 'npm';
                }
            }
        }
    },

    prompting: {
        askForInsightOptIn: prompts.askForInsightOptIn,
        askForApplicationType: prompts.askForApplicationType,
        askForModuleName: prompts.askForModuleName,
        askForMoreModules: prompts.askForMoreModules,
    },

    configuring: {
        setup: function () {
            this.configOptions.skipI18nQuestion = true;
            this.configOptions.baseName = this.baseName;
            this.configOptions.logo = false;
            this.configOptions.otherModules = this.otherModules;
            this.configOptions.lastQuestion = this.currentQuestion;
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
            this.configOptions.clientPackageManager = this.clientPackageManager;
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
            this.configOptions.clientPackageManager = this.clientPackageManager;
        },

        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'app');
            insight.track('app/applicationType', this.applicationType);
            insight.track('app/testFrameworks', this.testFrameworks);
            insight.track('app/otherModules', this.otherModules);
            insight.track('app/clientPackageManager', this.clientPackageManager);
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
            this.config.set('otherModules', this.otherModules);
            this.skipClient && this.config.set('skipClient', true);
            this.skipServer && this.config.set('skipServer', true);
            this.skipUserManagement && this.config.set('skipUserManagement', true);
            this.config.set('enableTranslation', this.enableTranslation);
            if (this.enableTranslation) {
                this.config.set('nativeLanguage', this.nativeLanguage);
                this.config.set('languages', this.languages);
            }
            this.config.set('clientPackageManager', this.clientPackageManager);
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
        localInstall: function() {
            if (this.skipClient) {
                if (this.otherModules === undefined) {
                    this.otherModules = [];
                }
                // Generate a package.json file containing the current version of the generator as dependency
                this.template('_skipClientApp.package.json', 'package.json', this, {});

                if (!this.options['skip-install']) {
                    if (this.clientPackageManager === 'yarn') {
                        this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using yarn`));
                        this.spawnCommand('yarn', ['install']);
                    } else if (this.clientPackageManager === 'npm') {
                        this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using npm`));
                        this.npmInstall();
                    }
                }
            }
        },

        afterRunHook: function () {
            try {
                var modules = this.getModuleHooks();
                if (modules.length > 0) {
                    this.log('\n' + chalk.bold.green('Running post run module hooks\n'));
                    // run through all post app creation module hooks
                    this.callHooks('app', 'post', {
                        appConfig: this.configOptions,
                        force: this.options['force']
                    });
                }
            } catch (err) {
                this.log('\n' + chalk.bold.red('Running post run module hooks failed. No modification done to the generated app.'));
            }
        }
    }
});
