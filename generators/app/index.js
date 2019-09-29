/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const jhipsterUtils = require('../utils');

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

        // This adds support for a `--entity-suffix` flag
        this.option('entity-suffix', {
            desc: 'Add suffix after entities name',
            type: String,
            defaults: ''
        });

        // This adds support for a `--dto-suffix` flag
        this.option('dto-suffix', {
            desc: 'Add suffix after dtos name',
            type: String,
            defaults: 'DTO'
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

        // NOTE: Deprecated!!! Use --blueprints instead
        this.option('blueprint', {
            desc: 'DEPRECATED: Specify a generator blueprint to use for the sub generators',
            type: String
        });
        // This adds support for a `--blueprints` flag which can be used to specify one or more blueprints to use for generation
        this.option('blueprints', {
            desc:
                'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs',
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
        this.uaaBaseName = this.configOptions.uaaBaseName = this.options['uaa-base-name'] || this.config.get('uaaBaseName');

        this.entitySuffix = this.configOptions.entitySuffix = _.isNil(this.config.get('entitySuffix'))
            ? this.options['entity-suffix']
            : this.config.get('entitySuffix');

        this.dtoSuffix = this.configOptions.dtoSuffix = _.isNil(this.config.get('dtoSuffix'))
            ? this.options['dto-suffix']
            : this.config.get('dtoSuffix');

        this.withEntities = this.options['with-entities'];
        this.skipChecks = this.options['skip-checks'];

        let blueprints = this.options.blueprints || '';
        // check for old single blueprint declaration
        const blueprint = this.options.blueprint;
        if (blueprint) {
            this.warning('--blueprint option is deprecated. Please use --blueprints instead');
            if (!blueprints.split(',').includes(blueprint)) {
                blueprints = `${blueprint},${blueprints}`;
            }
        }
        if (blueprints) {
            blueprints = jhipsterUtils.parseBluePrints(blueprints);
        } else {
            blueprints = jhipsterUtils.loadBlueprintsFromConfiguration(this.config);
        }

        this.blueprints = this.configOptions.blueprints = blueprints;

        this.useNpm = this.configOptions.useNpm = !this.options.yarn;
        this.useYarn = !this.useNpm;

        this.isDebugEnabled = this.configOptions.isDebugEnabled = this.options.debug;
        this.experimental = this.configOptions.experimental = this.options.experimental;
        this.registerPrettierTransform();
    }

    get initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            displayLogo() {
                this.printJHipsterLogo();
            },

            validateBlueprint() {
                if (this.blueprints && !this.skipChecks) {
                    this.blueprints.forEach(e => this.checkBlueprint(e.name));
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
                    this.error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
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
                // preserve old jhipsterVersion value for cleanup which occurs after new config is written into disk
                this.jhipsterOldVersion = this.config.get('jhipsterVersion');
                this.otherModules = this.config.get('otherModules') || [];
                if (this.blueprints && this.blueprints.length > 0) {
                    this.blueprints.forEach(blueprint => {
                        blueprint.version = this.findBlueprintVersion(blueprint.name) || 'latest';
                    });

                    // Remove potential previous value to avoid duplicates
                    this.otherModules = this.otherModules.filter(module => this.blueprints.findIndex(bp => bp.name === module.name) === -1);
                    this.otherModules.push(...this.blueprints);
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
                // Set embeddableLaunchScript to true if not defined, for backward compatibility
                // See https://github.com/jhipster/generator-jhipster/issues/10255
                this.embeddableLaunchScript = this.config.get('embeddableLaunchScript');
                if (!this.embeddableLaunchScript) {
                    this.embeddableLaunchScript = true;
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

            composeServer() {
                if (this.skipServer) return;
                const options = this.options;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../server'), {
                    ...options,
                    configOptions,
                    'client-hook': !this.skipClient,
                    debug: this.isDebugEnabled
                });
            },

            composeClient() {
                if (this.skipClient) return;
                const options = this.options;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../client'), {
                    ...options,
                    configOptions,
                    debug: this.isDebugEnabled
                });
            },

            composeCommon() {
                const options = this.options;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../common'), {
                    ...options,
                    'client-hook': !this.skipClient,
                    configOptions,
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
                    entitySuffix: this.entitySuffix,
                    dtoSuffix: this.dtoSuffix,
                    skipCheckLengthOfIdentifier: this.skipCheckLengthOfIdentifier,
                    otherModules: this.otherModules,
                    enableTranslation: this.enableTranslation,
                    clientPackageManager: this.clientPackageManager
                };
                if (this.enableTranslation) {
                    config.nativeLanguage = this.nativeLanguage;
                    config.languages = this.languages;
                }
                this.blueprints && (config.blueprints = this.blueprints);
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
                    const options = this.options;
                    const configOptions = this.configOptions;
                    this.getExistingEntities().forEach(entity => {
                        this.composeWith(require.resolve('../entity'), {
                            ...options,
                            configOptions,
                            regenerate: true,
                            'skip-install': true,
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
                            this.gitExec('log --oneline -n 1 -- .', { trace: false }, (code, commits) => {
                                if (code !== 0 || !commits || !commits.trim()) {
                                    // if no files in Git from current folder then we assume that this is initial application generation
                                    this.gitExec('add .', { trace: false }, code => {
                                        if (code === 0) {
                                            let commitMsg = `Initial version of ${this.baseName} generated by JHipster-${
                                                this.jhipsterVersion
                                            }`;
                                            if (this.blueprints && this.blueprints.length > 0) {
                                                const bpInfo = this.blueprints
                                                    .map(bp => `${bp.name.replace('generator-jhipster-', '')}-${bp.version}`)
                                                    .join(', ');
                                                commitMsg += ` with blueprints: ${bpInfo}`;
                                            }
                                            this.gitExec(`commit -m "${commitMsg}" -- .`, { trace: false }, code => {
                                                if (code === 0) {
                                                    this.log(
                                                        chalk.green.bold(`Application successfully committed to Git from ${process.cwd()}.`)
                                                    );
                                                } else {
                                                    this.log(
                                                        chalk.red.bold(
                                                            `Application commit to Git failed from ${process.cwd()}. Try to commit manually.`
                                                        )
                                                    );
                                                }
                                                done();
                                            });
                                        } else {
                                            this.warning(
                                                `The generated application could not be committed to Git, because ${chalk.bold(
                                                    'git add'
                                                )} command failed.`
                                            );
                                            done();
                                        }
                                    });
                                } else {
                                    // if found files in Git from current folder then we assume that this is application regeneration
                                    // if there are changes in current folder then inform user about manual commit needed
                                    this.gitExec('diff --name-only .', { trace: false }, (code, diffs) => {
                                        if (code === 0 && diffs && diffs.trim()) {
                                            this.log(
                                                `Found commits in Git from ${process.cwd()}. So we assume this is application regeneration. Therefore automatic Git commit is not done. You can do Git commit manually.`
                                            );
                                        }
                                        done();
                                    });
                                }
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
