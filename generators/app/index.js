/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');
const _ = require('lodash');
const BaseGenerator = require('../generator-base');
const cleanup = require('../cleanup');
const prompts = require('./prompts');
const packagejs = require('../../package.json');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

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

        // This adds support for a `--skip-git` flag
        this.option('skip-git', {
            desc: 'Skip the git initialization',
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

        // This adds support for a `--auth` flag
        this.option('auth', {
            desc: 'Provide authentication type for the application when skipping server',
            type: String
        });

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB name for the application when skipping server',
            type: String
        });

        // This adds support for a `--blueprint` flag which can be used to specify a blueprint to use for generation
        this.option('blueprint', {
            desc: '[BETA] Specify a generator blueprint to use for the sub generators',
            type: String
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false
        });

        this.skipClient = this.configOptions.skipClient = this.options['skip-client'] || this.config.get('skipClient');
        this.skipServer = this.configOptions.skipServer = this.options['skip-server'] || this.config.get('skipServer');
        this.skipUserManagement = this.configOptions.skipUserManagement = this.options['skip-user-management'] || this.config.get('skipUserManagement');
        this.jhiPrefix = this.configOptions.jhiPrefix = _.camelCase(this.config.get('jhiPrefix') || this.options['jhi-prefix']);
        this.withEntities = this.options['with-entities'];
        this.skipChecks = this.options['skip-checks'];
        this.blueprint = this.configOptions.blueprint = this.options.blueprint || this.config.get('blueprint');
        this.useYarn = this.configOptions.useYarn = !this.options.npm;
        this.isDebugEnabled = this.configOptions.isDebugEnabled = this.options.debug;
        this.experimental = this.configOptions.experimental = this.options.experimental;
    }

    get initializing() {
        return {
            displayLogo() {
                this.printJHipsterLogo();
            },

            validateBlueprint() {
                if (this.blueprint) {
                    this.checkBlueprint(this.blueprint);
                }
            },

            validateJava() {
                this.checkJava();
            },

            validateNode() {
                this.checkNode();
            },

            validateGit() {
                this.checkGit();
            },

            validateGitConnection() {
                this.checkGitConnection();
            },

            validateYarn() {
                this.checkYarn();
            },

            checkForNewJHVersion() {
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
        };
    }

    get prompting() {
        return {
            askForInsightOptIn: prompts.askForInsightOptIn,
            askForApplicationType: prompts.askForApplicationType,
            askForModuleName: prompts.askForModuleName
        };
    }

    get configuring() {
        return {
            setup() {
                this.configOptions.skipI18nQuestion = true;
                this.configOptions.baseName = this.baseName;
                this.configOptions.logo = false;
                this.configOptions.otherModules = this.otherModules;
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
                    // defaults to use when skipping server
                    this.generatorType = 'client';
                    this.configOptions.databaseType = this.getDBTypeFromDBValue(this.options.db);
                    this.configOptions.devDatabaseType = this.options.db;
                    this.configOptions.prodDatabaseType = this.options.db;
                    this.configOptions.authenticationType = this.options.auth;
                }
                this.configOptions.clientPackageManager = this.clientPackageManager;
            },

            composeServer() {
                if (this.skipServer) return;

                this.composeWith(require.resolve('../server'), {
                    'client-hook': !this.skipClient,
                    configOptions: this.configOptions,
                    force: this.options.force,
                    debug: this.isDebugEnabled
                });
            },

            composeClient() {
                if (this.skipClient) return;

                this.composeWith(require.resolve('../client'), {
                    'skip-install': this.options['skip-install'],
                    configOptions: this.configOptions,
                    force: this.options.force,
                    debug: this.isDebugEnabled
                });
            },

            askFori18n: prompts.askFori18n
        };
    }

    get default() {
        return {
            askForTestOpts: prompts.askForTestOpts,

            askForMoreModules: prompts.askForMoreModules,

            setSharedConfigOptions() {
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
                this.config.set('enableTranslation', this.enableTranslation);
                if (this.enableTranslation) {
                    this.config.set('nativeLanguage', this.nativeLanguage);
                    this.config.set('languages', this.languages);
                }
                this.config.set('clientPackageManager', this.clientPackageManager);
                this.blueprint && this.config.set('blueprint', this.blueprint);
                this.skipClient && this.config.set('skipClient', true);
                this.skipServer && this.config.set('skipServer', true);
                this.skipUserManagement && this.config.set('skipUserManagement', true);
            }
        };
    }

    get writing() {
        return {
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
        };
    }

    get end() {
        return {
            localInstall() {
                if (this.skipClient) {
                    if (this.otherModules === undefined) {
                        this.otherModules = [];
                    }
                    // Generate a package.json file containing the current version
                    // of the generator as dependency
                    this.dasherizedBaseName = _.kebabCase(this.baseName);
                    this.template('_skipClientApp.package.json', 'package.json');

                    if (!this.options['skip-install']) {
                        if (this.clientPackageManager === 'yarn') {
                            this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using yarn`));
                            this.yarnInstall();
                        } else if (this.clientPackageManager === 'npm') {
                            this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using npm`));
                            this.npmInstall();
                        }
                    }
                }

                if (!this.options['skip-git']) {
                    this.isGitInstalled((code) => {
                        if (code === 0) {
                            this.gitExec('rev-parse --is-inside-work-tree', { trace: false }, (err, gitDir) => {
                                if (!gitDir) {
                                    this.gitExec('init', { trace: false }, () => {
                                        this.gitExec('add -A', { trace: false }, () => {
                                            this.gitExec(`commit -am "Initial application generated by JHipster-${this.jhipsterVersion}"`, { trace: false }, () => this.log(chalk.green.bold('Application successfully committed to Git.')));
                                        });
                                    });
                                }
                            });
                        } else {
                            this.warning('The generated application could not be added to Git, as Git is not installed on your system');
                        }
                    });
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
                    this.debug('Error:', err);
                }
                this.log(chalk.white(`If you find JHipster useful consider supporting our collective ${chalk.yellow('https://opencollective.com/generator-jhipster')}`));
            }
        };
    }
};
