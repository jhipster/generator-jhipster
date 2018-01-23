/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const prompts = require('./prompts');
const jhiCore = require('jhipster-core');
const BaseGenerator = require('../generator-base');
const constants = require('../generator-constants');

/* constants used throughout */
const SUPPORTED_VALIDATION_RULES = constants.SUPPORTED_VALIDATION_RULES;
let useBlueprint;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This makes `name` a required argument.
        this.argument('name', {
            type: String,
            required: true,
            description: 'Entity name'
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
            desc: 'Use a suffix to generate AngularJS routes and files, to avoid name clashes',
            type: String,
            defaults: ''
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
            desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false
        });

        this.context = {};
        this.setupEntityOptions(this, this, this.context);
        const blueprint = this.config.get('blueprint');
        useBlueprint = this.composeBlueprint(blueprint, 'entity'); // use global variable since getters dont have access to instance property
    }

    get initializing() {
        if (useBlueprint) return;
        return {
            getConfig() {
                const context = this.context;
                context.useConfigurationFile = false;
                this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
                context.options = this.options;
                context.baseName = this.config.get('baseName');
                context.packageName = this.config.get('packageName');
                context.applicationType = this.config.get('applicationType');
                context.packageFolder = this.config.get('packageFolder');
                context.authenticationType = this.config.get('authenticationType');
                context.cacheProvider = this.config.get('cacheProvider') || this.config.get('hibernateCache') || 'no';
                context.enableHibernateCache = this.config.get('enableHibernateCache') || (this.config.get('hibernateCache') !== undefined && this.config.get('hibernateCache') !== 'no');
                context.websocket = this.config.get('websocket') === 'no' ? false : this.config.get('websocket');
                context.databaseType = this.config.get('databaseType') || this.getDBTypeFromDBValue(this.options.db);
                context.prodDatabaseType = this.config.get('prodDatabaseType') || this.options.db;
                context.devDatabaseType = this.config.get('devDatabaseType') || this.options.db;
                context.searchEngine = this.config.get('searchEngine') === 'no' ? false : this.config.get('searchEngine');
                context.messageBroker = this.config.get('messageBroker') === 'no' ? false : this.config.get('messageBroker');
                context.enableTranslation = this.config.get('enableTranslation');
                context.nativeLanguage = this.config.get('nativeLanguage');
                context.languages = this.config.get('languages');
                context.buildTool = this.config.get('buildTool');
                context.jhiPrefix = this.config.get('jhiPrefix');
                context.jhiPrefixDashed = _.kebabCase(context.jhiPrefix);
                context.jhiTablePrefix = this.getTableName(context.jhiPrefix);
                context.testFrameworks = this.config.get('testFrameworks');
                // backward compatibility on testing frameworks
                if (context.testFrameworks === undefined) {
                    context.testFrameworks = ['gatling'];
                }
                context.protractorTests = context.testFrameworks.includes('protractor');
                context.gatlingTests = context.testFrameworks.includes('gatling');
                context.cucumberTests = context.testFrameworks.includes('cucumber');

                context.clientFramework = this.config.get('clientFramework');
                if (!context.clientFramework) {
                    context.clientFramework = 'angular1';
                }
                context.clientPackageManager = this.config.get('clientPackageManager');
                if (!context.clientPackageManager) {
                    if (context.useYarn) {
                        context.clientPackageManager = 'yarn';
                    } else {
                        context.clientPackageManager = 'npm';
                    }
                }

                context.skipClient = context.applicationType === 'microservice' || this.options['skip-client'] || this.config.get('skipClient');
                context.skipServer = this.options['skip-server'] || this.config.get('skipServer');

                context.angularAppName = this.getAngularAppName(context.baseName);
                context.angularXAppName = this.getAngularXAppName(context.baseName);
                context.jhipsterConfigDirectory = '.jhipster';
                context.mainClass = this.getMainClassName(context.baseName);
                context.microserviceAppName = '';

                context.filename = `${context.jhipsterConfigDirectory}/${context.entityNameCapitalized}.json`;
                if (shelljs.test('-f', context.filename)) {
                    this.log(chalk.green(`\nFound the ${context.filename} configuration file, entity can be automatically generated!\n`));
                    context.useConfigurationFile = true;
                    context.fromPath = context.filename;
                }
            },

            validateDbExistence() {
                const context = this.context;
                if (!context.databaseType || (context.databaseType === 'no'
                    && !((context.authenticationType === 'uaa' || context.authenticationType === 'oauth2')
                        && context.applicationType === 'gateway'))
                ) {
                    if (context.skipServer) {
                        this.error(chalk.red('The entity cannot be generated as the database type is not known! Pass the --db <type> & --prod-db <db> flag in command line'));
                    } else {
                        this.error(chalk.red('The entity cannot be generated as the application does not have a database configured!'));
                    }
                }
            },

            validateEntityName() {
                const entityName = this.context.name;
                if (!(/^([a-zA-Z0-9_]*)$/.test(entityName))) {
                    this.error(chalk.red('The entity name cannot contain special characters'));
                } else if ((/^[0-9].*$/.test(entityName))) {
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
                    this.loadEntityJson();
                }
            },

            validateTableName() {
                const context = this.context;
                const prodDatabaseType = context.prodDatabaseType;
                const entityTableName = context.entityTableName;
                const jhiTablePrefix = context.jhiTablePrefix;
                const instructions = `You can specify a different table name in your JDL file or change it in .jhipster/${context.name}.json file and then run again 'jhipster entity ${context.name}.'`;

                if (!(/^([a-zA-Z0-9_]*)$/.test(entityTableName))) {
                    this.error(chalk.red(`The table name cannot contain special characters.\n${instructions}`));
                } else if (entityTableName === '') {
                    this.error(chalk.red('The table name cannot be empty'));
                } else if (jhiCore.isReservedTableName(entityTableName, prodDatabaseType)) {
                    this.warning(chalk.red(`The table name cannot contain the '${entityTableName.toUpperCase()}' reserved keyword, so it will be prefixed with '${jhiTablePrefix}_'.\n${instructions}`));
                    context.entityTableName = `${jhiTablePrefix}_${entityTableName}`;
                } else if (prodDatabaseType === 'oracle' && entityTableName.length > 26) {
                    this.error(chalk.red(`The table name is too long for Oracle, try a shorter name.\n${instructions}`));
                } else if (prodDatabaseType === 'oracle' && entityTableName.length > 14) {
                    this.warning(`The table name is long for Oracle, long table names can cause issues when used to create constraint names and join table names.\n${instructions}`);
                }
            }
        };
    }

    get prompting() {
        if (useBlueprint) return;
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

    get configuring() {
        if (useBlueprint) return;
        return {
            validateFile() {
                const context = this.context;
                if (!context.useConfigurationFile) {
                    return;
                }
                const entityName = context.name;
                // Validate entity json field content
                context.fields.forEach((field) => {
                    if (_.isUndefined(field.fieldName)) {
                        this.error(chalk.red(`fieldName is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                    }

                    if (_.isUndefined(field.fieldType)) {
                        this.error(chalk.red(`fieldType is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                    }

                    if (!_.isUndefined(field.fieldValidateRules)) {
                        if (!_.isArray(field.fieldValidateRules)) {
                            this.error(chalk.red(`fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                        field.fieldValidateRules.forEach((fieldValidateRule) => {
                            if (!_.includes(SUPPORTED_VALIDATION_RULES, fieldValidateRule)) {
                                this.error(chalk.red(`fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`));
                            }
                        });
                        if (_.includes(field.fieldValidateRules, 'max') && _.isUndefined(field.fieldValidateRulesMax)) {
                            this.error(chalk.red(`fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                        if (_.includes(field.fieldValidateRules, 'min') && _.isUndefined(field.fieldValidateRulesMin)) {
                            this.error(chalk.red(`fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                        if (_.includes(field.fieldValidateRules, 'maxlength') && _.isUndefined(field.fieldValidateRulesMaxlength)) {
                            this.error(chalk.red(`fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                        if (_.includes(field.fieldValidateRules, 'minlength') && _.isUndefined(field.fieldValidateRulesMinlength)) {
                            this.error(chalk.red(`fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                        if (_.includes(field.fieldValidateRules, 'maxbytes') && _.isUndefined(field.fieldValidateRulesMaxbytes)) {
                            this.error(chalk.red(`fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                        if (_.includes(field.fieldValidateRules, 'minbytes') && _.isUndefined(field.fieldValidateRulesMinbytes)) {
                            this.error(chalk.red(`fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                        if (_.includes(field.fieldValidateRules, 'pattern') && _.isUndefined(field.fieldValidateRulesPattern)) {
                            this.error(chalk.red(`fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${JSON.stringify(field, null, 4)}`));
                        }
                    }
                });

                // Validate entity json relationship content
                context.relationships.forEach((relationship) => {
                    if (_.isUndefined(relationship.relationshipName)) {
                        relationship.relationshipName = relationship.otherEntityName;
                        this.warning(`relationshipName is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(relationship, null, 4)}, using ${relationship.otherEntityName} as fallback`);
                    }

                    if (_.isUndefined(relationship.otherEntityName)) {
                        this.error(chalk.red(`otherEntityName is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(relationship, null, 4)}`));
                    }

                    if (_.isUndefined(relationship.otherEntityRelationshipName)
                        && (relationship.relationshipType === 'one-to-many' || (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === false) || (relationship.relationshipType === 'one-to-one'))) {
                        relationship.otherEntityRelationshipName = _.lowerFirst(entityName);
                        this.warning(`otherEntityRelationshipName is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(relationship, null, 4)}, using ${_.lowerFirst(entityName)} as fallback`);
                    }

                    if (_.isUndefined(relationship.otherEntityField)
                        && (relationship.relationshipType === 'many-to-one' || (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) || (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true))) {
                        this.warning(`otherEntityField is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(relationship, null, 4)}, using id as fallback`);
                        relationship.otherEntityField = 'id';
                    }

                    if (_.isUndefined(relationship.relationshipType)) {
                        this.error(chalk.red(`relationshipType is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(relationship, null, 4)}`));
                    }

                    if (_.isUndefined(relationship.ownerSide)
                        && (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')) {
                        this.error(chalk.red(`ownerSide is missing in .jhipster/${entityName}.json for relationship ${JSON.stringify(relationship, null, 4)}`));
                    }
                });

                // Validate root entity json content
                if (_.isUndefined(context.changelogDate)
                    && (context.databaseType === 'sql' || context.databaseType === 'cassandra')) {
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
                    if (['sql', 'mongodb', 'couchbase'].includes(context.databaseType)) {
                        this.warning(`pagination is missing in .jhipster/${entityName}.json, using no as fallback`);
                        context.pagination = 'no';
                    } else {
                        context.pagination = 'no';
                    }
                }
            },

            writeEntityJson() {
                const context = this.context;
                if (context.useConfigurationFile && context.updateEntity === 'regenerate') {
                    return; // do not update if regenerating entity
                }
                // store information in a file for further use.
                if (!context.useConfigurationFile && (['sql', 'cassandra'].includes(context.databaseType))) {
                    context.changelogDate = this.dateFormatForLiquibase();
                }
                this.data = {};
                this.data.fluentMethods = context.fluentMethods;
                this.data.relationships = context.relationships;
                this.data.fields = context.fields;
                this.data.changelogDate = context.changelogDate;
                this.data.dto = context.dto;
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
                    this.data.searchEngine = context.searchEngine;
                }
                if (context.applicationType === 'gateway' && context.useMicroserviceJson) {
                    this.data.microserviceName = context.microserviceName;
                    this.data.searchEngine = context.searchEngine;
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
                context.entityFolderName = context.entityFileName;
                context.entityPluralFileName = entityNamePluralizedAndSpinalCased + context.entityAngularJSSuffix;
                context.entityServiceFileName = context.entityFileName;
                context.entityAngularName = context.entityClass + _.upperFirst(_.camelCase(context.entityAngularJSSuffix));
                context.entityReactName = context.entityClass + _.upperFirst(_.camelCase(this.entityAngularJSSuffix));
                context.entityStateName = _.kebabCase(context.entityAngularName);
                context.entityUrl = context.entityStateName;
                context.entityTranslationKey = context.entityInstance;
                context.entityTranslationKeyMenu = _.camelCase(context.entityStateName);
                context.jhiTablePrefix = this.getTableName(context.jhiPrefix);

                context.fieldsContainInstant = false;
                context.fieldsContainZonedDateTime = false;
                context.fieldsContainLocalDate = false;
                context.fieldsContainBigDecimal = false;
                context.fieldsContainBlob = false;
                context.fieldsContainImageBlob = false;
                context.validation = false;
                context.fieldsContainOwnerManyToMany = false;
                context.fieldsContainNoOwnerOneToOne = false;
                context.fieldsContainOwnerOneToOne = false;
                context.fieldsContainOneToMany = false;
                context.fieldsContainManyToOne = false;
                context.differentTypes = [context.entityClass];
                if (!context.relationships) {
                    context.relationships = [];
                }
                context.differentRelationships = {};

                // Load in-memory data for fields
                context.fields.forEach((field) => {
                    // Migration from JodaTime to Java Time
                    if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
                        field.fieldType = 'Instant';
                    }
                    const fieldType = field.fieldType;

                    const nonEnumType = [
                        'String', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal',
                        'LocalDate', 'Instant', 'ZonedDateTime', 'Boolean', 'byte[]', 'ByteBuffer'
                    ].includes(fieldType);
                    if ((['sql', 'mongodb', 'couchbase'].includes(context.databaseType)) && !nonEnumType) {
                        field.fieldIsEnum = true;
                    } else {
                        field.fieldIsEnum = false;
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
                        field.fieldValidateRulesPatternJava = field.fieldValidateRulesPattern ?
                            field.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"') : field.fieldValidateRulesPattern;
                    }

                    if (_.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1) {
                        field.fieldValidate = true;
                    } else {
                        field.fieldValidate = false;
                    }

                    if (fieldType === 'ZonedDateTime') {
                        context.fieldsContainZonedDateTime = true;
                    } else if (fieldType === 'Instant') {
                        context.fieldsContainInstant = true;
                    } else if (fieldType === 'LocalDate') {
                        context.fieldsContainLocalDate = true;
                    } else if (fieldType === 'BigDecimal') {
                        context.fieldsContainBigDecimal = true;
                    } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
                        context.fieldsContainBlob = true;
                        if (field.fieldTypeBlobContent === 'image') {
                            context.fieldsContainImageBlob = true;
                        }
                    }

                    if (field.fieldValidate) {
                        context.validation = true;
                    }
                });
                // Load in-memory data for relationships
                context.relationships.forEach((relationship) => {
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

                    if (_.isUndefined(relationship.otherEntityRelationshipNamePlural) && (relationship.relationshipType === 'one-to-many' ||
                        (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === false) ||
                        (relationship.relationshipType === 'one-to-one' && relationship.otherEntityName.toLowerCase() !== 'user'))) {
                        relationship.otherEntityRelationshipNamePlural = pluralize(relationship.otherEntityRelationshipName);
                    }

                    if (_.isUndefined(relationship.otherEntityRelationshipNameCapitalized)) {
                        relationship.otherEntityRelationshipNameCapitalized = _.upperFirst(relationship.otherEntityRelationshipName);
                    }

                    if (_.isUndefined(relationship.otherEntityRelationshipNameCapitalizedPlural)) {
                        relationship.otherEntityRelationshipNameCapitalizedPlural = pluralize(_.upperFirst(relationship.otherEntityRelationshipName));
                    }

                    const otherEntityName = relationship.otherEntityName;
                    const otherEntityData = this.getEntityJson(otherEntityName);
                    const jhiTablePrefix = context.jhiTablePrefix;

                    if (context.dto && context.dto === 'mapstruct') {
                        if (otherEntityData && (!otherEntityData.dto || otherEntityData.dto !== 'mapstruct')) {
                            this.warning(chalk.red(`This entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`));
                        }
                    }

                    if (otherEntityName === 'user') {
                        relationship.otherEntityTableName = `${jhiTablePrefix}_user`;
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

                    if (_.isUndefined(relationship.otherEntityNamePlural)) {
                        relationship.otherEntityNamePlural = pluralize(relationship.otherEntityName);
                    }

                    if (_.isUndefined(relationship.otherEntityNameCapitalized)) {
                        relationship.otherEntityNameCapitalized = _.upperFirst(relationship.otherEntityName);
                    }

                    if (_.isUndefined(relationship.otherEntityAngularName)) {
                        if (relationship.otherEntityNameCapitalized !== 'User') {
                            const otherEntityAngularSuffix = otherEntityData ? otherEntityData.angularJSSuffix || '' : '';
                            relationship.otherEntityAngularName = _.upperFirst(relationship.otherEntityName) + _.upperFirst(_.camelCase(otherEntityAngularSuffix));
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
                            relationship.otherEntityModuleName = `${context.angularXAppName + relationship.otherEntityNameCapitalized}Module`;
                            relationship.otherEntityModulePath = _.kebabCase(relationship.otherEntityAngularName);
                        } else {
                            relationship.otherEntityModuleName = `${context.angularXAppName}SharedModule`;
                            relationship.otherEntityModulePath = '../shared';
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
                        relationship.relationshipValidate = relationship.relationshipRequired = context.validation = true;
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
                const insight = this.insight();
                const context = this.context;
                insight.trackWithEvent('generator', 'entity');
                insight.track('entity/fields', context.fields.length);
                insight.track('entity/relationships', context.relationships.length);
                insight.track('entity/pagination', context.pagination);
                insight.track('entity/dto', context.dto);
                insight.track('entity/service', context.service);
                insight.track('entity/fluentMethods', context.fluentMethods);
            }
        };
    }

    get writing() {
        if (useBlueprint) return;
        return {
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

    get install() {
        if (useBlueprint) return;
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
                        this.callHooks('entity', 'post', {
                            entityConfig: context,
                            force: context.options.force
                        }, done);
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
};
