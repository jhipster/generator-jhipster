const chalk = require('chalk');
const _ = require('lodash');
const path = require('path');
const shelljs = require('shelljs');
const jhiCore = require('jhipster-core');
const pretty = require('js-object-pretty-print').pretty;
const pluralize = require('pluralize');
const { fork } = require('child_process');

const {
    CLI_NAME, GENERATOR_NAME, logger, createYeomanEnv, toString, getOptionsFromArgs, getCommandOptions
} = require('./utils');
const jhipsterUtils = require('../generators/utils');
const packageJson = require('../package.json');

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');

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

function shouldGenerateApplications(generator) {
    return !generator.options['ignore-application'] && generator.importState.exportedApplications.length !== 0;
}

function generateApplicationFiles({
    generator, application, withEntities, inAppFolder
}) {
    const baseName = application[GENERATOR_NAME].baseName;
    logger.info(`Generating application: ${baseName}`);
    logger.debug(`Generating application: ${pretty(application[GENERATOR_NAME])}`);
    // if (inAppFolder) {
    //     logger.debug(`Pwd "${generator.pwd}"`);
    //     logger.debug(`Switching directory to "${baseName}" for app generation`);
    //     shelljs.cd(path.join(generator.pwd, application[GENERATOR_NAME].baseName));
    // }
    // const runYeomanProcess = require.resolve(path.join(process.cwd(), 'node_modules', 'generator-jhipster', 'cli', 'run-yeoman-process.js'));
    const runYeomanProcess = require.resolve('./run-yeoman-process.js');
    logger.debug(`Child process will be triggered for ${runYeomanProcess}`);
    fork(runYeomanProcess, ['--from-cli'], {
        cwd: inAppFolder ? path.join(generator.pwd, application[GENERATOR_NAME].baseName) : generator.pwd
    });
    // const command = `${CLI_NAME}:app`;
    // const env = createYeomanEnv();

    // env.run(command, {
    //     force: generator.options.force,
    //     debug: generator.options.debug,
    //     'from-cli': true,
    //     'skip-client': generator.options.skipClient,
    //     'skip-server': generator.options.skipServer,
    //     'skip-install': generator.options['skip-install'],
    //     'skip-user-management': application[GENERATOR_NAME].skipUserManagement,
    //     'jhi-prefix': application[GENERATOR_NAME].jhiPrefix,
    //     'with-entities': withEntities
    // }, () => {
    //     logger.info(chalk.green.bold(`Application: ${baseName} generated succesfully.cd`));
    // });
}

function generateEntityFiles(generator, entity) {
    callSubGenerator(generator, '..', 'entity', {
        force: generator.options.force,
        debug: generator.options.debug,
        regenerate: true,
        'skip-install': true,
        'skip-client': entity.skipClient,
        'skip-server': entity.skipServer,
        'no-fluent-methods': entity.noFluentMethod,
        'skip-user-management': entity.skipUserManagement,
        'skip-ui-grouping': generator.options['skip-ui-grouping'],
        arguments: [entity.name]
    });
}

function callSubGenerator(generator, subgenPath, name, args) {
    generator.composeWith(require.resolve(path.join(subgenPath, name)), args);
    // env.run(command, options, done);
}

class JDLProcessor {
    constructor(jdlFiles, options) {
        logger.debug(`JDLProcessor started with jdlFiles: ${jdlFiles} and options: ${toString(options)}`);
        this.jdlFiles = jdlFiles;
        this.options = options;
        this.pwd = process.cwd();
        this.applicationsLeftToGenerate = [];
        this.entitiesLeftToGenerate = [];
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
                    inAppFolder: this.importState.exportedApplications.length !== 1
                });
            } catch (error) {
                logger.error(`Error while generating applications from the parsed JDL\n${error}`);
            }
        });
    }

    generateEntities() {
        if (this.importState.exportedEntities.length === 0 || this.importState.exportedApplications.length !== 0) {
            return;
        }
        if (this.options['json-only']) {
            logger.log('Entity JSON files created. Entity generation skipped.');
            return;
        }
        try {
            this.importState.exportedEntities.forEach((exportedEntity) => {
                if (this.importState.exportedApplications.length === 0
                    || this.importState.exportedApplications.length === 1) {
                    logger.log(`Generating ${this.importState.exportedEntities.length} `
                        + `${pluralize('entity', this.importState.exportedEntities.length)}.`);

                    generateEntityFiles(this, exportedEntity);
                } else {
                    // sub-folder generation, not yet handled
                    this.entitiesLeftToGenerate.push(exportedEntity.name);
                }
            });
        } catch (error) {
            logger.error(`Error while generating entities from the parsed JDL\n${error}`);
        }
    }

    end() {
        if (!this.options['skip-install'] && !this.skipClient && !this.options['json-only']
            && !shouldGenerateApplications(this)) {
            logger.debug('Building client');
            // this.rebuildClient();
        }
        if (this.applicationsLeftToGenerate.length !== 0) {
            logger.info(`Here are the application names to generate manually: ${this.applicationsLeftToGenerate.join(', ')}`);
        }
        if (this.entitiesLeftToGenerate.length !== 0) {
            logger.info(`Here are the entity names to generate manually: ${_.uniq(this.entitiesLeftToGenerate).join(', ')}`);
        }
    }
}

module.exports = function (cmd, args, opts, env) {
    logger.debug(`cmd: ${toString(cmd)} from ./import-jdl`);
    logger.debug(`args: ${toString(args)}`);
    logger.debug(`opts: ${toString(opts)}`);
    const parsedArgs = getOptionsFromArgs(args);
    const options = getCommandOptions(packageJson, process.argv.slice(2));
    logger.info(chalk.yellow(`Executing import-jdl ${parsedArgs.join(' ')}`));
    logger.info(chalk.yellow(`Options: ${toString(options)}`));
    try {
        const jdlImporter = new JDLProcessor(parsedArgs, options);
        jdlImporter.validate();
        jdlImporter.getConfig();
        jdlImporter.importJDL();
        jdlImporter.sendInsight();
        jdlImporter.generateApplications();
        jdlImporter.generateEntities();
        jdlImporter.end();
    } catch (e) {
        logger.error(e.message);
        logger.log(e);
        process.exit(1);
    }
};
