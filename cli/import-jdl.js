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
const path = require('path');
const shelljs = require('shelljs');
const jhiCore = require('jhipster-core');
const pretty = require('js-object-pretty-print').pretty;
const pluralize = require('pluralize');
const { fork } = require('child_process');

const { CLI_NAME, GENERATOR_NAME, logger, toString, getOptionsFromArgs, done, getOptionAsArgs } = require('./utils');
const jhipsterUtils = require('../generators/utils');

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');

const runYeomanProcess = require.resolve('./run-yeoman-process.js');

/**
 * Imports the Applications and Entities defined in JDL
 * The app .yo-rc.json files and entity json files are written to disk
 */
function importJDL() {
    logger.info('The JDL is being parsed.');
    const jdlImporter = new jhiCore.JDLImporter(this.jdlFiles, {
        databaseType: this.prodDatabaseType,
        applicationType: this.applicationType,
        applicationName: this.baseName,
        generatorVersion: packagejs.version,
        forceNoFiltering: this.options.force
    });
    let importState = {
        exportedEntities: [],
        exportedApplications: []
    };
    try {
        importState = jdlImporter.import();
        logger.debug(`importState exportedEntities: ${importState.exportedEntities.length}`);
        logger.debug(`importState exportedApplications: ${importState.exportedApplications.length}`);
        if (importState.exportedEntities.length > 0) {
            const entityNames = _.uniq(importState.exportedEntities.map(exportedEntity => exportedEntity.name)).join(', ');
            logger.log(`Found entities: ${chalk.yellow(entityNames)}.`);
        } else {
            logger.log(chalk.yellow('No change in entity configurations, no entities were updated.'));
        }
        logger.log('The JDL has been successfully parsed');
    } catch (error) {
        logger.debug('Error:', error);
        if (error) {
            const errorName = `${error.name}:` || '';
            const errorMessage = error.message || '';
            logger.log(chalk.red(`${errorName} ${errorMessage}`));
        }
        logger.error(`Error while parsing applications and entities from the JDL ${error}`);
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
 * Generate application source code for JDL apps defined.
 * @param {any} config
 * @param {function} forkProcess
 */
const generateApplicationFiles = ({ generator, application, withEntities, inAppFolder }, forkProcess) => {
    const baseName = application[GENERATOR_NAME].baseName;
    logger.info(`Generating application ${baseName} in a new parallel process`);
    logger.debug(`Generating application: ${pretty(application[GENERATOR_NAME])}`);

    const cwd = inAppFolder ? path.join(generator.pwd, baseName) : generator.pwd;
    logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

    const command = `${CLI_NAME}:app`;
    forkProcess(runYeomanProcess, [command, ...getOptionAsArgs(generator.options, withEntities)], {
        cwd
    });
};

/**
 * Generate entities for the applications
 * @param {any} generator
 * @param {any} entity
 * @param {boolean} inAppFolder
 * @param {any} env
 * @param {boolean} shouldTriggerInstall
 * @param {function} forkProcess
 */
const generateEntityFiles = (generator, entity, inAppFolder, env, shouldTriggerInstall, forkProcess) => {
    const options = {
        ...generator.options,
        regenerate: true,
        'from-cli': true,
        'skip-install': true,
        'skip-client': entity.skipClient,
        'skip-server': entity.skipServer,
        'no-fluent-methods': entity.noFluentMethod,
        'skip-user-management': entity.skipUserManagement,
        'skip-ui-grouping': generator.options['skip-ui-grouping']
    };
    const command = `${CLI_NAME}:entity ${entity.name}`;
    if (inAppFolder) {
        /* Generating entities inside multiple apps */
        const baseNames = entity.applications;
        baseNames.forEach(baseName => {
            logger.info(`Generating entities for application ${baseName} in a new parallel process`);
            const cwd = path.join(generator.pwd, baseName);
            logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

            forkProcess(runYeomanProcess, [command, ...getOptionAsArgs(options)], { cwd });
        });
    } else {
        /* Traditional entity only generation */
        env.run(
            command,
            {
                ...options,
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

class JDLProcessor {
    constructor(jdlFiles, options) {
        logger.debug(`JDLProcessor started with jdlFiles: ${jdlFiles} and options: ${toString(options)}`);
        this.jdlFiles = jdlFiles;
        this.options = options;
        this.pwd = process.cwd();
    }

    validate() {
        if (this.jdlFiles) {
            this.jdlFiles.forEach(key => {
                if (!shelljs.test('-f', key)) {
                    logger.error(chalk.red(`\nCould not find ${key}, make sure the path is correct.\n`));
                }
            });
        }
    }

    getConfig() {
        if (jhiCore.FileUtils.doesFileExist('.yo-rc.json')) {
            logger.info('Found .yo-rc.json on path. This is an existing app');
            const configuration = jhipsterUtils.getAllJhipsterConfig(null, true);
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
        this.importState = importJDL.call(this);
    }

    sendInsight() {
        statistics.sendSubGenEvent('generator', 'import-jdl');
    }

    generateApplications(forkProcess) {
        if (!shouldGenerateApplications(this)) {
            logger.debug('Applications not generated');
            return;
        }
        logger.log(
            `Generating ${this.importState.exportedApplications.length} ` +
                `${pluralize('application', this.importState.exportedApplications.length)}.`
        );

        this.importState.exportedApplications.forEach(application => {
            try {
                generateApplicationFiles(
                    {
                        generator: this,
                        application,
                        withEntities: this.importState.exportedEntities.length !== 0,
                        inAppFolder: this.importState.exportedApplications.length > 1
                    },
                    forkProcess
                );
            } catch (error) {
                logger.error(`Error while generating applications from the parsed JDL\n${error}`);
            }
        });
    }

    generateEntities(env, forkProcess) {
        if (this.importState.exportedEntities.length === 0 || shouldGenerateApplications(this)) {
            logger.debug('Entities not generated');
            return;
        }
        if (this.options['json-only']) {
            logger.log('Entity JSON files created. Entity generation skipped.');
            return;
        }
        try {
            this.importState.exportedEntities.forEach((exportedEntity, i) => {
                logger.log(
                    `Generating ${this.importState.exportedEntities.length} ` +
                        `${pluralize('entity', this.importState.exportedEntities.length)}.`
                );

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
            logger.error(`Error while generating entities from the parsed JDL\n${error}`);
        }
    }
}

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
    const jdlFiles = getOptionsFromArgs(args);
    logger.info(chalk.yellow(`Executing import-jdl ${jdlFiles.join(' ')}`));
    logger.info(chalk.yellow(`Options: ${toString(options)}`));
    try {
        const jdlImporter = new JDLProcessor(jdlFiles, options);
        jdlImporter.validate();
        jdlImporter.getConfig();
        jdlImporter.importJDL();
        jdlImporter.sendInsight();
        jdlImporter.generateApplications(forkProcess);
        jdlImporter.generateEntities(env, forkProcess);
    } catch (e) {
        logger.error(`Error during import-jdl: ${e.message}`, e);
    }
};
