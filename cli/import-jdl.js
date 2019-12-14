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
const path = require('path');
const shelljs = require('shelljs');
const jhiCore = require('jhipster-core');
const pretty = require('js-object-pretty-print').pretty;
const pluralize = require('pluralize');
const { fork } = require('child_process');

const waitUntil = require('./wait-until');
const { CLI_NAME, GENERATOR_NAME, logger, toString, getOptionsFromArgs, done, getOptionAsArgs } = require('./utils');
const jhipsterUtils = require('../generators/utils');

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');

const runYeomanProcess = require.resolve('./run-yeoman-process.js');

// holds the state of generation for interactive mode
const generationCompletionState = {
    exportedEntities: {},
    exportedApplications: {},
    exportedDeployments: {}
};

const getBaseName = application => application && application[GENERATOR_NAME] && application[GENERATOR_NAME].baseName;
const getDeploymentType = deployment => deployment && deployment[GENERATOR_NAME] && deployment[GENERATOR_NAME].deploymentType;

/**
 * update the initial state
 */
const updateDeploymentState = importState =>
    Object.entries(importState).forEach(([key, val]) => {
        val.forEach(it => {
            generationCompletionState[key][getBaseName(it) || getDeploymentType(it) || it.name] = false;
        });
    });

/**
 * Imports the Applications and Entities defined in JDL
 * The app .yo-rc.json files and entity json files are written to disk
 */
function importJDL(jdlImporter) {
    logger.info('The JDL is being parsed.');

    let importState = {
        exportedEntities: [],
        exportedApplications: [],
        exportedDeployments: []
    };
    try {
        importState = jdlImporter.import();
        logger.debug(`importState exportedEntities: ${importState.exportedEntities.length}`);
        logger.debug(`importState exportedApplications: ${importState.exportedApplications.length}`);
        logger.debug(`importState exportedDeployments: ${importState.exportedDeployments.length}`);
        updateDeploymentState(importState);
        if (importState.exportedEntities.length > 0) {
            const entityNames = _.uniq(importState.exportedEntities.map(exportedEntity => exportedEntity.name)).join(', ');
            logger.info(`Found entities: ${chalk.yellow(entityNames)}.`);
        } else {
            logger.info(chalk.yellow('No change in entity configurations, no entities were updated.'));
        }
        logger.info('The JDL has been successfully parsed');
    } catch (error) {
        logger.debug('Error:', error);
        if (error) {
            const errorName = `${error.name}:` || '';
            const errorMessage = error.message || '';
            logger.log(chalk.red(`${errorName} ${errorMessage}`));
        }
        logger.error(`Error while parsing applications and entities from the JDL ${error}`, error);
    }
    return importState;
}

/**
 * Check if application needs to be generated
 * @param {any} generator
 */
const shouldGenerateApplications = generator =>
    !generator.options['ignore-application'] && generator.importState.exportedApplications.length !== 0;

/**
 * Check if deployments needs to be generated
 * @param {any} generator
 */
const shouldGenerateDeployments = generator =>
    !generator.options['ignore-deployments'] && generator.importState.exportedDeployments.length !== 0;

/**
 * Generate deployment source code for JDL deployments defined.
 * @param {any} config
 * @param {function} forkProcess
 * @returns {obj} Nodejs ChildProcess: https://nodejs.org/api/child_process.html#child_process_child_process
 */
const generateDeploymentFiles = ({ generator, deployment, inFolder }, forkProcess) => {
    const deploymentType = getDeploymentType(deployment);
    logger.info(`Generating deployment ${deploymentType} in a new parallel process`);
    logger.debug(`Generating deployment: ${pretty(deployment[GENERATOR_NAME])}`);

    const cwd = inFolder ? path.join(generator.pwd, deploymentType) : generator.pwd;
    logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

    const command = `${CLI_NAME}:${deploymentType}`;
    const childProc = forkProcess(
        runYeomanProcess,
        [command, '--skip-prompts', ...getOptionAsArgs(generator.options, false, !generator.options.interactive)],
        {
            cwd
        }
    );
    childProc.on('exit', code => {
        if (code !== 0) {
            process.exitCode = code;
        }
        logger.info(`Deployment: child process exited with code ${code}`);
        generationCompletionState.exportedDeployments[deploymentType] = true;
    });
};

