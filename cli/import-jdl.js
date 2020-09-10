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

const EnvironmentBuilder = require('./environment-builder');
const { CLI_NAME, GENERATOR_NAME, logger, toString, printSuccess, getOptionAsArgs } = require('./utils');
const { getDBTypeFromDBValue, loadYoRc } = require('../generators/utils');
const { createImporterFromContent, createImporterFromFiles } = require('../jdl/jdl-importer');

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');
const { JHIPSTER_CONFIG_DIR, SUPPORTED_CLIENT_FRAMEWORKS } = require('../generators/generator-constants');

const jhipsterCli = require.resolve('./cli.js');
const { writeConfigFile } = require('../jdl/exporters/export-utils');
const { createFolderIfItDoesNotExist } = require('../jdl/utils/file-utils');

const ANGULAR = SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

const getDeploymentType = deployment => deployment && deployment[GENERATOR_NAME] && deployment[GENERATOR_NAME].deploymentType;

function writeEntityConfig(entity, basePath) {
    const entitiesPath = path.join(basePath, JHIPSTER_CONFIG_DIR);
    createFolderIfItDoesNotExist(entitiesPath);
    const filePath = path.join(entitiesPath, `${_.upperFirst(entity.name)}.json`);
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 2).concat('\n'));
}

function writeApplicationConfig(applicationWithEntities, basePath) {
    createFolderIfItDoesNotExist(basePath);
    writeConfigFile({ 'generator-jhipster': applicationWithEntities.config }, path.join(basePath, '.yo-rc.json'));
    applicationWithEntities.entities.forEach(entity => writeEntityConfig(entity, basePath));
}

function runGenerator(command, cwd, generatorOptions = {}, options = {}) {
    generatorOptions = { ...generatorOptions, fromCli: true, localConfigOnly: true };
    delete generatorOptions.fork;

    if (options.fork === false) {
        const env = options.env || EnvironmentBuilder.createDefaultBuilder(undefined, { cwd }).getEnvironment();
        return env.run(`${CLI_NAME}:${command}`, generatorOptions).then(
            () => {
                logger.info(`Generator ${command} succeed`);
            },
            error => {
                logger.error(`Error running generator ${command}: ${error}`, error);
            }
        );
    }
    logger.debug(`Child process will be triggered for ${command} with cwd: ${cwd}`);
    const args = [command, ...getOptionAsArgs(generatorOptions)];
    const childProc = fork(jhipsterCli, args, {
        cwd,
    });
    return new Promise(resolve => {
        childProc.on('exit', code => {
            if (code !== 0) {
                process.exitCode = code;
            }
            logger.debug(`Process ${args} exited with code ${code}`);
            logger.info(`Generator ${command} child process exited with code ${code}`);
            resolve();
        });
    });
}

/**
 * Imports the Applications and Entities defined in JDL
 * The app .yo-rc.json files and entity json files are written to disk
 */
function importJDL(jdlImporter) {
    logger.info('The JDL is being parsed.');

    try {
        const importState = jdlImporter.import();
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
        return importState;
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
}

/**
 * Check if application needs to be generated
 * @param {any} processor
 */
const shouldGenerateApplications = processor =>
    !processor.options.ignoreApplication && !processor.options.jsonOnly && processor.importState.exportedApplications.length !== 0;

/**
 * Check if deployments needs to be generated
 * @param {any} processor
 */
const shouldGenerateDeployments = processor =>
    !processor.options.ignoreDeployments && !processor.options.jsonOnly && processor.importState.exportedDeployments.length !== 0;

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
    logger.debug(`Child process will be triggered for ${jhipsterCli} with cwd: ${cwd}`);

    const command = deploymentType;
    const force = !processor.options.interactive ? true : undefined;
    return runGenerator(command, cwd, { force, ...processor.options, skipPrompts: true });
};

/**
 * Generate application source code for JDL apps defined.
 * @param {any} config
 * @returns Promise
 */
