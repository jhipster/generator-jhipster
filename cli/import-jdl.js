/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const pretty = require('js-object-pretty-print').pretty;
const pluralize = require('pluralize');
const { fork } = require('child_process');

const { CLI_NAME, GENERATOR_NAME, logger, toString, printSuccess, doneFactory, getOptionAsArgs } = require('./utils');
const { getDBTypeFromDBValue, loadYoRc } = require('../generators/utils');
const { createImporterFromContent, createImporterFromFiles } = require('../jdl/jdl-importer');

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');
const constants = require('../generators/generator-constants');

const runYeomanProcess = require.resolve('./run-yeoman-process.js');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

const getBaseName = application => application && application[GENERATOR_NAME] && application[GENERATOR_NAME].baseName;
const getDeploymentType = deployment => deployment && deployment[GENERATOR_NAME] && deployment[GENERATOR_NAME].deploymentType;

/**
 * Imports the Applications and Entities defined in JDL
 * The app .yo-rc.json files and entity json files are written to disk
 */
function importJDL(jdlImporter) {
    logger.info('The JDL is being parsed.');

    let importState = {
        exportedEntities: [],
        exportedApplications: [],
        exportedDeployments: [],
    };
    try {
        importState = jdlImporter.import();
        logger.debug(`importState exportedEntities: ${importState.exportedEntities.length}`);
        logger.debug(`importState exportedApplications: ${importState.exportedApplications.length}`);
        logger.debug(`importState exportedDeployments: ${importState.exportedDeployments.length}`);
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
        throw error;
    }
    return importState;
}

/**
 * Check if application needs to be generated
 * @param {any} processor
 */
const shouldGenerateApplications = processor =>
    !processor.options.ignoreApplication && processor.importState.exportedApplications.length !== 0;

/**
 * Check if deployments needs to be generated
 * @param {any} processor
 */
const shouldGenerateDeployments = processor =>
    !processor.options.ignoreDeployments && processor.importState.exportedDeployments.length !== 0;

/**
 * Generate deployment source code for JDL deployments defined.
 * @param {any} config
 * @returns Promise
 */
const generateDeploymentFiles = ({ processor, deployment, inFolder }) => {
    const deploymentType = getDeploymentType(deployment);
    logger.info(`Generating deployment ${deploymentType} in a new parallel process`);
    logger.debug(`Generating deployment: ${pretty(deployment[GENERATOR_NAME])}`);

    const cwd = inFolder ? path.join(processor.pwd, deploymentType) : processor.pwd;
    logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

    const command = `${CLI_NAME}:${deploymentType}`;
    const childProc = fork(
        runYeomanProcess,
        [command, '--skip-prompts', ...getOptionAsArgs(processor.options, false, !processor.options.interactive)],
        {
            cwd,
        }
    );
    return new Promise(resolve => {
        childProc.on('exit', code => {
            if (code !== 0) {
                process.exitCode = code;
            }
            logger.info(`Deployment: child process exited with code ${code}`);
            resolve();
        });
    });
};

/**
 * Generate application source code for JDL apps defined.
 * @param {any} config
 * @returns Promise
 */
const generateApplicationFiles = ({ processor, application, withEntities, inFolder }) => {
    const baseName = getBaseName(application);
    logger.debug(`Generating application: ${pretty(application[GENERATOR_NAME])}`);

    const cwd = inFolder ? path.join(processor.pwd, baseName) : processor.pwd;
    logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

    const command = `${CLI_NAME}:app`;
    const childProc = fork(
        runYeomanProcess,
        [command, ...getOptionAsArgs(processor.options, withEntities, !processor.options.interactive)],
        {
            cwd,
        }
    );
    return new Promise(resolve => {
        childProc.on('exit', code => {
            if (code !== 0) {
                process.exitCode = code;
            }
            logger.info(`App: child process exited with code ${code}`);
            resolve();
        });
    });
};

