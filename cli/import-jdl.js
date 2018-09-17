const chalk = require('chalk');
const _ = require('lodash');
const path = require('path');
const shelljs = require('shelljs');
const jhiCore = require('jhipster-core');
const pretty = require('js-object-pretty-print').pretty;
const pluralize = require('pluralize');
const { fork } = require('child_process');

const {
    CLI_NAME, GENERATOR_NAME, logger, toString, getOptionsFromArgs, done, getOptionAsArgs
} = require('./utils');
const jhipsterUtils = require('../generators/utils');

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');

const runYeomanProcess = require.resolve('./run-yeoman-process.js');

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
            const entityNames = _.uniq(importState.exportedEntities
                .map(exportedEntity => exportedEntity.name))
                .join(', ');
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

const shouldGenerateApplications = generator => !generator.options['ignore-application'] && generator.importState.exportedApplications.length !== 0;

const generateApplicationFiles = ({
    generator, application, withEntities, inAppFolder
}) => {
    const baseName = application[GENERATOR_NAME].baseName;
    logger.info(`Generating application ${baseName} in a new parallel process`);
    logger.debug(`Generating application: ${pretty(application[GENERATOR_NAME])}`);

    const cwd = inAppFolder ? path.join(generator.pwd, baseName) : generator.pwd;
    logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

    const command = `${CLI_NAME}:app`;
    fork(runYeomanProcess, [command, ...getOptionAsArgs(generator.options, withEntities)], {
        cwd
    });
};

const generateEntityFiles = (generator, entity, inAppFolder, env) => {
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
        const baseNames = entity.applications;
        baseNames.forEach((baseName) => {
            logger.info(`Generating entities for application ${baseName} in a new parallel process`);
            const cwd = path.join(generator.pwd, baseName);
            logger.debug(`Child process will be triggered for ${runYeomanProcess} with cwd: ${cwd}`);

            fork(runYeomanProcess, [command, ...getOptionAsArgs(options)], { cwd });
        });
    } else {
        /* Traditional entity only generation */
        env.run(command, options, done);
    }
};

class JDLProcessor {
    constructor(jdlFiles, options) {
        logger.debug(`JDLProcessor started with jdlFiles: ${jdlFiles} and options: ${toString(options)}`);
        this.jdlFiles = jdlFiles;
        this.options = options;
        this.pwd = process.cwd();
    }

    validate() {
        if (this.jdlFiles) {
            this.jdlFiles.forEach((key) => {
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

    generateApplications() {
        if (!shouldGenerateApplications(this)) {
            logger.debug('Applications not generated');
            return;
        }
        logger.log(`Generating ${this.importState.exportedApplications.length} `
            + `${pluralize('application', this.importState.exportedApplications.length)}.`);

        this.importState.exportedApplications.forEach((application) => {
            try {
                generateApplicationFiles({
                    generator: this,
                    application,
                    withEntities: this.importState.exportedEntities.length !== 0,
                    inAppFolder: this.importState.exportedApplications.length > 1
                });
            } catch (error) {
                logger.error(`Error while generating applications from the parsed JDL\n${error}`);
            }
        });
    }

    generateEntities(env) {
        if (this.importState.exportedEntities.length === 0 || shouldGenerateApplications(this)) {
            return;
        }
        if (this.options['json-only']) {
            logger.log('Entity JSON files created. Entity generation skipped.');
            return;
        }
        try {
            this.importState.exportedEntities.forEach((exportedEntity) => {
                logger.log(`Generating ${this.importState.exportedEntities.length} `
                    + `${pluralize('entity', this.importState.exportedEntities.length)}.`);

                generateEntityFiles(this, exportedEntity, this.importState.exportedApplications.length > 1, env);
            });
        } catch (error) {
            logger.error(`Error while generating entities from the parsed JDL\n${error}`);
        }
    }

    end() {
        if (!this.options['skip-install'] && !this.skipClient && !this.options['json-only']
            && !shouldGenerateApplications(this)) {
            logger.debug('Building client');
            // TODO figure out a way to do this nicely
            // this.rebuildClient();
        }
    }
}

module.exports = (args, options, env) => {
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
        jdlImporter.generateApplications();
        jdlImporter.generateEntities(env);
        jdlImporter.end();
    } catch (e) {
        logger.error(`Error during import-jdl: ${e.message}`, e);
    }
};