/**
 * Generate application source code for JDL apps defined.
 * @param {any} config
 * @param {function} forkProcess
 * @returns {obj} Nodejs ChildProcess: https://nodejs.org/api/child_process.html#child_process_child_process
 */
const generateApplicationFiles = ({ generator, application, withEntities, inFolder }, forkProcess) => {
    const baseName = getBaseName(application);
    logger.info(`Generating application ${baseName} in a new parallel process`);
    logger.debug(`Generating application: ${pretty(application[GENERATOR_NAME])}`);

    const cwd = inFolder ? path.join(generator.pwd, baseName) : generator.pwd;
    logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

    const command = `${CLI_NAME}:app`;
    const childProc = forkProcess(
        runYeomanProcess,
        [command, ...getOptionAsArgs(generator.options, withEntities, !generator.options.interactive)],
        {
            cwd
        }
    );
    childProc.on('exit', code => {
        if (code !== 0) {
            process.exitCode = code;
        }
        logger.info(`App: child process exited with code ${code}`);
        generationCompletionState.exportedApplications[baseName] = true;
    });
};

/**
 * Generate entities for the applications
 * @param {any} generator
 * @param {any} entity
 * @param {boolean} inFolder
 * @param {any} env
 * @param {boolean} shouldTriggerInstall
 * @param {function} forkProcess
 */
const generateEntityFiles = (generator, entity, inFolder, env, shouldTriggerInstall, forkProcess) => {
    const options = {
        ...generator.options,
        regenerate: true,
        'from-cli': true,
        'skip-install': true,
        'skip-client': entity.skipClient,
        'skip-server': entity.skipServer,
        'no-fluent-methods': entity.noFluentMethod,
        'skip-user-management': entity.skipUserManagement,
        'skip-db-changelog': generator.options['skip-db-changelog'],
        'skip-ui-grouping': generator.options['skip-ui-grouping']
    };
    const command = `${CLI_NAME}:entity ${entity.name}`;
    if (inFolder) {
        /* Generating entities inside multiple apps */
        let previousEntity;
        const callGenerator = baseName => {
            logger.info(`Generating entities for application ${baseName} in a new parallel process`);
            const cwd = path.join(generator.pwd, baseName);
            logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

            const childProc = forkProcess(runYeomanProcess, [command, ...getOptionAsArgs(options, false, !options.interactive)], { cwd });
            childProc.on('exit', code => {
                if (code !== 0) {
                    process.exitCode = code;
                }
                logger.info(`Entity: child process exited with code ${code}`);
                generationCompletionState.exportedEntities[entity.name] = true;
            });
            previousEntity = entity.name;
        };
        const baseNames = entity.applications;
        baseNames.forEach(baseName => {
            if (generator.options.interactive) {
                waitUntil()
                    .interval(500)
                    .times(200) // approximate 2 minutes
                    .condition(() => generationCompletionState.exportedEntities[previousEntity] || !previousEntity)
                    .done(result => {
                        logger.debug(`Result from waitUntil for application ${previousEntity} to finish: ${result}`);
                        callGenerator(baseName);
                    });
            } else {
                callGenerator(baseName);
            }
        });
    } else {
        /* Traditional entity only generation */
        env.run(
            command,
            {
                ...options,
                force: options.force || !options.interactive,
                'skip-install': !shouldTriggerInstall
            },
            done
        );
    }
};

/**
 * Check if NPM/Yarn install needs to be triggered. This will be done for the last entity.
 * @param {any} generator
 * @param {number} index
 */
const shouldTriggerInstall = (generator, index) =>
    index === generator.importState.exportedEntities.length - 1 &&
    !generator.options['skip-install'] &&
    !generator.skipClient &&
    !generator.options['json-only'] &&
    !shouldGenerateApplications(generator);

