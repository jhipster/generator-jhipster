/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const _ = require('lodash');
const shelljs = require('shelljs');
const pluralize = require('pluralize');
const prompts = require('./prompts');
const jhiCore = require('jhipster-core');
const writeFiles = require('./files').writeFiles;
const BaseGenerator = require('../generator-base');
const constants = require('../generator-constants');

/* constants used throughout */
const SUPPORTED_VALIDATION_RULES = constants.SUPPORTED_VALIDATION_RULES;

const EntityGenerator = generator.extend({});

util.inherits(EntityGenerator, BaseGenerator);

module.exports = EntityGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);

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

        this.name = this.options.name;
        // remove extension if feeding json files
        if (this.name !== undefined) {
            this.name = this.name.replace('.json', '');
        }

        this.regenerate = this.options.regenerate;
        this.fluentMethods = this.options['fluent-methods'];
        this.entityTableName = this.getTableName(this.options['table-name'] || this.name);
        this.entityNameCapitalized = _.upperFirst(this.name);
        this.entityAngularJSSuffix = this.options['angular-suffix'];
        this.isDebugEnabled = this.options.debug;
        if (this.entityAngularJSSuffix && !this.entityAngularJSSuffix.startsWith('-')) {
            this.entityAngularJSSuffix = `-${this.entityAngularJSSuffix}`;
        }
        this.rootDir = this.destinationRoot();
        // enum-specific consts
        this.enums = [];

        this.existingEnum = false;

        this.fieldNamesUnderscored = ['id'];
        // these constiable will hold field and relationship names for question options during update
        this.fieldNameChoices = [];
        this.relNameChoices = [];
    },
    initializing: {

        getConfig() {
            this.useConfigurationFile = false;
            this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
            this.baseName = this.config.get('baseName');
            this.packageName = this.config.get('packageName');
            this.applicationType = this.config.get('applicationType');
            this.packageFolder = this.config.get('packageFolder');
            this.authenticationType = this.config.get('authenticationType');
            this.hibernateCache = this.config.get('hibernateCache');
            this.databaseType = this.config.get('databaseType') || this.getDBTypeFromDBValue(this.options.db);
            this.prodDatabaseType = this.config.get('prodDatabaseType') || this.options.db;
            this.devDatabaseType = this.config.get('devDatabaseType') || this.options.db;
            this.searchEngine = this.config.get('searchEngine') === 'no' ? false : this.config.get('searchEngine');
            this.messageBroker = this.config.get('messageBroker') === 'no' ? false : this.config.get('messageBroker');
            this.enableTranslation = this.config.get('enableTranslation');
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
            this.buildTool = this.config.get('buildTool');
            this.jhiPrefix = this.config.get('jhiPrefix');
            this.testFrameworks = this.config.get('testFrameworks');
            // backward compatibility on testing frameworks
            if (this.testFrameworks === undefined) {
                this.testFrameworks = ['gatling'];
            }
            this.protractorTests = this.testFrameworks.indexOf('protractor') !== -1;
            this.gatlingTests = this.testFrameworks.indexOf('gatling') !== -1;
            this.cucumberTests = this.testFrameworks.indexOf('cucumber') !== -1;

            this.clientFramework = this.config.get('clientFramework');
            if (!this.clientFramework) {
                this.clientFramework = 'angular1';
            }
            this.clientPackageManager = this.config.get('clientPackageManager');
            if (!this.clientPackageManager) {
                if (this.useYarn) {
                    this.clientPackageManager = 'yarn';
                } else {
                    this.clientPackageManager = 'npm';
                }
            }

            this.skipClient = this.applicationType === 'microservice' || this.options['skip-client'] || this.config.get('skipClient');
            this.skipServer = this.options['skip-server'] || this.config.get('skipServer');

            this.angularAppName = this.getAngularAppName();
            this.angularXAppName = this.getAngularXAppName();
            this.jhipsterConfigDirectory = '.jhipster';
            this.mainClass = this.getMainClassName();
            this.microserviceAppName = '';

            this.filename = `${this.jhipsterConfigDirectory}/${this.entityNameCapitalized}.json`;
            if (shelljs.test('-f', this.filename)) {
                this.log(chalk.green(`\nFound the ${this.filename} configuration file, entity can be automatically generated!\n`));
                this.useConfigurationFile = true;
                this.fromPath = this.filename;
            }
        },

        validateDbExistence() {
            if (!this.databaseType || (this.databaseType === 'no' && !(this.authenticationType === 'uaa' && this.applicationType === 'gateway'))) {
                if (this.skipServer) {
                    this.error(chalk.red('The entity cannot be generated as the database type is not known! Pass the --db <type> & --prod-db <db> flag in command line'));
                } else {
                    this.error(chalk.red('The entity cannot be generated as the application does not have a database configured!'));
                }
            }
        },

        validateEntityName() {
            if (!(/^([a-zA-Z0-9_]*)$/.test(this.name))) {
                this.error(chalk.red('The entity name cannot contain special characters'));
            } else if ((/^[0-9].*$/.test(this.name))) {
                this.error(chalk.red('The entity name cannot start with a number'));
            } else if (this.name === '') {
                this.error(chalk.red('The entity name cannot be empty'));
            } else if (this.name.indexOf('Detail', this.name.length - 'Detail'.length) !== -1) {
                this.error(chalk.red('The entity name cannot end with \'Detail\''));
            } else if (!this.skipServer && jhiCore.isReservedClassName(this.name)) {
                this.error(chalk.red('The entity name cannot contain a Java or JHipster reserved keyword'));
            }
        },

        setupconsts() {
            // Specific Entity sub-generator constiables
            if (!this.useConfigurationFile) {
                // no file present, new entity creation
                this.log(`\nThe entity ${this.name} is being created.\n`);
                this.fields = [];
                this.relationships = [];
                this.pagination = 'no';
                this.validation = false;
                this.dto = 'no';
                this.service = 'no';
                this.jpaMetamodelFiltering = false;
            } else {
                // existing entity reading values from file
                this.log(`\nThe entity ${this.name} is being updated.\n`);
                this._loadJson();
            }
        },

        validateTableName() {
            const prodDatabaseType = this.prodDatabaseType;
            const entityTableName = this.entityTableName;
            if (!(/^([a-zA-Z0-9_]*)$/.test(entityTableName))) {
                this.error(chalk.red('The table name cannot contain special characters'));
            } else if (entityTableName === '') {
                this.error(chalk.red('The table name cannot be empty'));
            } else if (jhiCore.isReservedTableName(entityTableName, prodDatabaseType)) {
                this.warning(chalk.red(`The table name cannot contain the '${entityTableName.toUpperCase()}' reserved keyword, so it will be prefixed with 'jhi_'`));
                this.entityTableName = `jhi_${entityTableName}`;
            } else if (prodDatabaseType === 'oracle' && entityTableName.length > 26) {
                this.error(chalk.red('The table name is too long for Oracle, try a shorter name'));
            } else if (prodDatabaseType === 'oracle' && entityTableName.length > 14) {
                this.warning('The table name is long for Oracle, long table names can cause issues when used to create constraint names and join table names');
            }
        }
    },

    /* private Helper methods */
    _loadJson() {
        try {
            this.fileData = this.fs.readJSON(this.fromPath);
        } catch (err) {
            this.debug('Error:', err);
            this.error(chalk.red('\nThe entity configuration file could not be read!\n'));
        }
        this.relationships = this.fileData.relationships || [];
        this.fields = this.fileData.fields || [];
        this.changelogDate = this.fileData.changelogDate;
        this.dto = this.fileData.dto;
        this.service = this.fileData.service;
        this.fluentMethods = this.fileData.fluentMethods;
        this.pagination = this.fileData.pagination;
        this.searchEngine = this.fileData.searchEngine || this.searchEngine;
        this.javadoc = this.fileData.javadoc;
        this.entityTableName = this.fileData.entityTableName;
        this.copyFilteringFlag(this.fileData, this);
        if (_.isUndefined(this.entityTableName)) {
            this.warning(`entityTableName is missing in .jhipster/${this.name}.json, using entity name as fallback`);
            this.entityTableName = this.getTableName(this.name);
        }
        if (jhiCore.isReservedTableName(this.entityTableName, this.prodDatabaseType)) {
            const entityTableName = this.entityTableName;
            this.entityTableName = `jhi_${entityTableName}`;
        }
        this.fields.forEach((field) => {
            this.fieldNamesUnderscored.push(_.snakeCase(field.fieldName));
            this.fieldNameChoices.push({ name: field.fieldName, value: field.fieldName });
        });
        this.relationships.forEach((rel) => {
            this.relNameChoices.push({ name: `${rel.relationshipName}:${rel.relationshipType}`, value: `${rel.relationshipName}:${rel.relationshipType}` });
        });
        if (this.fileData.angularJSSuffix !== undefined) {
            this.entityAngularJSSuffix = this.fileData.angularJSSuffix;
        }
        this.useMicroserviceJson = this.useMicroserviceJson || !_.isUndefined(this.fileData.microserviceName);
        if (this.applicationType === 'gateway' && this.useMicroserviceJson) {
            this.microserviceName = this.fileData.microserviceName;
            if (!this.microserviceName) {
                this.error(chalk.red('Microservice name for the entity is not found. Entity cannot be generated!'));
            }
            this.microserviceAppName = this._getMicroserviceAppName();
            this.skipServer = true;
        }
    },

    _getMicroserviceAppName() {
        return _.camelCase(this.microserviceName, true) + (this.microserviceName.endsWith('App') ? '' : 'App');
    },
    /* end of Helper methods */

    prompting: {
        /* pre entity hook needs to be written here */
        askForMicroserviceJson: prompts.askForMicroserviceJson,
        /* ask question to user if s/he wants to update entity */
        askForUpdate: prompts.askForUpdate,
        askForFields: prompts.askForFields,
        askForFieldsToRemove: prompts.askForFieldsToRemove,
        askForRelationships: prompts.askForRelationships,
        askForRelationsToRemove: prompts.askForRelationsToRemove,
        askForTableName: prompts.askForTableName,
        askForDTO: prompts.askForDTO,
        askForService: prompts.askForService,
        askForFiltering: prompts.askForFiltering,
        askForPagination: prompts.askForPagination
    },

    configuring: {
        validateFile() {
            if (!this.useConfigurationFile) {
                return;
            }
            // Validate entity json field content
            this.fields.forEach((field) => {
                if (_.isUndefined(field.fieldName)) {
                    this.error(chalk.red(`fieldName is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                }

                if (_.isUndefined(field.fieldType)) {
                    this.error(chalk.red(`fieldType is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                }

                if (!_.isUndefined(field.fieldValidateRules)) {
                    if (!_.isArray(field.fieldValidateRules)) {
                        this.error(chalk.red(`fieldValidateRules is not an array in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                    field.fieldValidateRules.forEach((fieldValidateRule) => {
                        if (!_.includes(SUPPORTED_VALIDATION_RULES, fieldValidateRule)) {
                            this.error(chalk.red(`fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`));
                        }
                    });
                    if (_.includes(field.fieldValidateRules, 'max') && _.isUndefined(field.fieldValidateRulesMax)) {
                        this.error(chalk.red(`fieldValidateRulesMax is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                    if (_.includes(field.fieldValidateRules, 'min') && _.isUndefined(field.fieldValidateRulesMin)) {
                        this.error(chalk.red(`fieldValidateRulesMin is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                    if (_.includes(field.fieldValidateRules, 'maxlength') && _.isUndefined(field.fieldValidateRulesMaxlength)) {
                        this.error(chalk.red(`fieldValidateRulesMaxlength is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                    if (_.includes(field.fieldValidateRules, 'minlength') && _.isUndefined(field.fieldValidateRulesMinlength)) {
                        this.error(chalk.red(`fieldValidateRulesMinlength is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                    if (_.includes(field.fieldValidateRules, 'maxbytes') && _.isUndefined(field.fieldValidateRulesMaxbytes)) {
                        this.error(chalk.red(`fieldValidateRulesMaxbytes is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                    if (_.includes(field.fieldValidateRules, 'minbytes') && _.isUndefined(field.fieldValidateRulesMinbytes)) {
                        this.error(chalk.red(`fieldValidateRulesMinbytes is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                    if (_.includes(field.fieldValidateRules, 'pattern') && _.isUndefined(field.fieldValidateRulesPattern)) {
                        this.error(chalk.red(`fieldValidateRulesPattern is missing in .jhipster/${this.name}.json for field ${JSON.stringify(field, null, 4)}`));
                    }
                }
            });

            // Validate entity json relationship content
            this.relationships.forEach((relationship) => {
                if (_.isUndefined(relationship.relationshipName)) {
                    relationship.relationshipName = relationship.otherEntityName;
                    this.warning(`relationshipName is missing in .jhipster/${this.name}.json for relationship ${JSON.stringify(relationship, null, 4)}, using ${relationship.otherEntityName} as fallback`);
                }

                if (_.isUndefined(relationship.otherEntityName)) {
                    this.error(chalk.red(`otherEntityName is missing in .jhipster/${this.name}.json for relationship ${JSON.stringify(relationship, null, 4)}`));
                }

                if (_.isUndefined(relationship.otherEntityRelationshipName)
                    && (relationship.relationshipType === 'one-to-many' || (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === false) || (relationship.relationshipType === 'one-to-one'))) {
                    relationship.otherEntityRelationshipName = _.lowerFirst(this.name);
                    this.warning(`otherEntityRelationshipName is missing in .jhipster/${this.name}.json for relationship ${JSON.stringify(relationship, null, 4)}, using ${_.lowerFirst(this.name)} as fallback`);
                }

                if (_.isUndefined(relationship.otherEntityField)
                    && (relationship.relationshipType === 'many-to-one' || (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) || (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true))) {
                    this.warning(`otherEntityField is missing in .jhipster/${this.name}.json for relationship ${JSON.stringify(relationship, null, 4)}, using id as fallback`);
                    relationship.otherEntityField = 'id';
                }

                if (_.isUndefined(relationship.relationshipType)) {
                    this.error(chalk.red(`relationshipType is missing in .jhipster/${this.name}.json for relationship ${JSON.stringify(relationship, null, 4)}`));
                }

                if (_.isUndefined(relationship.ownerSide)
                    && (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')) {
                    this.error(chalk.red(`ownerSide is missing in .jhipster/${this.name}.json for relationship ${JSON.stringify(relationship, null, 4)}`));
                }
            });

            // Validate root entity json content
            if (_.isUndefined(this.changelogDate)
                && (this.databaseType === 'sql' || this.databaseType === 'cassandra')) {
                const currentDate = this.dateFormatForLiquibase();
                this.warning(`changelogDate is missing in .jhipster/${this.name}.json, using ${currentDate} as fallback`);
                this.changelogDate = currentDate;
            }
            if (_.isUndefined(this.dto)) {
                this.warning(`dto is missing in .jhipster/${this.name}.json, using no as fallback`);
                this.dto = 'no';
            }
            if (_.isUndefined(this.service)) {
                this.warning(`service is missing in .jhipster/${this.name}.json, using no as fallback`);
                this.service = 'no';
            }
            if (_.isUndefined(this.jpaMetamodelFiltering)) {
                this.warning(`jpaMetamodelFiltering is missing in .jhipster/${this.name}.json, using 'no' as fallback`);
                this.jpaMetamodelFiltering = false;
            }
            if (_.isUndefined(this.pagination)) {
                if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                    this.warning(`pagination is missing in .jhipster/${this.name}.json, using no as fallback`);
                    this.pagination = 'no';
                } else {
                    this.pagination = 'no';
                }
            }
        },

        writeEntityJson() {
            if (this.useConfigurationFile && this.updateEntity === 'regenerate') {
                return; // do not update if regenerating entity
            }
            // store information in a file for further use.
            if (!this.useConfigurationFile && (this.databaseType === 'sql' || this.databaseType === 'cassandra')) {
                this.changelogDate = this.dateFormatForLiquibase();
            }
            this.data = {};
            this.data.fluentMethods = this.fluentMethods;
            this.data.relationships = this.relationships;
            this.data.fields = this.fields;
            this.data.changelogDate = this.changelogDate;
            this.data.dto = this.dto;
            this.data.service = this.service;
            this.data.entityTableName = this.entityTableName;
            this.copyFilteringFlag(this, this.data);
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.data.pagination = this.pagination;
            } else {
                this.data.pagination = 'no';
            }
            this.data.javadoc = this.javadoc;
            if (this.entityAngularJSSuffix) {
                this.data.angularJSSuffix = this.entityAngularJSSuffix;
            }
            if (this.applicationType === 'microservice') {
                this.data.microserviceName = this.baseName;
                this.data.searchEngine = this.searchEngine;
            }
            if (this.applicationType === 'gateway' && this.useMicroserviceJson) {
                this.data.microserviceName = this.microserviceName;
                this.data.searchEngine = this.searchEngine;
            }
            this.fs.writeJSON(this.filename, this.data, null, 4);
        },

        loadInMemoryData() {
            const entityNameSpinalCased = _.kebabCase(_.lowerFirst(this.name));
            const entityNamePluralizedAndSpinalCased = _.kebabCase(_.lowerFirst(pluralize(this.name)));

            this.entityClass = this.entityNameCapitalized;
            this.entityClassHumanized = _.startCase(this.entityNameCapitalized);
            this.entityClassPlural = pluralize(this.entityClass);
            this.entityClassPluralHumanized = _.startCase(this.entityClassPlural);
            this.entityInstance = _.lowerFirst(this.name);
            this.entityInstancePlural = pluralize(this.entityInstance);
            this.entityApiUrl = entityNamePluralizedAndSpinalCased;
            this.entityFolderName = entityNameSpinalCased;
            this.entityFileName = _.kebabCase(this.entityNameCapitalized + _.upperFirst(this.entityAngularJSSuffix));
            this.entityPluralFileName = entityNamePluralizedAndSpinalCased + this.entityAngularJSSuffix;
            this.entityServiceFileName = this.entityFileName;
            this.entityAngularName = this.entityClass + _.upperFirst(_.camelCase(this.entityAngularJSSuffix));
            this.entityStateName = _.kebabCase(this.entityAngularName);
            this.entityUrl = this.entityStateName;
            this.entityTranslationKey = this.entityInstance;
            this.entityTranslationKeyMenu = _.camelCase(this.entityStateName);

            this.fieldsContainInstant = false;
            this.fieldsContainZonedDateTime = false;
            this.fieldsContainLocalDate = false;
            this.fieldsContainBigDecimal = false;
            this.fieldsContainBlob = false;
            this.fieldsContainImageBlob = false;
            this.validation = false;
            this.fieldsContainOwnerManyToMany = false;
            this.fieldsContainNoOwnerOneToOne = false;
            this.fieldsContainOwnerOneToOne = false;
            this.fieldsContainOneToMany = false;
            this.fieldsContainManyToOne = false;
            this.differentTypes = [this.entityClass];
            if (!this.relationships) {
                this.relationships = [];
            }
            this.differentRelationships = {};

            // Load in-memory data for fields
            this.fields.forEach((field) => {
                // Migration from JodaTime to Java Time
                if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
                    field.fieldType = 'Instant';
                }
                const fieldType = field.fieldType;

                const nonEnumType = _.includes(['String', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal',
                    'LocalDate', 'Instant', 'ZonedDateTime', 'Boolean', 'byte[]', 'ByteBuffer'], fieldType);
                if ((this.databaseType === 'sql' || this.databaseType === 'mongodb') && !nonEnumType) {
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
                    if (jhiCore.isReservedTableName(fieldNameUnderscored, this.databaseType)) {
                        field.fieldNameAsDatabaseColumn = `jhi_${fieldNameUnderscored}`;
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
                    this.fieldsContainZonedDateTime = true;
                } else if (fieldType === 'Instant') {
                    this.fieldsContainInstant = true;
                } else if (fieldType === 'LocalDate') {
                    this.fieldsContainLocalDate = true;
                } else if (fieldType === 'BigDecimal') {
                    this.fieldsContainBigDecimal = true;
                } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
                    this.fieldsContainBlob = true;
                    if (field.fieldTypeBlobContent === 'image') {
                        this.fieldsContainImageBlob = true;
                    }
                }

                if (field.fieldValidate) {
                    this.validation = true;
                }
            });
            // Load in-memory data for relationships
            this.relationships.forEach((relationship) => {
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

                if (this.dto && this.dto === 'mapstruct') {
                    if (otherEntityData && (!otherEntityData.dto || otherEntityData.dto !== 'mapstruct')) {
                        this.warning(chalk.red(`This entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`));
                    }
                }

                if (otherEntityName === 'user') {
                    relationship.otherEntityTableName = 'jhi_user';
                } else {
                    relationship.otherEntityTableName = otherEntityData ? otherEntityData.entityTableName : null;
                    if (!relationship.otherEntityTableName) {
                        relationship.otherEntityTableName = this.getTableName(otherEntityName);
                    }
                    if (jhiCore.isReservedTableName(relationship.otherEntityTableName, this.prodDatabaseType)) {
                        const otherEntityTableName = relationship.otherEntityTableName;
                        relationship.otherEntityTableName = `jhi_${otherEntityTableName}`;
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
                        relationship.otherEntityModuleName = `${this.angularXAppName + relationship.otherEntityNameCapitalized}Module`;
                        relationship.otherEntityModulePath = _.kebabCase(_.lowerFirst(relationship.otherEntityName));
                    } else {
                        relationship.otherEntityModuleName = `${this.angularXAppName}SharedModule`;
                        relationship.otherEntityModulePath = '../shared';
                    }
                }
                // Load in-memory data for root
                if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide) {
                    this.fieldsContainOwnerManyToMany = true;
                } else if (relationship.relationshipType === 'one-to-one' && !relationship.ownerSide) {
                    this.fieldsContainNoOwnerOneToOne = true;
                } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide) {
                    this.fieldsContainOwnerOneToOne = true;
                } else if (relationship.relationshipType === 'one-to-many') {
                    this.fieldsContainOneToMany = true;
                } else if (relationship.relationshipType === 'many-to-one') {
                    this.fieldsContainManyToOne = true;
                }

                if (relationship.relationshipValidateRules && relationship.relationshipValidateRules.indexOf('required') !== -1) {
                    relationship.relationshipValidate = relationship.relationshipRequired = this.validation = true;
                }

                const entityType = relationship.otherEntityNameCapitalized;
                if (this.differentTypes.indexOf(entityType) === -1) {
                    this.differentTypes.push(entityType);
                }
                if (!this.differentRelationships[entityType]) {
                    this.differentRelationships[entityType] = [];
                }
                this.differentRelationships[entityType].push(relationship);
            });

            if (this.databaseType === 'cassandra' || this.databaseType === 'mongodb') {
                this.pkType = 'String';
            } else {
                this.pkType = 'Long';
            }
        },

        insight() {
            // track insights
            const insight = this.insight();

            insight.trackWithEvent('generator', 'entity');
            insight.track('entity/fields', this.fields.length);
            insight.track('entity/relationships', this.relationships.length);
            insight.track('entity/pagination', this.pagination);
            insight.track('entity/dto', this.dto);
            insight.track('entity/service', this.service);
            insight.track('entity/fluentMethods', this.fluentMethods);
        }
    },

    writing: writeFiles(),

    install: {
        afterRunHook() {
            const done = this.async();
            try {
                const modules = this.getModuleHooks();
                if (modules.length > 0) {
                    this.log(`\n${chalk.bold.green('Running post run module hooks\n')}`);
                    // form the data to be passed to modules
                    const entityConfig = {
                        jhipsterConfigDirectory: this.jhipsterConfigDirectory,
                        filename: this.filename,
                        data: this.data || this.fileData,
                        useConfigurationFile: this.useConfigurationFile,
                        fieldsContainOwnerManyToMany: this.fieldsContainOwnerManyToMany,
                        fieldsContainNoOwnerOneToOne: this.fieldsContainNoOwnerOneToOne,
                        fieldsContainOwnerOneToOne: this.fieldsContainOwnerOneToOne,
                        fieldsContainOneToMany: this.fieldsContainOneToMany,
                        fieldsContainInstant: this.fieldsContainInstant,
                        fieldsContainZonedDateTime: this.fieldsContainZonedDateTime,
                        fieldsContainLocalDate: this.fieldsContainLocalDate,
                        fieldsContainBigDecimal: this.fieldsContainBigDecimal,
                        fieldsContainBlob: this.fieldsContainBlob,
                        fieldsContainImageBlob: this.fieldsContainImageBlob,
                        jpaMetamodelFiltering: this.jpaMetamodelFiltering,
                        pkType: this.pkType,
                        entityApiUrl: this.entityApiUrl,
                        entityClass: this.entityClass,
                        entityTableName: this.entityTableName,
                        entityInstance: this.entityInstance,
                        entityFolderName: this.entityFolderName,
                        entityFileName: this.entityFileName,
                        entityServiceFileName: this.entityServiceFileName,
                        entityStateName: this.entityStateName,
                        entityUrl: this.entityUrl,
                        entityTranslationKey: this.entityTranslationKey
                    };
                    // run through all post entity creation module hooks
                    this.callHooks('entity', 'post', {
                        entityConfig,
                        force: this.options.force
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
    },

    end() {
        if (!this.options['skip-install'] && !this.skipClient) {
            if (this.clientFramework === 'angular1') {
                this.injectJsFilesToIndex();
            } else {
                this.rebuildClient();
            }
        }
        this.log(chalk.bold.green('Entity generation completed'));
    }
});
