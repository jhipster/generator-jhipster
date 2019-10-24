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
const debug = require('debug')('jhipster:app');

const BaseGenerator = require('../generator-base');
const cleanup = require('../cleanup');
const options = require('./options');
const packagejs = require('../../package.json');
const statistics = require('../statistics');
const jhipsterUtils = require('../utils');
const constants = require('../generator-constants');

const defaultConfig = {
    jhipsterVersion: packagejs.version,
    applicationType: 'monolith',
    dtoSuffix: 'DTO',
    entitySuffix: '',
    jhiPrefix: 'jhi',
    skipClient: false,
    skipServer: false,
    skipUserManagement: false,
    otherModules: [],
    testFrameworks: []
};

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        debug(`Initializing ${this.rootGeneratorName()}:app generator`);

        // Keep configuration for delayed save.
        this.storedConfig = _.defaults(this.config.getAll(), defaultConfig);
        // Shared data.
        this.configOptions = {
            ...constants.REQUIRED_VARIABLES_EJS,
            experimental: this.options.experimental,
            isDebugEnabled: this.options.debug,
            useNpm: !this.options.yarn,
            useYarn: this.options.yarn,
            ...this.storedConfig
        };

        const self = this;
        Object.keys(options).forEach(key => {
            self.option(key, options[key]);
        });

        this.loadOptions();

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

        this.blueprints = blueprints;

        this.registerPrettierTransform();

        if (!this.options.skipLoadShared) {
            this.queueLoadShared();
        }
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
                    this.blueprints.forEach(blueprint => {
                        this.checkJHipsterBlueprintVersion(blueprint.name);
                        this.checkBlueprint(blueprint.name);
                    });
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
                // Export useYarn
                this.configOptions.useYarn = this.useYarn;
                this.configOptions.useNpm = this.useNpm;
            },

            checkForNewJHVersion() {
                if (!this.skipChecks) {
                    this.checkForNewVersion();
                }
            },

            validate() {
                if (this.storedConfig.skipServer && this.storedConfig.skipClient) {
                    this.error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
                }
            },

            configure() {
                if (this.blueprints && this.blueprints.length > 0) {
                    this.blueprints.forEach(blueprint => {
                        blueprint.version = this.findBlueprintVersion(blueprint.name) || 'latest';
                    });
                    this.storedConfig.blueprints = this.blueprints;

                    // Remove potential previous value to avoid duplicates
                    const otherModules = this.storedConfig.otherModules.filter(
                        module => this.blueprints.findIndex(bp => bp.name === module.name) === -1
                    );
                    otherModules.push(...this.blueprints);
                    this.storedConfig.otherModules = otherModules;
                }

                // Set embeddableLaunchScript to true if not defined, for backward compatibility
                // See https://github.com/jhipster/generator-jhipster/issues/10255
                if (this.storedConfig.embeddableLaunchScript === undefined) {
                    this.storedConfig.embeddableLaunchScript = true;
                }

                this.configOptions.skipI18nQuestion = true;
            },

            compose() {
                const generators = [require.resolve('../config'), require.resolve('../common')];

                if (!this.storedConfig.skipServer) {
                    generators.push(require.resolve('../server'));
                }

                if (!this.storedConfig.skipClient) {
                    generators.push(require.resolve('../client'));
                }

                this.composeWithShared(generators, {
                    ...this.options,
                    'client-hook': !this.storedConfig.skipClient,
                    generatorSource: this,
                    debug: this.isDebugEnabled
                });
            }
        };
    }

    get writing() {
        return {
            saveConfig() {
                this.config.set(this.storedConfig);
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
            },

            cleanup() {
                cleanup.cleanupOldFiles(this);
            },

            regenerateEntities() {
                if (this.withEntities) {
                    const options = this.options;
                    this.getExistingEntities().forEach(entity => {
                        this.composeWithShared(require.resolve('../entity'), {
                            ...options,
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