const isAllCompleted = items => Object.values(items).every(it => it);

class JDLProcessor {
    constructor(jdlFiles, jdlContent, options) {
        logger.debug(
            `JDLProcessor started with ${jdlContent ? `content: ${jdlContent}` : `files: ${jdlFiles}`} and options: ${toString(options)}`
        );
        this.jdlFiles = jdlFiles;
        this.jdlContent = jdlContent;
        this.options = options;
        this.pwd = process.cwd();
    }

    getConfig() {
        if (jhiCore.FileUtils.doesFileExist('.yo-rc.json')) {
            logger.info('Found .yo-rc.json on path. This is an existing app');
            const configuration = jhipsterUtils.getAllJhipsterConfig(null, true);
            if (_.isUndefined(this.options.interactive)) {
                logger.debug('Setting interactive true for existing apps');
                this.options.interactive = true;
            }
            this.applicationType = configuration.applicationType;
            this.baseName = configuration.baseName;
            this.databaseType = configuration.databaseType || jhipsterUtils.getDBTypeFromDBValue(this.options.db);
            this.prodDatabaseType = configuration.prodDatabaseType || this.options.db;
            this.devDatabaseType = configuration.devDatabaseType || this.options.db;
            this.skipClient = configuration.skipClient;
            this.clientFramework = configuration.clientFramework;
            this.clientFramework = this.clientFramework || 'angularX';
            this.clientPackageManager = configuration.clientPackageManager;
            if (!this.clientPackageManager) {
                if (this.useNpm) {
                    this.clientPackageManager = 'npm';
                } else {
                    this.clientPackageManager = 'yarn';
                }
            }
        }
    }

    importJDL() {
        const configuration = {
            databaseType: this.prodDatabaseType,
            applicationType: this.applicationType,
            applicationName: this.baseName,
            generatorVersion: packagejs.version,
            forceNoFiltering: this.options.force
        };
        const JDLImporter = jhiCore.jdl.import.JDLImporter;
        let importer;
        if (this.jdlContent) {
            importer = JDLImporter.createImporterFromContent(this.jdlContent, configuration);
        } else {
            importer = JDLImporter.createImporterFromFiles(this.jdlFiles, configuration);
        }
        this.importState = importJDL.call(this, importer);
    }

    sendInsight() {
        statistics.sendSubGenEvent('generator', 'import-jdl');
    }

    generateApplications(forkProcess) {
        if (!shouldGenerateApplications(this)) {
            logger.debug('Applications not generated');
            return;
        }
        logger.info(
            `Generating ${this.importState.exportedApplications.length} ` +
                `${pluralize('application', this.importState.exportedApplications.length)}.`
        );
        let previousApp;
        const callGenerator = application => {
            try {
                generateApplicationFiles(
                    {
                        generator: this,
                        application,
                        withEntities: this.importState.exportedEntities.length !== 0,
                        inFolder: this.importState.exportedApplications.length > 1
                    },
                    forkProcess
                );
                previousApp = getBaseName(application);
            } catch (error) {
                logger.error(`Error while generating applications from the parsed JDL\n${error}`, error);
            }
        };
        this.importState.exportedApplications.forEach(application => {
            if (this.options.interactive) {
                waitUntil()
                    .interval(500)
                    .times(500) // approximate 5 minutes
                    .condition(() => generationCompletionState.exportedApplications[previousApp] || !previousApp)
                    .done(result => {
                        logger.debug(`Result from waitUntil for application ${previousApp} to finish: ${result}`);
                        callGenerator(application);
                    });
            } else {
                callGenerator(application);
            }
        });
    }