const generateApplicationFiles = ({ processor, applicationWithEntities, inFolder }) => {
    const baseName = applicationWithEntities.config.baseName;
    logger.debug(`Generating application: ${pretty(applicationWithEntities)}`);

    const cwd = inFolder ? path.join(processor.pwd, baseName) : processor.pwd;
    const { fork = inFolder } = processor.options;
    const skipApplication = !shouldGenerateApplications(processor);
    if (fork || skipApplication) {
        writeApplicationConfig(applicationWithEntities, cwd);
        if (skipApplication) {
            logger.debug('Applications not generated');
            return Promise.resolve();
        }
    }

    const command = 'app';
    const withEntities = applicationWithEntities.entities.length > 0 ? true : undefined;
    const force = !processor.options.interactive ? true : undefined;
    const generatorOptions = { force, withEntities, ...processor.options };
    if (!fork) {
        generatorOptions.applicationWithEntities = applicationWithEntities;
    }

    return runGenerator(command, cwd, generatorOptions, { fork });
};

/**
 * Generate entities for the applications
 * @param {any} processor
 * @param {any} entity
 * @param {boolean} inFolder
 * @param {any} env
 * @param {boolean} shouldSkipInstall
 * @return Promise
 */
const generateEntityFiles = (processor, entity, inFolder, env, shouldSkipInstall) => {
    const options = {
        force: !processor.options.interactive ? true : undefined,
        ...processor.options,
        /* skip-install is required by yeoman-generator processor.options.skipInstall will not be undefined, we need for force skipInstall option. */
        skipInstall: shouldSkipInstall,
        regenerate: true,
        fromCli: true,
    };
    const command = `entity ${entity.name}`;
    const { fork = inFolder } = processor.options;

    const callGenerator = baseName => {
        const cwd = inFolder && baseName ? path.join(processor.pwd, baseName) : processor.pwd;
        logger.info(`Generating entity ${entity.name} for application ${baseName} in a new parallel process`);
        writeEntityConfig(entity, cwd);

        if (processor.options.jsonOnly) {
            logger.info('Entity JSON files created. Entity generation skipped.');
            return Promise.resolve();
        }

        logger.debug(`Child process will be triggered for ${jhipsterCli} with cwd: ${cwd}`);
        return runGenerator(command, cwd, options, { env, fork });
    };

    if (inFolder) {
        /* Generating entities inside multiple apps */
        const baseNames = entity.applications;
        if (processor.options.interactive) {
            return baseNames.reduce((promise, baseName) => {
                return promise.then(() => callGenerator(baseName));
            }, Promise.resolve());
        }
        return Promise.all(baseNames.map(callGenerator));
    }

    return callGenerator();
};

/**
 * Check if NPM install needs to be skipped.
 * It should not be skipped for the last entity or if user specifies it.
 * @param {any} processor
 * @param {number} index
 */
const shouldSkipInstallEntity = (processor, index) =>
    index !== processor.importState.exportedEntities.length - 1 || processor.options.skipInstall;

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
            this.yoRC = loadYoRc('.yo-rc.json');
            const configuration = this.yoRC['generator-jhipster'];
            if (!configuration) {
                return;
            }
            logger.info('Found .yo-rc.json on path. This is an existing app');
            if (this.options.interactive === undefined) {
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
            this.clientPackageManager = configuration.clientPackageManager || 'npm';
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
            skipFileGeneration: true,
            application: this.yoRC,
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
        const applicationsWithEntities = Object.values(this.importState.exportedApplicationsWithEntities);
        logger.info(`Generating ${applicationsWithEntities.length} ${pluralize('application', applicationsWithEntities.length)}.`);
        const callGenerator = applicationWithEntities => {
            try {
                return generateApplicationFiles({
                    processor: this,
                    applicationWithEntities,
                    inFolder: applicationsWithEntities.length > 1,
                });
            } catch (error) {
                logger.error(`Error while generating applications from the parsed JDL\n${error}`, error);
                throw error;
            }
        };
        if (this.options.interactive) {
            return applicationsWithEntities.reduce((promise, applicationWithEntities) => {
                return promise.then(() => callGenerator(applicationWithEntities));
            }, Promise.resolve());
        }
        return Promise.all(applicationsWithEntities.map(callGenerator));
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
                        shouldSkipInstallEntity(this, i)
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
        logger.error(`Error during import-jdl: ${e}`, e);
        return Promise.reject(new Error(`Error during import-jdl: ${e.message}`));
    }
};
