const chalk = require('chalk');
const _ = require('lodash');
const path = require('path');
const shelljs = require('shelljs');
const jhiCore = require('jhipster-core');

const jhipsterUtils = require('../generators/utils');
const packageJson = require('../package.json');
const logger = require('./utils').logger;
const toString = require('./utils').toString;
const getOptionsFromArgs = require('./utils').getOptionsFromArgs;
const getCommandOptions = require('./utils').getCommandOptions;
const done = require('./utils').done;

const packagejs = require('../package.json');
const statistics = require('../generators/statistics');

function importJDL() {
    logger.log('The JDL is being parsed.');
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

class JDLImporter {
    constructor(jdlFiles, options) {
        //         this.argument('jdlFiles', { type: Array, required: true });
        //         this.jdlFiles = this.options.jdlFiles;

        //         // This adds support for a `--db` flag
        //         this.option('db', {
        //             desc: 'Provide DB option for the application when using skip-server flag',
        //             type: String
        //         });

        //         // This adds support for a `--json-only` flag
        //         this.option('json-only', {
        //             desc: 'Generate only the JSON files and skip entity regeneration',
        //             type: Boolean,
        //             defaults: false
        //         });

        //         // Support for the '--ignore-application' flag
        //         this.option('ignore-application', {
        //             desc: 'Ignores application generation',
        //             type: Boolean,
        //             defaults: false
        //         });

        //         // This adds support for a `--skip-ui-grouping` flag
        //         this.option('skip-ui-grouping', {
        //             desc: 'Disable the UI grouping behaviour for entity client side code',
        //             type: Boolean,
        //             defaults: false
        //         });
        this.jdlFiles = jdlFiles;
        this.options = options;
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
        if (!shouldGenerateApplications(this) || this.importState.exportedApplications.length === 0) {
            return;
        }
        logger.log(`Generating ${this.importState.exportedApplications.length} `
            + `application${this.importState.exportedApplications.length > 1 ? 's' : ''}.`);
        if (this.importState.exportedApplications.length === 1) {
            const application = this.importState.exportedApplications[0];
            try {
                generateApplicationFiles({
                    generator: this,
                    application,
                    withEntities: this.importState.exportedEntities.length !== 0
                });
            } catch (error) {
                logger.error(`Error while generating applications from the parsed JDL\n${error}`);
            }
        } else {
            // sub-folder generation, not yet handled
            this.applicationsLeftToGenerate = this.importState.exportedApplications
                .map(application => application['generator-jhipster'].baseName);
        }
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
                        + `entit${this.importState.exportedEntities.length === 1 ? 'y' : 'ies'}.`);
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
            && !shouldGenerateApplications(this, this.jdlObject)) {
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

function shouldGenerateApplications(generator) {
    return !generator.options['ignore-application'] && generator.importState.exportedApplications.length !== 0;
}

function generateApplicationFiles(args) {
    callSubGenerator(args.generator, '..', 'app', {
        force: args.generator.options.force,
        debug: args.generator.options.debug,
        'skip-client': args.generator.options.skipClient,
        'skip-server': args.generator.options.skipServer,
        'skip-install': args.generator.options['skip-install'],
        'skip-user-management': args.application['generator-jhipster'].skipUserManagement,
        'jhi-prefix': args.application['generator-jhipster'].jhiPrefix,
        'with-entities': args.withEntities
    });
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

module.exports = function (cmd, args, opts, env) {
    logger.debug(`cmd: ${toString(cmd)}`);
    logger.debug(`args: ${toString(args)}`);
    logger.debug(`opts: ${toString(opts)}`);
    const parsedArgs = getOptionsFromArgs(args);
    const options = getCommandOptions(packageJson, process.argv.slice(2));
    logger.info(chalk.yellow(`Executing import-jdl ${parsedArgs.join(' ')}`));
    logger.info(chalk.yellow(`Options: ${toString(options)}`));
    try {
        // env.run(command, options, done);
        const jdlImporter = new JDLImporter(parsedArgs, options);
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
