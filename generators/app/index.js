const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const scriptBase = require('../generator-base');
const cleanup = require('../cleanup');
const prompts = require('./prompts');
const packagejs = require('../../package.json');
const exec = require('child_process').exec;
const semver = require('semver');

const JhipsterGenerator = generator.extend({});

util.inherits(JhipsterGenerator, scriptBase);

/* Constants use throughout */
const constants = require('../generator-constants');

module.exports = JhipsterGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);

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
        this.useYarn = this.configOptions.useYarn = !this.options.npm;
        this.isDebugEnabled = this.configOptions.isDebugEnabled = this.options.debug;
    },

    initializing: {
        displayLogo() {
            this.printJHipsterLogo();
        },

        checkJava() {
            if (this.skipChecks || this.skipServer) return;
            const done = this.async();
            exec('java -version', (err, stdout, stderr) => {
                if (err) {
                    this.warning('Java 8 is not found on your computer.');
                } else {
                    const javaVersion = stderr.match(/(?:java|openjdk) version "(.*)"/)[1];
                    if (!javaVersion.match(/1\.8/)) {
                        this.warning(`Java 8 is not found on your computer. Your Java version is: ${chalk.yellow(javaVersion)}`);
                    }
                }
                done();
            });
        },

        checkNode() {
            if (this.skipChecks || this.skipServer) return;
            const done = this.async();
            exec('node -v', (err, stdout, stderr) => {
                if (err) {
                    this.warning('NodeJS is not found on your system.');
                } else {
                    const nodeVersion = semver.clean(stdout);
                    const nodeFromPackageJson = packagejs.engines.node;
                    if (!semver.satisfies(nodeVersion, nodeFromPackageJson)) {
                        this.warning(`Your NodeJS version is too old (${nodeVersion}). You should use at least NodeJS ${chalk.bold(nodeFromPackageJson)}`);
                    }
                }
                done();
            });
        },

        checkGit() {
            if (this.skipChecks || this.skipClient) return;
            const done = this.async();
            this.isGitInstalled((code) => {
                this.gitInstalled = code === 0;
                done();
            });
        },

        checkGitConnection() {
            if (!this.gitInstalled) return;
            const done = this.async();
            exec('git ls-remote git://github.com/jhipster/generator-jhipster.git HEAD', { timeout: 15000 }, (error) => {
                if (error) {
                    this.warning(`Failed to connect to "git://github.com"
                         1. Check your Internet connection.
                         2. If you are using an HTTP proxy, try this command: ${chalk.yellow('git config --global url."https://".insteadOf git://')}`
                    );
                }
                done();
            });
        },

        checkYarn() {
            if (this.skipChecks || !this.useYarn) return;
            const done = this.async();
            exec('yarn --version', (err) => {
                if (err) {
                    this.warning('yarn is not found on your computer.\n',
                        ' Using npm instead');
                    this.useYarn = false;
                } else {
                    this.useYarn = true;
                }
                done();
            });
        },

        checkForNewVersion() {
            if (!this.skipChecks) {
                this.checkForNewVersion();
            }
        },

        validate() {
            if (this.skipServer && this.skipClient) {
                this.error(chalk.red(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`));
            }
        },

        setupconsts() {
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
            const configFound = this.baseName !== undefined && this.applicationType !== undefined;
            if (configFound) {
                this.existingProject = true;
                // If translation is not defined, it is enabled by default
                if (this.enableTranslation === undefined) {
                    this.enableTranslation = true;
                }
            }
            this.clientPackageManager = this.config.get('clientPackageManager');
            if (!this.clientPackageManager) {
                if (this.useYarn) {
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
        setup() {
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
                this.configOptions.enableTranslation = this.options.i18n;
            }
            if (this.skipServer) {
                this.generatorType = 'client';
                // defaults to use when skipping server
            }
            this.configOptions.clientPackageManager = this.clientPackageManager;
        },

        composeServer() {
            if (this.skipServer) return;

            this.composeWith(require.resolve('../server'), {
                'client-hook': !this.skipClient,
                configOptions: this.configOptions,
                force: this.options.force
            });
        },

        composeClient() {
            if (this.skipClient) return;

            this.composeWith(require.resolve('../client'), {
                'skip-install': this.options['skip-install'],
                configOptions: this.configOptions,
                force: this.options.force
            });
        },

        askFori18n: prompts.askFori18n
    },

    default: {

        askForTestOpts: prompts.askForTestOpts,

        setSharedConfigOptions() {
            this.configOptions.lastQuestion = this.currentQuestion;
            this.configOptions.totalQuestions = this.totalQuestions;
            this.configOptions.testFrameworks = this.testFrameworks;
            this.configOptions.enableTranslation = this.enableTranslation;
            this.configOptions.nativeLanguage = this.nativeLanguage;
            this.configOptions.languages = this.languages;
            this.configOptions.clientPackageManager = this.clientPackageManager;
        },

        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'app');
            insight.track('app/applicationType', this.applicationType);
            insight.track('app/testFrameworks', this.testFrameworks);
            insight.track('app/otherModules', this.otherModules);
            insight.track('app/clientPackageManager', this.clientPackageManager);
        },

        composeLanguages() {
            if (this.skipI18n) return;
            this.composeLanguagesSub(this, this.configOptions, this.generatorType);
        },

        saveConfig() {
            this.config.set('jhipsterVersion', packagejs.version);
            this.config.set('applicationType', this.applicationType);
            this.config.set('baseName', this.baseName);
            this.config.set('testFrameworks', this.testFrameworks);
            this.config.set('jhiPrefix', this.jhiPrefix);
            this.config.set('otherModules', this.otherModules);
            if (this.skipClient) this.config.set('skipClient', true);
            if (this.skipServer) this.config.set('skipServer', true);
            if (this.skipUserManagement) this.config.set('skipUserManagement', true);
            this.config.set('enableTranslation', this.enableTranslation);
            if (this.enableTranslation) {
                this.config.set('nativeLanguage', this.nativeLanguage);
                this.config.set('languages', this.languages);
            }
            this.config.set('clientPackageManager', this.clientPackageManager);
        }
    },

    writing: {
        cleanup() {
            cleanup.cleanupOldFiles(this, this.javaDir, this.testDir);
        },

        regenerateEntities() {
            if (this.withEntities) {
                this.getExistingEntities().forEach((entity) => {
                    this.composeWith(require.resolve('../entity'), {
                        regenerate: true,
                        'skip-install': true,
                        force: this.options.force,
                        debug: this.isDebugEnabled,
                        arguments: [entity.name]
                    });
                });
            }
        }
    },

    end: {
        localInstall() {
            if (this.skipClient) {
                if (this.otherModules === undefined) {
                    this.otherModules = [];
                }
                // Generate a package.json file containing the current version
                // of the generator as dependency
                this.template('_skipClientApp.package.json', 'package.json');

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

        afterRunHook() {
            try {
                const modules = this.getModuleHooks();
                if (modules.length > 0) {
                    this.log(`\n${chalk.bold.green('Running post run module hooks\n')}`);
                    // run through all post app creation module hooks
                    this.callHooks('app', 'post', {
                        appConfig: this.configOptions,
                        force: this.options.force
                    });
                }
            } catch (err) {
                this.log(`\n${chalk.bold.red('Running post run module hooks failed. No modification done to the generated app.')}`);
            }
        }
    }
});