    generateDeployments(forkProcess) {
        if (!shouldGenerateDeployments(this)) {
            logger.debug('Deployments not generated');
            return;
        }
        logger.info(
            `Generating ${this.importState.exportedDeployments.length} ` +
                `${pluralize('deployment', this.importState.exportedDeployments.length)}.`
        );

        const callDeploymentGenerator = () => {
            let previousDeployment;
            const callGenerator = deployment => {
                try {
                    generateDeploymentFiles(
                        {
                            generator: this,
                            deployment,
                            inFolder: true
                        },
                        forkProcess
                    );
                    previousDeployment = getDeploymentType(deployment);
                } catch (error) {
                    logger.error(`Error while generating deployments from the parsed JDL\n${error}`, error);
                }
            };
            this.importState.exportedDeployments.forEach(deployment => {
                if (this.options.interactive) {
                    waitUntil()
                        .interval(500)
                        .times(200) // approximate 2 minutes
                        .condition(() => generationCompletionState.exportedDeployments[previousDeployment] || !previousDeployment)
                        .done(result => {
                            logger.debug(`Result from waitUntil for deployment ${previousDeployment} to finish: ${result}`);
                            callGenerator(deployment);
                        });
                } else {
                    callGenerator(deployment);
                }
            });
        };

        if (shouldGenerateApplications(this)) {
            waitUntil()
                .interval(500)
                .times(1000) // approximate 10 minutes
                .condition(() => isAllCompleted(generationCompletionState.exportedApplications))
                .done(result => {
                    logger.info('Done waiting for application generation');
                    logger.debug(`Result from waitUntil for all applications to finish: ${result}`);
                    callDeploymentGenerator();
                });
        } else {
            callDeploymentGenerator();
        }
    }

    generateEntities(env, forkProcess) {
        if (this.importState.exportedEntities.length === 0 || shouldGenerateApplications(this)) {
            logger.debug('Entities not generated');
            return;
        }
        if (this.options['json-only']) {
            logger.info('Entity JSON files created. Entity generation skipped.');
            return;
        }
        try {
            logger.info(
                `Generating ${this.importState.exportedEntities.length} ` +
                    `${pluralize('entity', this.importState.exportedEntities.length)}.`
            );
            this.importState.exportedEntities.forEach((exportedEntity, i) => {
                generateEntityFiles(
                    this,
                    exportedEntity,
                    this.importState.exportedApplications.length > 1,
                    env,
                    shouldTriggerInstall(this, i),
                    forkProcess
                );
            });
        } catch (error) {
            logger.error(`Error while generating entities from the parsed JDL\n${error}`, error);
        }
    }
}

const validateFiles = jdlFiles => {
    if (jdlFiles) {
        jdlFiles.forEach(key => {
            if (!shelljs.test('-f', key)) {
                logger.error(chalk.red(`\nCould not find ${key}, make sure the path is correct.\n`));
            }
        });
    }
};

/**
 * Import-JDL sub generator
 * @param {any} args arguments passed for import-jdl
 * @param {any} options options passed from CLI
 * @param {any} env the yeoman environment
 * @param {function} forkProcess the method to use for process forking
 */
module.exports = (args, options, env, forkProcess = fork) => {
    logger.debug('cmd: import-jdl from ./import-jdl');
    logger.debug(`args: ${toString(args)}`);
    let jdlFiles = [];
    if (!options.inline) {
        jdlFiles = getOptionsFromArgs(args);
        validateFiles(jdlFiles);
    }
    logger.info(chalk.yellow(`Executing import-jdl ${options.inline ? 'with inline content' : jdlFiles.join(' ')}`));
    logger.info(chalk.yellow(`Options: ${toString({ ...options, inline: options.inline ? 'inline content' : '' })}`));
    try {
        const jdlImporter = new JDLProcessor(jdlFiles, options.inline, options);
        jdlImporter.getConfig();
        jdlImporter.importJDL();
        jdlImporter.sendInsight();
        jdlImporter.generateApplications(forkProcess);
        jdlImporter.generateEntities(env, forkProcess);
        jdlImporter.generateDeployments(forkProcess);
    } catch (e) {
        logger.error(`Error during import-jdl: ${e.message}`, e);
    }
};