/**
 * Generate entities for the applications
 * @param {any} processor
 * @param {any} entity
 * @param {boolean} inFolder
 * @param {any} env
 * @param {boolean} shouldTriggerInstall
 * @return Promise
 */
const generateEntityFiles = (processor, entity, inFolder, env, shouldTriggerInstall) => {
    const options = {
        ...processor.options,
        regenerate: true,
        fromCli: true,
        skipInstall: true,
        skipClient: entity.skipClient,
        skipServer: entity.skipServer,
        noFluentMethod: entity.noFluentMethod,
        skipUserManagement: entity.skipUserManagement,
        skipDbChangelog: processor.options.skipDbChangelog,
        skipUiGrouping: processor.options.skipUiGrouping,
    };
    const command = `${CLI_NAME}:entity ${entity.name}`;
    if (inFolder) {
        /* Generating entities inside multiple apps */
        const callGenerator = baseName => {
            logger.info(`Generating entity ${entity.name} for application ${baseName} in a new parallel process`);
            const cwd = path.join(processor.pwd, baseName);
            logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

            const childProc = fork(runYeomanProcess, [command, ...getOptionAsArgs(options, false, !options.interactive)], { cwd });
            return new Promise(resolve => {
                childProc.on('exit', code => {
                    if (code !== 0) {
                        process.exitCode = code;
                    }
                    logger.info(`Entity: child process exited with code ${code}`);
                    resolve();
                });
            });
        };
        const baseNames = entity.applications;
        if (processor.options.interactive) {
            return baseNames.reduce((promise, baseName) => {
                return promise.then(() => callGenerator(baseName));
            }, Promise.resolve());
        }
        return Promise.all(baseNames.map(callGenerator));
    }
    /* Traditional entity only generation */
    return env
        .run(command, {
            ...options,
            force: options.force || !options.interactive,
            skipInstall: !shouldTriggerInstall,
        })
        .catch(doneFactory());
};

/**
 * Check if NPM/Yarn install needs to be triggered. This will be done for the last entity.
 * @param {any} processor
 * @param {number} index
 */
