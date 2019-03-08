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
const shelljs = require('shelljs');
const pluralize = require('pluralize');
const jhiCore = require('jhipster-core');
const prompts = require('./prompts');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const constants = require('../generator-constants');
const statistics = require('../statistics');

const SUPPORTED_VALIDATION_RULES = constants.SUPPORTED_VALIDATION_RULES;
let useBlueprint;

class EntityGenerator extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.configOptions = this.options.configOptions || {};

        this.argument('field', {
            type: String,
            required: true,
            description: 'keyword'
        });

        this.argument('type', {
            type: String,
            required: true,
            description: 'Preceding the field type'
        });

        this.argument('fieldType', {
            type: String,
            required: true,
            description: 'The field type'
        });

        this.argument('as', {
            type: String,
            required: true,
            description: 'keyword'
        });

        this.argument('fieldName', {
            type: String,
            required: true,
            description: 'The field type'
        });

        // This will only available if the type is an Entity.
        this.argument('mappedBy', {
            type: String,
            required: false,
            description: 'Specifies the field to be used on select when adding a new relationship to the Entity'
        });

        this.argument('mappedByfield', {
            type: String,
            required: true,
            description: 'The field that will be mapped by'
        });

        this.argument('to', {
            type: String,
            required: true,
            description: 'keyword'
        });

        this.argument('entityName', {
            type: String,
            required: true,
            description: 'The entity receibing the field'
        });

        this.context = {};
        this.setupEntityOptions(this, this, this.context);

        const blueprint = this.options.blueprint || this.configOptions.blueprint || this.config.get('blueprint');
        if (!opts.fromBlueprint) {
            // use global variable since getters dont have access to instance property
            useBlueprint = this.composeBlueprint(blueprint, 'entity', {
                ...this.options,
                configOptions: this.configOptions,
                arguments: [this.context.name]
            });
        } else {
            useBlueprint = false;
        }
    }

    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            getConfig() {
                const context = this.context;
                const configuration = this.getAllJhipsterConfig(this, true);
                context.useConfigurationFile = false;
                this.env.options.appPath = configuration.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
                context.options = this.options;
                context.baseName = configuration.get('baseName');
                context.capitalizedBaseName = _.upperFirst(context.baseName);
                context.packageName = configuration.get('packageName');
                context.applicationType = configuration.get('applicationType');
                context.reactive = configuration.get('reactive');
                context.packageFolder = configuration.get('packageFolder');
                context.authenticationType = configuration.get('authenticationType');
                context.cacheProvider = configuration.get('cacheProvider') || configuration.get('hibernateCache') || 'no';
                context.enableHibernateCache =
                    configuration.get('enableHibernateCache') ||
                    (configuration.get('hibernateCache') !== undefined && configuration.get('hibernateCache') !== 'no');
                context.websocket = configuration.get('websocket') === 'no' ? false : configuration.get('websocket');
                context.databaseType = configuration.get('databaseType') || this.getDBTypeFromDBValue(this.options.db);
                context.prodDatabaseType = configuration.get('prodDatabaseType') || this.options.db;
                context.devDatabaseType = configuration.get('devDatabaseType') || this.options.db;
                context.searchEngine = configuration.get('searchEngine');
                context.messageBroker = configuration.get('messageBroker') === 'no' ? false : configuration.get('messageBroker');
                context.enableTranslation = configuration.get('enableTranslation');
                context.nativeLanguage = configuration.get('nativeLanguage');
                context.languages = configuration.get('languages');
                context.buildTool = configuration.get('buildTool');
                context.jhiPrefix = configuration.get('jhiPrefix');
                context.skipCheckLengthOfIdentifier = configuration.get('skipCheckLengthOfIdentifier');
                context.jhiPrefixDashed = _.kebabCase(context.jhiPrefix);
                context.jhiTablePrefix = this.getTableName(context.jhiPrefix);
                context.testFrameworks = configuration.get('testFrameworks');
                // backward compatibility on testing frameworks
                if (context.testFrameworks === undefined) {
                    context.testFrameworks = ['gatling'];
                }
                context.protractorTests = context.testFrameworks.includes('protractor');
                context.gatlingTests = context.testFrameworks.includes('gatling');
                context.cucumberTests = context.testFrameworks.includes('cucumber');

                context.clientFramework = configuration.get('clientFramework');
                if (!context.clientFramework) {
                    context.clientFramework = 'angularX';
                }
                context.clientPackageManager = configuration.get('clientPackageManager');
                if (!context.clientPackageManager) {
                    if (context.useYarn) {
                        context.clientPackageManager = 'yarn';
                    } else {
                        context.clientPackageManager = 'npm';
                    }
                }

                context.skipClient =
                    context.applicationType === 'microservice' || this.options['skip-client'] || configuration.get('skipClient');
                context.skipServer = this.options['skip-server'] || configuration.get('skipServer');

                context.angularAppName = this.getAngularAppName(context.baseName);
                context.angularXAppName = this.getAngularXAppName(context.baseName);
                context.jhipsterConfigDirectory = '.jhipster';
                context.mainClass = this.getMainClassName(context.baseName);
                context.microserviceAppName = '';

                if (context.applicationType === 'microservice') {
                    context.microserviceName = context.baseName;
                    if (!context.clientRootFolder) {
                        context.clientRootFolder = context.microserviceName;
                    }
                }
                context.filename = `${context.jhipsterConfigDirectory}/${context.entityNameCapitalized}.json`;
                if (shelljs.test('-f', context.filename)) {
                    this.log(chalk.green(`\nFound the ${context.filename} configuration file, entity can be automatically generated!\n`));
                    context.useConfigurationFile = true;
                }

                context.entitySuffix = configuration.get('entitySuffix');
                if (_.isNil(context.entitySuffix)) {
                    context.entitySuffix = '';
                }

                context.dtoSuffix = configuration.get('dtoSuffix');
                if (_.isNil(context.dtoSuffix)) {
                    context.dtoSuffix = 'DTO';
                }

                if (context.entitySuffix === context.dtoSuffix) {
                    this.error(chalk.red('The entity cannot be generated as the entity suffix and DTO suffix are equals !'));
                }

                context.CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
            },

            validateDbExistence() {
                const context = this.context;
                if (
                    !context.databaseType ||
                    (context.databaseType === 'no' &&
                        !(
                            (context.authenticationType === 'uaa' || context.authenticationType === 'oauth2') &&
                            context.applicationType === 'gateway'
                        ))
                ) {
                    if (context.skipServer) {
                        this.error(
                            chalk.red(
                                'The entity cannot be generated as the database type is not known! Pass the --db <type> & --prod-db <db> flag in command line'
                            )
                        );
                    } else {
                        this.error(chalk.red('The entity cannot be generated as the application does not have a database configured!'));
                    }
                }
            },

            validateEntityName() {
                const entityName = this.context.entityName;
                if (!/^([a-zA-Z0-9_]*)$/.test(entityName)) {
                    this.error(chalk.red('The entity name cannot contain special characters'));
                } else if (/^[0-9].*$/.test(entityName)) {
                    this.error(chalk.red('The entity name cannot start with a number'));
                } else if (entityName === '') {
                    this.error(chalk.red('The entity name cannot be empty'));
                } else if (entityName.indexOf('Detail', entityName.length - 'Detail'.length) !== -1) {
                    this.error(chalk.red('The entity name cannot end with \'Detail\''));
                } else if (!this.context.skipServer && jhiCore.isReservedClassName(entityName)) {
                    this.error(chalk.red('The entity name cannot contain a Java or JHipster reserved keyword'));
                }
            },

            setupconsts() {
                const context = this.context;
                const entityName = context.entityName;
                // Specific Entity sub-generator constants
                if (!context.useConfigurationFile) {
                    this.error(chalk.red('The entity is not present. You have to created it first'));
                } else {
                    // existing entity reading values from file
                    this.log(`\nThe entity ${entityName} is being updated.\n`);
                    this.loadEntityJson(context.filename);
                }
            },

            validateTableName() {
                const context = this.context;
                const prodDatabaseType = context.prodDatabaseType;
                const entityTableName = context.entityTableName;
                const jhiTablePrefix = context.jhiTablePrefix;
                const skipCheckLengthOfIdentifier = context.skipCheckLengthOfIdentifier;
                const instructions = `You can specify a different table name in your JDL file or change it in .jhipster/${
                    context.name
                    }.json file and then run again 'jhipster entity ${context.name}.'`;

                if (!/^([a-zA-Z0-9_]*)$/.test(entityTableName)) {
                    this.error(chalk.red(`The table name cannot contain special characters.\n${instructions}`));
                } else if (entityTableName === '') {
                    this.error(chalk.red('The table name cannot be empty'));
                } else if (jhiCore.isReservedTableName(entityTableName, prodDatabaseType)) {
                    this.warning(
                        chalk.red(
                            `The table name cannot contain the '${entityTableName.toUpperCase()}' reserved keyword, so it will be prefixed with '${jhiTablePrefix}_'.\n${instructions}`
                        )
                    );
                    context.entityTableName = `${jhiTablePrefix}_${entityTableName}`;
                } else if (prodDatabaseType === 'oracle' && entityTableName.length > 26 && !skipCheckLengthOfIdentifier) {
                    this.error(chalk.red(`The table name is too long for Oracle, try a shorter name.\n${instructions}`));
                } else if (prodDatabaseType === 'oracle' && entityTableName.length > 14 && !skipCheckLengthOfIdentifier) {
                    this.warning(
                        `The table name is long for Oracle, long table names can cause issues when used to create constraint names and join table names.\n${instructions}`
                    );
                }
            }
        };
    }

    get initializing() {
        if (useBlueprint) return;
        return this._initializing();
    }

    _configuring() {
        return {
            validateFile() {
                const context = this.context;
                if (!context.useConfigurationFile) {
                    return;
                }
                const entityName = context.entityName;
                if (_.isUndefined(context.field)) {
                    this.error(chalk.red('field name is missing.'));
                }
                if (_.isUndefined(context.fieldType)) {
                    this.error(chalk.red('field type is missing.'));
                }
            }
        };
    }
}
