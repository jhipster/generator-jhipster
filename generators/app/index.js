/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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
const statistics = require('../statistics');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.configOptions = {};
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
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

        // This adds support for a `--skip-commit-hook` flag
        this.option('skip-commit-hook', {
            desc: 'Skip adding husky commit hooks',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-user-management` flag
        this.option('skip-user-management', {
            desc: 'Skip the user management module during app generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-check-length-of-identifier` flag
        this.option('skip-check-length-of-identifier', {
            desc: 'Skip check the length of the identifier, only for recent Oracle databases that support 30+ characters metadata',
            type: Boolean,
            defaults: false
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

        // This adds support for a `--yarn` flag
        this.option('yarn', {
            desc: 'Use yarn instead of npm',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--auth` flag
        this.option('auth', {
            desc: 'Provide authentication type for the application when skipping server side generation',
            type: String
        });

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB name for the application when skipping server side generation',
            type: String
        });

        // This adds support for a `--uaa-base-name` flag
        this.option('uaa-base-name', {
            desc: 'Provide the name of UAA server, when using --auth uaa and skipping server side generation',
            type: String
        });

        // This adds support for a `--build` flag
        this.option('build', {
            desc: 'Provide build tool for the application when skipping server side generation',
            type: String
        });

        // This adds support for a `--websocket` flag
        this.option('websocket', {
            desc: 'Provide websocket option for the application when skipping server side generation',
            type: String
        });

        // This adds support for a `--search-engine` flag
        this.option('search-engine', {
            desc: 'Provide search engine for the application when skipping server side generation',
            type: String
        });

        // This adds support for a `--blueprint` flag which can be used to specify a blueprint to use for generation
        this.option('blueprint', {
            desc: '[BETA] Specify a generator blueprint to use for the sub generators',
            type: String
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false
        });

        this.skipClient = this.configOptions.skipClient = this.options['skip-client'] || this.config.get('skipClient');
        this.skipServer = this.configOptions.skipServer = this.options['skip-server'] || this.config.get('skipServer');
        this.skipUserManagement = this.configOptions.skipUserManagement =
            this.options['skip-user-management'] || this.config.get('skipUserManagement');
        this.skipCheckLengthOfIdentifier = this.configOptions.skipCheckLengthOfIdentifier =
            this.options['skip-check-length-of-identifier'] || this.config.get('skipCheckLengthOfIdentifier');
        this.jhiPrefix = this.configOptions.jhiPrefix = _.camelCase(this.config.get('jhiPrefix') || this.options['jhi-prefix']);
        this.withEntities = this.options['with-entities'];
        this.skipChecks = this.options['skip-checks'];
        const blueprint = this.normalizeBlueprintName(this.options.blueprint || this.config.get('blueprint'));
        this.blueprint = this.configOptions.blueprint = blueprint;
        this.useNpm = this.configOptions.useNpm = !this.options.yarn;
        this.useYarn = !this.useNpm;

        this.isDebugEnabled = this.configOptions.isDebugEnabled = this.options.debug;
        this.experimental = this.configOptions.experimental = this.options.experimental;
        this.registerClientTransforms();
    }

    get initializing() {
        return {
            validateFromCli() {
                if (!this.options['from-cli']) {
                    this.warning(
                        `Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI. Run ${chalk.red(
                            'jhipster <command>'
                        )} instead of ${chalk.red('yo jhipster:<command>')}`
                    );
                }
            },

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
                    this.error(
                        chalk.red(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`)
                    );
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
                this.otherModules = this.config.get('otherModules') || [];
                if (this.blueprint) {
                    this.blueprintVersion = this.findBlueprintVersion(this.blueprint);
                    // Remove potential previous value to avoid duplicates
                    this.otherModules = this.otherModules.filter(module => module.name !== this.blueprint);
                    this.otherModules.push({ name: this.blueprint, version: this.blueprintVersion || 'latest' });
                }
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
                    if (this.useNpm) {
                        this.clientPackageManager = 'npm';
                    } else {
                        this.clientPackageManager = 'yarn';
                    }
                }
            }
        };
    }

    get prompting() {
        return {
            askForInsightOptIn: prompts.askForInsightOptIn,
            // TODO : enable this. It's a bit messy for now, it need better sync.
            // askForAccountLinking: prompts.askForAccountLinking,
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
                if (this.reactive) {
                    // TODO: support client in reactive app
                    this.skipClient = true;
                    this.generatorType = 'server';
                }
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
                }
                if (this.skipServer) {
                    // defaults to use when skipping server
                    this.generatorType = 'client';
                    this.configOptions.databaseType = this.getDBTypeFromDBValue(this.options.db);
                    this.configOptions.devDatabaseType = this.options.db;
                    this.configOptions.prodDatabaseType = this.options.db;
                    this.configOptions.authenticationType = this.options.auth;
                    this.configOptions.uaaBaseName = this.options.uaaBaseName;
                    this.configOptions.useYarn = this.useYarn;
                    this.configOptions.searchEngine = this.options['search-engine'];
                    this.configOptions.buildTool = this.options.build;
                    this.configOptions.websocket = this.options.websocket;
                }
                this.configOptions.clientPackageManager = this.clientPackageManager;
            },

            // composeAccountLinking() {
            //     if (!this.linkAccount) return;

            //     this.composeWith(require.resolve('../link-account'));
            // },

            composeCommon() {
                this.composeWith(require.resolve('../common'), {
                    'from-cli': this.options['from-cli'],
                    configOptions: this.configOptions,
                    force: this.options.force,
                    debug: this.isDebugEnabled
                });
            },

            composeServer() {
                if (this.skipServer) return;

                this.composeWith(require.resolve('../server'), {
                    'client-hook': !this.skipClient,
                    'from-cli': this.options['from-cli'],
                    configOptions: this.configOptions,
                    force: this.options.force,
                    debug: this.isDebugEnabled
                });
            },

            composeClient() {
                if (this.skipClient) return;

                this.composeWith(require.resolve('../client'), {
                    'skip-install': this.options['skip-install'],
                    'skip-commit-hook': this.options['skip-commit-hook'],
                    'from-cli': this.options['from-cli'],
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

            composeLanguages() {
                if (this.skipI18n) return;
                this.composeLanguagesSub(this, this.configOptions, this.generatorType);
            },

            saveConfig() {
                const config = {
                    jhipsterVersion: packagejs.version,
                    applicationType: this.applicationType,
                    baseName: this.baseName,
                    testFrameworks: this.testFrameworks,
                    jhiPrefix: this.jhiPrefix,
                    skipCheckLengthOfIdentifier: this.skipCheckLengthOfIdentifier,
                    otherModules: this.otherModules,
                    enableTranslation: this.enableTranslation,
                    clientPackageManager: this.clientPackageManager
                };
                if (this.enableTranslation) {
                    config.nativeLanguage = this.nativeLanguage;
                    config.languages = this.languages;
                }
                this.blueprint && (config.blueprint = this.blueprint);
                this.blueprintVersion && (config.blueprintVersion = this.blueprintVersion);
                this.reactive && (config.reactive = this.reactive);
                this.skipClient && (config.skipClient = true);
                this.skipServer && (config.skipServer = true);
                this.skipUserManagement && (config.skipUserManagement = true);
                this.config.set(config);
            },

            insight() {
                const yorc = {
                    ..._.omit(this.configOptions, [
                        'jhiPrefix',
                        'baseName',
                        'jwtSecretKey',
                        'packageName',
                        'packagefolder',
                        'rememberMeKey'
                    ])
                };
                yorc.applicationType = this.applicationType;
                statistics.sendYoRc(yorc, this.existingProject, this.jhipsterVersion);
            }
        };
    }

    get writing() {
        return {
            cleanup() {
                cleanup.cleanupOldFiles(this);
            },

            regenerateEntities() {
                if (this.withEntities) {
                    this.getExistingEntities().forEach(entity => {
                        this.composeWith(require.resolve('../entity'), {
                            regenerate: true,
                            'skip-install': true,
                            'from-cli': this.options['from-cli'],
                            force: this.options.force,
                            debug: this.isDebugEnabled,
                            arguments: [entity.name]
                        });
                    });
                }
            },

            initGitRepo() {
                if (!this.options['skip-git']) {
                    this.isGitInstalled(code => {
                        if (code === 0) {
                            this.gitExec('rev-parse --is-inside-work-tree', { trace: false }, (err, gitDir) => {
                                // gitDir has a line break to remove (at least on windows)
                                if (gitDir && gitDir.trim() === 'true') {
                                    this.gitInitialized = true;
                                } else {
                                    this.gitExec('init', { trace: false }, () => {
                                        this.log(chalk.green.bold('Git repository initialized.'));
                                        this.gitInitialized = true;
                                    });
                                }
                            });
                        } else {
                            this.warning('Git repository could not be initialized, as Git is not installed on your system');
                        }
                    });
                }
            }
        };
    }

    get end() {
        return {
            gitCommit() {
                if (!this.options['skip-git']) {
                    this.debug('Committing files to git');
                    const done = this.async();
                    this.isGitInstalled(code => {
                        if (code === 0 && this.gitInitialized) {
                            this.gitExec('add -A', { trace: false }, () => {
                                let commitMsg = `Initial application generated by JHipster-${this.jhipsterVersion}`;
                                if (this.blueprint) {
                                    commitMsg += ` with blueprint: ${this.blueprint.replace('generator-jhipster-', '')}`;
                                    if (this.blueprintVersion) {
                                        commitMsg += `-${this.blueprintVersion}`;
                                    }
                                }
                                this.gitExec(`commit -am "${commitMsg}"`, { trace: false }, () => {
                                    this.log(chalk.green.bold('Application successfully committed to Git.'));
                                    done();
                                });
                            });
                        } else {
                            this.warning(
                                'The generated application could not be committed to Git, as a Git repository could not be initialized.'
                            );
                            done();
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
                this.log(
                    chalk.green(
                        `\nIf you find JHipster useful consider sponsoring the project ${chalk.yellow(
                            'https://www.jhipster.tech/sponsors/'
                        )}`
                    )
                );
            }
        };
    }
};