const shouldTriggerInstall = (processor, index) =>
    index === processor.importState.exportedEntities.length - 1 &&
    !processor.options.skipInstall &&
    !processor.skipClient &&
    !processor.options.jsonOnly &&
    !shouldGenerateApplications(processor);

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
        if (fs.existsSync('.yo-rc.json')) {
            const yoRC = loadYoRc('.yo-rc.json');
            const configuration = yoRC['generator-jhipster'];
            if (!configuration) {
                return;
            }
            logger.info('Found .yo-rc.json on path. This is an existing app');
            if (_.isUndefined(this.options.interactive)) {
                logger.debug('Setting interactive true for existing apps');
                this.options.interactive = true;
            }
            this.applicationType = configuration.applicationType;
            this.baseName = configuration.baseName;
            this.databaseType = configuration.databaseType || getDBTypeFromDBValue(this.options.db);
            this.prodDatabaseType = configuration.prodDatabaseType || this.options.db;
            this.devDatabaseType = configuration.devDatabaseType || this.options.db;
            this.skipClient = configuration.skipClient;
            this.clientFramework = configuration.clientFramework;
            this.clientFramework = this.clientFramework || ANGULAR;
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
            forceNoFiltering: this.options.force,
            creationTimestamp: this.options.creationTimestamp,
        };

        let importer;
        if (this.jdlContent) {
            importer = createImporterFromContent(this.jdlContent, configuration);
        } else {
            importer = createImporterFromFiles(this.jdlFiles, configuration);
        }
        this.importState = importJDL.call(this, importer);
    }

    sendInsight() {
        statistics.sendSubGenEvent('generator', 'import-jdl');
    }

    generateApplications() {
        if (!shouldGenerateApplications(this)) {
            logger.debug('Applications not generated');
            return Promise.resolve();
        }
        logger.info(
            `Generating ${this.importState.exportedApplications.length} ` +
                `${pluralize('application', this.importState.exportedApplications.length)}.`
        );
        const callGenerator = application => {
            try {
                return generateApplicationFiles({
                    processor: this,
                    application,
                    withEntities: this.importState.exportedEntities.length !== 0,
                    inFolder: this.importState.exportedApplications.length > 1,
                });
            } catch (error) {
                logger.error(`Error while generating applications from the parsed JDL\n${error}`, error);
                throw error;
            }
        };
        if (this.options.interactive) {
            return this.importState.exportedApplications.reduce((promise, application) => {
                return promise.then(() => callGenerator(application));
            }, Promise.resolve());
        }
        return Promise.all(this.importState.exportedApplications.map(callGenerator));
    }

    generateDeployments() {
        if (!shouldGenerateDeployments(this)) {
            logger.debug('Deployments not generated');
            return Promise.resolve();
        }
        logger.info(
            `Generating ${this.importState.exportedDeployments.length} ` +
                `${pluralize('deployment', this.importState.exportedDeployments.length)}.`
        );

        const callDeploymentGenerator = () => {
            const callGenerator = deployment => {
                try {
                    return generateDeploymentFiles({
                        processor: this,
                        deployment,
                        inFolder: true,
                    });
                } catch (error) {
                    logger.error(`Error while generating deployments from the parsed JDL\n${error}`, error);
                    throw error;
                }
            };
            if (this.options.interactive) {
                // Queue callGenerator in chain
                return this.importState.exportedDeployments.reduce((promise, deployment) => {
                    return promise.then(() => callGenerator(deployment));
                }, Promise.resolve());
            }
            return Promise.all(this.importState.exportedDeployments.map(callGenerator));
        };

        return callDeploymentGenerator();
    }

    generateEntities(env) {
        if (this.importState.exportedEntities.length === 0 || shouldGenerateApplications(this)) {
            logger.debug('Entities not generated');
            return Promise.resolve();
        }
        if (this.options.jsonOnly) {
            logger.info('Entity JSON files created. Entity generation skipped.');
            return Promise.resolve();
        }
        try {
            logger.info(
                `Generating ${this.importState.exportedEntities.length} ` +
                    `${pluralize('entity', this.importState.exportedEntities.length)}.`
            );
            return Promise.all(
                this.importState.exportedEntities.map((exportedEntity, i) => {
                    return generateEntityFiles(
                        this,
                        exportedEntity,
                        this.importState.exportedApplications.length > 1,
                        env,
                        shouldTriggerInstall(this, i)
                    );
                })
            );
        } catch (error) {
            logger.error(`Error while generating entities from the parsed JDL\n${error}`, error);
            throw error;
        }
    }
}

/**
 * Import-JDL sub generator
 * @param {any} args arguments passed for import-jdl
 * @param {any} options options passed from CLI
 * @param {any} env the yeoman environment
 */
module.exports = (jdlFiles, options = {}, env) => {
    logger.info(chalk.yellow(`Executing import-jdl ${options.inline ? 'with inline content' : jdlFiles.join(' ')}`));
    logger.debug(chalk.yellow(`Options: ${toString({ ...options, inline: options.inline ? 'inline content' : '' })}`));
    try {
        const jdlImporter = new JDLProcessor(jdlFiles, options.inline, options);
        jdlImporter.getConfig();
        jdlImporter.importJDL();
        jdlImporter.sendInsight();
        return jdlImporter
            .generateApplications()
            .then(() => {
                return jdlImporter.generateEntities(env);
            })
            .then(() => {
                return jdlImporter.generateDeployments();
            })
            .then(() => {
                printSuccess();
                return jdlFiles;
            });
    } catch (e) {
        logger.error(`Error during import-jdl: ${e.message}`, e);
        return Promise.reject(new Error(`Error during import-jdl: ${e.message}`));
    }
};
