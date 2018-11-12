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
/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const shelljs = require('shelljs');
const pluralize = require('pluralize');
const jhiCore = require('jhipster-core');
const prompts = require('./prompts');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const constants = require('../generator-constants');
const statistics = require('../statistics');

/* constants used throughout */
const SUPPORTED_VALIDATION_RULES = constants.SUPPORTED_VALIDATION_RULES;
let useBlueprint;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This makes `name` a required argument.
        this.argument('name', {
            type: String,
            required: true,
            description: 'Entity name'
        });

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });

        // This method adds support for a `--[no-]regenerate` flag
        this.option('regenerate', {
            desc: 'Regenerate the entity without presenting an option to update it',
            type: Boolean,
            defaults: false
        });

        this.option('table-name', {
            desc: 'Specify table name that will be used by the entity',
            type: String
        });

        // This method adds support for a `--[no-]fluent-methods` flag
        this.option('fluent-methods', {
            desc: 'Generate fluent methods in entity beans to allow chained object construction',
            type: Boolean,
            defaults: true
        });

        // This adds support for a `--angular-suffix` flag
        this.option('angular-suffix', {
            desc: 'Use a suffix to generate Angular routes and files, to avoid name clashes',
            type: String,
            defaults: ''
        });

        // This adds support for a `--client-root-folder` flag
        this.option('client-root-folder', {
            desc:
                'Use a root folder name for entities on client side. By default its empty for monoliths and name of the microservice for gateways',
            type: String,
            defaults: ''
        });

        // This adds support for a `--skip-ui-grouping` flag
        this.option('skip-ui-grouping', {
            desc: 'Disables the UI grouping behaviour for entity client side code',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-server` flag
        this.option('skip-server', {
            desc: 'Skip the server-side code generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-client` flag
        this.option('skip-client', {
            desc: 'Skip the client-side code generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB option for the application when using skip-server flag',
            type: String
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false
        });

        this.context = {};

        this.setupEntityOptions(this, this, this.context);
        this.registerClientTransforms();
        const blueprint = this.config.get('blueprint');
        if (!opts.fromBlueprint) {
            // use global variable since getters dont have access to instance property
            useBlueprint = this.composeBlueprint(blueprint, 'entity', {
                'skip-install': this.options['skip-install'],
                'from-cli': this.options['from-cli'],
                force: this.options.force,
                arguments: [this.context.name]
            });
        } else {
            useBlueprint = false;
        }
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                if (!this.options['from-cli']) {
                    this.warning(
                        `Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI. Run ${chalk.red(
                            'jhipster <command>'
                        )} instead of ${chalk.red('yo jhipster:<command>')}`
                    );
                }
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
                const entityName = this.context.name;
                if (!/^([a-zA-Z0-9_]*)$/.test(entityName)) {
                    this.error(chalk.red('The entity name cannot contain special characters'));
                } else if (/^[0-9].*$/.test(entityName)) {
                    this.error(chalk.red('The entity name cannot start with a number'));
                } else if (entityName === '') {
                    this.error(chalk.red('The entity name cannot be empty'));
                } else if (entityName.indexOf('Detail', entityName.length - 'Detail'.length) !== -1) {
                    this.error(chalk.red("The entity name cannot end with 'Detail'"));
                } else if (!this.context.skipServer && jhiCore.isReservedClassName(entityName)) {
                    this.error(chalk.red('The entity name cannot contain a Java or JHipster reserved keyword'));
                }
            },

            setupconsts() {
                const context = this.context;
                const entityName = context.name;
                // Specific Entity sub-generator constants
                if (!context.useConfigurationFile) {
                    // no file present, new entity creation
                    this.log(`\nThe entity ${entityName} is being created.\n`);
                    context.fields = [];
                    context.haveFieldWithJavadoc = false;
                    context.relationships = [];
                    context.pagination = 'no';
                    context.validation = false;
                    context.dto = 'no';
                    context.service = 'no';
                    context.jpaMetamodelFiltering = false;
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

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            /* pre entity hook needs to be written here */
            askForMicroserviceJson: prompts.askForMicroserviceJson,
            /* ask question to user if s/he wants to update entity */
            askForUpdate: prompts.askForUpdate,
            askForFields: prompts.askForFields,
            askForFieldsToRemove: prompts.askForFieldsToRemove,
            askForRelationships: prompts.askForRelationships,
            askForRelationsToRemove: prompts.askForRelationsToRemove,
            askForTableName: prompts.askForTableName,
            askForService: prompts.askForService,
            askForDTO: prompts.askForDTO,
            askForFiltering: prompts.askForFiltering,
            askForPagination: prompts.askForPagination
        };
    }

    get prompting() {
        if (useBlueprint) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            validateFile() {
                const context = this.context;
                if (!context.useConfigurationFile) {
                    return;
                }
                const entityName = context.name;
                // Validate entity json field content
                context.fields.forEach(field => {
                    if (_.isUndefined(field.fieldName)) {
                        this.error(
                            chalk.red(`fieldName is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`)
                        );
                    }

                    if (_.isUndefined(field.fieldType)) {
                        this.error(
                            chalk.red(`fieldType is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`)
                        );
                    }

                    if (!_.isUndefined(field.fieldValidateRules)) {
                        if (!_.isArray(field.fieldValidateRules)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        field.fieldValidateRules.forEach(fieldValidateRule => {
                            if (!_.includes(SUPPORTED_VALIDATION_RULES, fieldValidateRule)) {
                                this.error(
                                    chalk.red(
                                        `fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${JSON.stringify(
                                            field,
                                            null,
                                            4
                                        )} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`
                                    )
                                );
                            }
                        });
                        if (_.includes(field.fieldValidateRules, 'max') && _.isUndefined(field.fieldValidateRulesMax)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        if (_.includes(field.fieldValidateRules, 'min') && _.isUndefined(field.fieldValidateRulesMin)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        if (_.includes(field.fieldValidateRules, 'maxlength') && _.isUndefined(field.fieldValidateRulesMaxlength)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        if (_.includes(field.fieldValidateRules, 'minlength') && _.isUndefined(field.fieldValidateRulesMinlength)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        if (_.includes(field.fieldValidateRules, 'maxbytes') && _.isUndefined(field.fieldValidateRulesMaxbytes)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        if (_.includes(field.fieldValidateRules, 'minbytes') && _.isUndefined(field.fieldValidateRulesMinbytes)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        if (_.includes(field.fieldValidateRules, 'pattern') && _.isUndefined(field.fieldValidateRulesPattern)) {
                            this.error(
                                chalk.red(
                                    `fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )}`
                                )
                            );
                        }
                        if (field.fieldType === 'ByteBuffer') {
                            this.warning(
                                chalk.red(
                                    `Cannot use validation in .jhipster/${entityName}.json for field ${JSON.stringify(
                                        field,
                                        null,
                                        4
                                    )} \nHibernate JPA 2 Metamodel does not work with Bean Validation 2 for LOB fields, so LOB validation is disabled`
                                )
                            );
                            field.validation = false;
                            field.fieldValidateRules = [];
                        }
                    }
                });

                // Validate entity json relationship content
                context.relationships.forEach(relationship => {
                    if (_.isUndefined(relationship.relationshipName)) {
                        relationship.relationshipName = relationship.otherEntityName;
                        this.warning(
                            `relationshipName is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(
                                relationship,
                                null,
                                4
                            )}, using ${relationship.otherEntityName} as fallback`
                        );
                    }

                    if (_.isUndefined(relationship.otherEntityName)) {
                        this.error(
                            chalk.red(
                                `otherEntityName is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(
                                    relationship,
                                    null,
                                    4
                                )}`
                            )
                        );
                    }

                    if (_.isUndefined(relationship.otherEntityRelationshipName)) {
                        if (
                            relationship.relationshipType === 'one-to-many' ||
                            (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === false) ||
                            relationship.relationshipType === 'one-to-one'
                        ) {
                            relationship.otherEntityRelationshipName = _.lowerFirst(entityName);
                            this.warning(
                                `otherEntityRelationshipName is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(
                                    relationship,
                                    null,
                                    4
                                )}, using ${_.lowerFirst(entityName)} as fallback`
                            );
                        }
                    }

                    if (
                        _.isUndefined(relationship.otherEntityField) &&
                        (relationship.relationshipType === 'many-to-one' ||
                            (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) ||
                            (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true))
                    ) {
                        this.warning(
                            `otherEntityField is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(
                                relationship,
                                null,
                                4
                            )}, using id as fallback`
                        );
                        relationship.otherEntityField = 'id';
                    }

                    if (_.isUndefined(relationship.relationshipType)) {
                        this.error(
                            chalk.red(
                                `relationshipType is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(
                                    relationship,
                                    null,
                                    4
                                )}`
                            )
                        );
                    }

                    if (
                        _.isUndefined(relationship.ownerSide) &&
                        (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')
                    ) {
                        this.error(
                            chalk.red(
                                `ownerSide is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(
                                    relationship,
                                    null,
                                    4
                                )}`
                            )
                        );
                    }
                });

                // Validate root entity json content
                if (_.isUndefined(context.changelogDate) && (context.databaseType === 'sql' || context.databaseType === 'cassandra')) {
                    const currentDate = this.dateFormatForLiquibase();
                    this.warning(`changelogDate is missing in .jhipster/${entityName}.json, using ${currentDate} as fallback`);
                    context.changelogDate = currentDate;
                }
                if (_.isUndefined(context.dto)) {
                    this.warning(`dto is missing in .jhipster/${entityName}.json, using no as fallback`);
                    context.dto = 'no';
                }
                if (_.isUndefined(context.service)) {
                    this.warning(`service is missing in .jhipster/${entityName}.json, using no as fallback`);
                    context.service = 'no';
                }
                if (_.isUndefined(context.jpaMetamodelFiltering)) {
                    this.warning(`jpaMetamodelFiltering is missing in .jhipster/${entityName}.json, using 'no' as fallback`);
                    context.jpaMetamodelFiltering = false;
                }
                if (_.isUndefined(context.pagination)) {
                    this.warning(`pagination is missing in .jhipster/${entityName}.json, using no as fallback`);
                    context.pagination = 'no';
                }
                if (!context.clientRootFolder && !context.skipUiGrouping) {
                    // if it is a gateway generating from a microservice, or a microservice
                    if (context.useMicroserviceJson || context.applicationType === 'microservice') {
                        context.clientRootFolder = context.microserviceName;
                    }
                }
            },

            writeEntityJson() {
                const context = this.context;
                if (context.useConfigurationFile && context.updateEntity === 'regenerate') {
                    return; // do not update if regenerating entity
                }
                // store information in a file for further use.
                if (!context.useConfigurationFile && ['sql', 'cassandra'].includes(context.databaseType)) {
                    context.changelogDate = this.dateFormatForLiquibase();
                }
                this.data = {};
                this.data.fluentMethods = context.fluentMethods;
                this.data.clientRootFolder = context.clientRootFolder;
                this.data.relationships = context.relationships;
                this.data.fields = context.fields;
                this.data.changelogDate = context.changelogDate;
                this.data.dto = context.dto;
                this.data.searchEngine = context.searchEngine;
                this.data.service = context.service;
                this.data.entityTableName = context.entityTableName;
                this.copyFilteringFlag(context, this.data, context);
                if (['sql', 'mongodb', 'couchbase'].includes(context.databaseType)) {
                    this.data.pagination = context.pagination;
                } else {
                    this.data.pagination = 'no';
                }
                this.data.javadoc = context.javadoc;
                if (context.entityAngularJSSuffix) {
                    this.data.angularJSSuffix = context.entityAngularJSSuffix;
                }
                if (context.applicationType === 'microservice') {
                    this.data.microserviceName = context.baseName;
                }
                if (context.applicationType === 'gateway' && context.useMicroserviceJson) {
                    this.data.microserviceName = context.microserviceName;
                }
                this.fs.writeJSON(context.filename, this.data, null, 4);
            },

            loadInMemoryData() {
                const context = this.context;
                const entityName = context.name;
                const entityNamePluralizedAndSpinalCased = _.kebabCase(pluralize(entityName));

                context.entityClass = context.entityNameCapitalized;
                context.entityClassHumanized = _.startCase(context.entityNameCapitalized);
                context.entityClassPlural = pluralize(context.entityClass);
                context.entityClassPluralHumanized = _.startCase(context.entityClassPlural);
                context.entityInstance = _.lowerFirst(entityName);
                context.entityInstancePlural = pluralize(context.entityInstance);
                context.entityApiUrl = entityNamePluralizedAndSpinalCased;
                context.entityFileName = _.kebabCase(context.entityNameCapitalized + _.upperFirst(context.entityAngularJSSuffix));
                context.entityFolderName = this.getEntityFolderName(context.clientRootFolder, context.entityFileName);
                context.entityModelFileName = context.entityFolderName;
                context.entityParentPathAddition = this.getEntityParentPathAddition(context.clientRootFolder);
                context.entityPluralFileName = entityNamePluralizedAndSpinalCased + context.entityAngularJSSuffix;
                context.entityServiceFileName = context.entityFileName;
                context.entityAngularName = context.entityClass + this.upperFirstCamelCase(context.entityAngularJSSuffix);
                context.entityReactName = context.entityClass + this.upperFirstCamelCase(context.entityAngularJSSuffix);
                context.entityStateName = _.kebabCase(context.entityAngularName);
                context.entityUrl = context.entityStateName;
                context.entityTranslationKey = context.clientRootFolder
                    ? _.camelCase(`${context.clientRootFolder}-${context.entityInstance}`)
                    : context.entityInstance;
                context.entityTranslationKeyMenu = _.camelCase(
                    context.clientRootFolder ? `${context.clientRootFolder}-${context.entityStateName}` : context.entityStateName
                );
                context.jhiTablePrefix = this.getTableName(context.jhiPrefix);
                context.reactiveRepositories = context.reactive && ['mongodb', 'cassandra', 'couchbase'].includes(context.databaseType);

                context.fieldsContainDate = false;
                context.fieldsContainInstant = false;
                context.fieldsContainZonedDateTime = false;
                context.fieldsContainLocalDate = false;
                context.fieldsContainBigDecimal = false;
                context.fieldsContainBlob = false;
                context.fieldsContainImageBlob = false;
                context.fieldsContainBlobOrImage = false;
                context.validation = false;
                context.fieldsContainOwnerManyToMany = false;
                context.fieldsContainNoOwnerOneToOne = false;
                context.fieldsContainOwnerOneToOne = false;
                context.fieldsContainOneToMany = false;
                context.fieldsContainManyToOne = false;
                context.fieldsIsReactAvField = false;
                context.blobFields = [];
                context.differentTypes = [context.entityClass];
                if (!context.relationships) {
                    context.relationships = [];
                }
                context.differentRelationships = {};
                context.i18nToLoad = [context.entityInstance];
                context.i18nKeyPrefix = `${context.angularAppName}.${context.entityTranslationKey}`;

                // Load in-memory data for fields
                context.fields.forEach(field => {
                    // Migration from JodaTime to Java Time
                    if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
                        field.fieldType = 'Instant';
                    }
                    const fieldType = field.fieldType;

                    if (!['Instant', 'ZonedDateTime', 'Boolean'].includes(fieldType)) {
                        context.fieldsIsReactAvField = true;
                    }

                    const nonEnumType = [
                        'String',
                        'Integer',
                        'Long',
                        'Float',
                        'Double',
                        'BigDecimal',
                        'LocalDate',
                        'Instant',
                        'ZonedDateTime',
                        'Boolean',
                        'byte[]',
                        'ByteBuffer'
                    ].includes(fieldType);
                    if (['sql', 'mongodb', 'couchbase', 'no'].includes(context.databaseType) && !nonEnumType) {
                        field.fieldIsEnum = true;
                    } else {
                        field.fieldIsEnum = false;
                    }

                    if (field.fieldIsEnum === true) {
                        context.i18nToLoad.push(field.enumInstance);
                    }

                    if (_.isUndefined(field.fieldNameCapitalized)) {
                        field.fieldNameCapitalized = _.upperFirst(field.fieldName);
                    }

                    if (_.isUndefined(field.fieldNameUnderscored)) {
                        field.fieldNameUnderscored = _.snakeCase(field.fieldName);
                    }

                    if (_.isUndefined(field.fieldNameAsDatabaseColumn)) {
                        const fieldNameUnderscored = _.snakeCase(field.fieldName);
                        const jhiFieldNamePrefix = this.getColumnName(context.jhiPrefix);
                        if (jhiCore.isReservedTableName(fieldNameUnderscored, context.databaseType)) {
                            field.fieldNameAsDatabaseColumn = `${jhiFieldNamePrefix}_${fieldNameUnderscored}`;
                        } else {
                            field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
                        }
                    }

                    if (_.isUndefined(field.fieldNameHumanized)) {
                        field.fieldNameHumanized = _.startCase(field.fieldName);
                    }

                    if (_.isUndefined(field.fieldInJavaBeanMethod)) {
                        // Handle the specific case when the second letter is capitalized
                        // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
                        if (field.fieldName.length > 1) {
                            const firstLetter = field.fieldName.charAt(0);
                            const secondLetter = field.fieldName.charAt(1);
                            if (firstLetter === firstLetter.toLowerCase() && secondLetter === secondLetter.toUpperCase()) {
                                field.fieldInJavaBeanMethod = firstLetter.toLowerCase() + field.fieldName.slice(1);
                            } else {
                                field.fieldInJavaBeanMethod = _.upperFirst(field.fieldName);
                            }
                        } else {
                            field.fieldInJavaBeanMethod = _.upperFirst(field.fieldName);
                        }
                    }

                    if (_.isUndefined(field.fieldValidateRulesPatternJava)) {
                        field.fieldValidateRulesPatternJava = field.fieldValidateRulesPattern
                            ? field.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
                            : field.fieldValidateRulesPattern;
                    }

                    if (_.isUndefined(field.fieldValidateRulesPatternAngular)) {
                        field.fieldValidateRulesPatternAngular = field.fieldValidateRulesPattern
                            ? field.fieldValidateRulesPattern.replace(/"/g, '&#34;')
                            : field.fieldValidateRulesPattern;
                    }

                    if (_.isUndefined(field.fieldValidateRulesPatternReact)) {
                        field.fieldValidateRulesPatternReact = field.fieldValidateRulesPattern
                            ? field.fieldValidateRulesPattern.replace(/'/g, "\\'")
                            : field.fieldValidateRulesPattern;
                    }

                    field.fieldValidate = _.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;

                    if (fieldType === 'ZonedDateTime') {
                        context.fieldsContainZonedDateTime = true;
                        context.fieldsContainDate = true;
                    } else if (fieldType === 'Instant') {
                        context.fieldsContainInstant = true;
                        context.fieldsContainDate = true;
                    } else if (fieldType === 'LocalDate') {
                        context.fieldsContainLocalDate = true;
                        context.fieldsContainDate = true;
                    } else if (fieldType === 'BigDecimal') {
                        context.fieldsContainBigDecimal = true;
                    } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
                        context.blobFields.push(field);
                        context.fieldsContainBlob = true;
                        if (field.fieldTypeBlobContent === 'image') {
                            context.fieldsContainImageBlob = true;
                        }
                        if (field.fieldTypeBlobContent !== 'text') {
                            context.fieldsContainBlobOrImage = true;
                        }
                    }

                    if (field.fieldValidate) {
                        context.validation = true;
                    }
                });
                context.hasUserField = context.saveUserSnapshot = false;
                // Load in-memory data for relationships
                context.relationships.forEach(relationship => {
                    if (_.isUndefined(relationship.relationshipNameCapitalized)) {
                        relationship.relationshipNameCapitalized = _.upperFirst(relationship.relationshipName);
                    }

                    if (_.isUndefined(relationship.relationshipNameCapitalizedPlural)) {
                        if (relationship.relationshipName.length > 1) {
                            relationship.relationshipNameCapitalizedPlural = pluralize(_.upperFirst(relationship.relationshipName));
                        } else {
                            relationship.relationshipNameCapitalizedPlural = _.upperFirst(pluralize(relationship.relationshipName));
                        }
                    }

                    if (_.isUndefined(relationship.relationshipNameHumanized)) {
                        relationship.relationshipNameHumanized = _.startCase(relationship.relationshipName);
                    }

                    if (_.isUndefined(relationship.relationshipNamePlural)) {
                        relationship.relationshipNamePlural = pluralize(relationship.relationshipName);
                    }

                    if (_.isUndefined(relationship.relationshipFieldName)) {
                        relationship.relationshipFieldName = _.lowerFirst(relationship.relationshipName);
                    }

                    if (_.isUndefined(relationship.relationshipFieldNamePlural)) {
                        relationship.relationshipFieldNamePlural = pluralize(_.lowerFirst(relationship.relationshipName));
                    }

                    if (
                        _.isUndefined(relationship.otherEntityRelationshipNamePlural) &&
                        (relationship.relationshipType === 'one-to-many' ||
                            (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === false) ||
                            (relationship.relationshipType === 'one-to-one' && relationship.otherEntityName.toLowerCase() !== 'user'))
                    ) {
                        relationship.otherEntityRelationshipNamePlural = pluralize(relationship.otherEntityRelationshipName);
                    }

                    if (_.isUndefined(relationship.otherEntityRelationshipNameCapitalized)) {
                        relationship.otherEntityRelationshipNameCapitalized = _.upperFirst(relationship.otherEntityRelationshipName);
                    }

                    if (_.isUndefined(relationship.otherEntityRelationshipNameCapitalizedPlural)) {
                        relationship.otherEntityRelationshipNameCapitalizedPlural = pluralize(
                            _.upperFirst(relationship.otherEntityRelationshipName)
                        );
                    }

                    const otherEntityName = relationship.otherEntityName;
                    const otherEntityData = this.getEntityJson(otherEntityName);
                    if (otherEntityData && otherEntityData.microserviceName && !otherEntityData.clientRootFolder) {
                        otherEntityData.clientRootFolder = otherEntityData.microserviceName;
                    }
                    const jhiTablePrefix = context.jhiTablePrefix;

                    if (context.dto && context.dto === 'mapstruct') {
                        if (
                            otherEntityData &&
                            (!otherEntityData.dto || otherEntityData.dto !== 'mapstruct') &&
                            otherEntityName !== 'user'
                        ) {
                            this.warning(
                                chalk.red(
                                    `This entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`
                                )
                            );
                        }
                    }

                    if (otherEntityName === 'user') {
                        relationship.otherEntityTableName = `${jhiTablePrefix}_user`;
                        context.hasUserField = true;
                    } else {
                        relationship.otherEntityTableName = otherEntityData ? otherEntityData.entityTableName : null;
                        if (!relationship.otherEntityTableName) {
                            relationship.otherEntityTableName = this.getTableName(otherEntityName);
                        }
                        if (jhiCore.isReservedTableName(relationship.otherEntityTableName, context.prodDatabaseType)) {
                            const otherEntityTableName = relationship.otherEntityTableName;
                            relationship.otherEntityTableName = `${jhiTablePrefix}_${otherEntityTableName}`;
                        }
                    }
                    context.saveUserSnapshot =
                        context.applicationType === 'microservice' &&
                        context.authenticationType === 'oauth2' &&
                        context.hasUserField &&
                        context.dto === 'no';

                    if (_.isUndefined(relationship.otherEntityNamePlural)) {
                        relationship.otherEntityNamePlural = pluralize(relationship.otherEntityName);
                    }

                    if (_.isUndefined(relationship.otherEntityNameCapitalized)) {
                        relationship.otherEntityNameCapitalized = _.upperFirst(relationship.otherEntityName);
                    }

                    if (_.isUndefined(relationship.otherEntityRelationshipNamePlural)) {
                        if (relationship.relationshipType === 'many-to-one') {
                            if (otherEntityData && otherEntityData.relationships) {
                                otherEntityData.relationships.forEach(otherRelationship => {
                                    if (
                                        _.upperFirst(otherRelationship.otherEntityName) === entityName &&
                                        otherRelationship.otherEntityRelationshipName === relationship.relationshipName &&
                                        otherRelationship.relationshipType === 'one-to-many'
                                    ) {
                                        relationship.otherEntityRelationshipName = otherRelationship.relationshipName;
                                        relationship.otherEntityRelationshipNamePlural = pluralize(otherRelationship.relationshipName);
                                    }
                                });
                            }
                        }
                    }

                    if (_.isUndefined(relationship.otherEntityAngularName)) {
                        if (relationship.otherEntityNameCapitalized !== 'User') {
                            const otherEntityAngularSuffix = otherEntityData ? otherEntityData.angularJSSuffix || '' : '';
                            relationship.otherEntityAngularName =
                                _.upperFirst(relationship.otherEntityName) + this.upperFirstCamelCase(otherEntityAngularSuffix);
                        } else {
                            relationship.otherEntityAngularName = 'User';
                        }
                    }

                    if (_.isUndefined(relationship.otherEntityNameCapitalizedPlural)) {
                        relationship.otherEntityNameCapitalizedPlural = pluralize(_.upperFirst(relationship.otherEntityName));
                    }

                    if (_.isUndefined(relationship.otherEntityFieldCapitalized)) {
                        relationship.otherEntityFieldCapitalized = _.upperFirst(relationship.otherEntityField);
                    }

                    if (_.isUndefined(relationship.otherEntityStateName)) {
                        relationship.otherEntityStateName = _.kebabCase(relationship.otherEntityAngularName);
                    }
                    if (_.isUndefined(relationship.otherEntityModuleName)) {
                        if (relationship.otherEntityNameCapitalized !== 'User') {
                            relationship.otherEntityModuleName = `${context.angularXAppName +
                                relationship.otherEntityNameCapitalized}Module`;
                            relationship.otherEntityFileName = _.kebabCase(relationship.otherEntityAngularName);
                            if (context.skipUiGrouping || otherEntityData === undefined || otherEntityData.clientRootFolder === undefined) {
                                relationship.otherEntityClientRootFolder = '';
                            } else {
                                relationship.otherEntityClientRootFolder = `${otherEntityData.clientRootFolder}/`;
                            }
                            if (otherEntityData !== undefined && otherEntityData.clientRootFolder) {
                                if (context.clientRootFolder === otherEntityData.clientRootFolder) {
                                    relationship.otherEntityModulePath = relationship.otherEntityFileName;
                                } else {
                                    relationship.otherEntityModulePath = `${
                                        context.entityParentPathAddition ? `${context.entityParentPathAddition}/` : ''
                                    }${otherEntityData.clientRootFolder}/${relationship.otherEntityFileName}`;
                                }
                                relationship.otherEntityModelName = `${otherEntityData.clientRootFolder}/${
                                    relationship.otherEntityFileName
                                }`;
                                relationship.otherEntityPath = `${otherEntityData.clientRootFolder}/${relationship.otherEntityFileName}`;
                            } else {
                                relationship.otherEntityModulePath = `${
                                    context.entityParentPathAddition ? `${context.entityParentPathAddition}/` : ''
                                }${relationship.otherEntityFileName}`;
                                relationship.otherEntityModelName = relationship.otherEntityFileName;
                                relationship.otherEntityPath = relationship.otherEntityFileName;
                            }
                        } else {
                            relationship.otherEntityModuleName = `${context.angularXAppName}SharedModule`;
                            relationship.otherEntityModulePath = 'app/core';
                        }
                    }
                    // Load in-memory data for root
                    if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide) {
                        context.fieldsContainOwnerManyToMany = true;
                    } else if (relationship.relationshipType === 'one-to-one' && !relationship.ownerSide) {
                        context.fieldsContainNoOwnerOneToOne = true;
                    } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide) {
                        context.fieldsContainOwnerOneToOne = true;
                    } else if (relationship.relationshipType === 'one-to-many') {
                        context.fieldsContainOneToMany = true;
                    } else if (relationship.relationshipType === 'many-to-one') {
                        context.fieldsContainManyToOne = true;
                    }

                    if (relationship.relationshipValidateRules && relationship.relationshipValidateRules.includes('required')) {
                        if (entityName.toLowerCase() === relationship.otherEntityName.toLowerCase()) {
                            this.warning(chalk.red('Required relationships to the same entity are not supported.'));
                        } else {
                            relationship.relationshipValidate = relationship.relationshipRequired = context.validation = true;
                        }
                    }

                    const entityType = relationship.otherEntityNameCapitalized;
                    if (!context.differentTypes.includes(entityType)) {
                        context.differentTypes.push(entityType);
                    }
                    if (!context.differentRelationships[entityType]) {
                        context.differentRelationships[entityType] = [];
                    }
                    context.differentRelationships[entityType].push(relationship);
                });

                context.pkType = this.getPkType(context.databaseType);
            },

            insight() {
                // track insights
                const context = this.context;

                statistics.sendEntityStats(
                    context.fields.length,
                    context.relationships.length,
                    context.pagination,
                    context.dto,
                    context.service,
                    context.fluentMethods
                );
            }
        };
    }

    get configuring() {
        if (useBlueprint) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            cleanup() {
                const context = this.context;
                const entityName = context.name;
                if (this.isJhipsterVersionLessThan('5.0.0')) {
                    this.removeFile(`${constants.ANGULAR_DIR}entities/${entityName}/${entityName}.model.ts`);
                }
            },

            composeServer() {
                const context = this.context;
                if (context.skipServer) return;

                this.composeWith(require.resolve('../entity-server'), {
                    context,
                    force: context.options.force,
                    debug: context.isDebugEnabled
                });
            },

            composeClient() {
                const context = this.context;
                if (context.skipClient) return;

                this.composeWith(require.resolve('../entity-client'), {
                    context,
                    'skip-install': context.options['skip-install'],
                    force: context.options.force,
                    debug: context.isDebugEnabled
                });
            },

            composeI18n() {
                const context = this.context;
                if (context.skipClient) return;

                this.composeWith(require.resolve('../entity-i18n'), {
                    context,
                    'skip-install': context.options['skip-install'],
                    force: context.options.force,
                    debug: context.isDebugEnabled
                });
            }
        };
    }

    get writing() {
        if (useBlueprint) return;
        return this._writing();
    }

    // Public API method used by the getter and also by Blueprints
    _install() {
        return {
            afterRunHook() {
                const done = this.async();
                try {
                    const modules = this.getModuleHooks();
                    if (modules.length > 0) {
                        this.log(`\n${chalk.bold.green('Running post run module hooks\n')}`);
                        // form the data to be passed to modules
                        const context = this.context;
                        context.data = context.data || context.fileData;
                        // run through all post entity creation module hooks
                        this.callHooks(
                            'entity',
                            'post',
                            {
                                entityConfig: context,
                                force: context.options.force
                            },
                            done
                        );
                    } else {
                        done();
                    }
                } catch (err) {
                    this.log(`\n${chalk.bold.red('Running post run module hooks failed. No modification done to the generated entity.')}`);
                    this.debug('Error:', err);
                    done();
                }
            }
        };
    }

    get install() {
        if (useBlueprint) return;
        return this._install();
    }
};
