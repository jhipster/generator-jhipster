'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    shelljs = require('shelljs'),
    pluralize = require('pluralize'),
    prompts = require('./prompts'),
    jhiCore = require('jhipster-core'),
    scriptBase = require('../generator-base');

/* constants used througout */
const constants = require('../generator-constants'),
    INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX,
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    ANGULAR_DIR = constants.ANGULAR_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR,
    TEST_DIR = constants.TEST_DIR,
    SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR,
    SUPPORTED_VALIDATION_RULES = constants.SUPPORTED_VALIDATION_RULES;


var EntityGenerator = generators.Base.extend({});

util.inherits(EntityGenerator, scriptBase);

module.exports = EntityGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        // This makes `name` a required argument.
        this.argument('name', {
            type: String,
            required: true,
            description: 'Entity name'
        });
        // remove extention if feeding json files
        if (this.name !== undefined) {
            this.name = this.name.replace('.json', '');
        }

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

        this.regenerate = this.options['regenerate'];
        this.fluentMethods = this.options['fluent-methods'];
        this.entityTableName = this.getTableName(this.options['table-name'] || this.name);
        this.entityNameCapitalized = _.upperFirst(this.name);
        this.entityAngularJSSuffix = this.options['angular-suffix'];
        this.skipServer = this.config.get('skipServer') || this.options['skip-server'];
        if (this.entityAngularJSSuffix && !this.entityAngularJSSuffix.startsWith('-')){
            this.entityAngularJSSuffix = '-' + this.entityAngularJSSuffix;
        }
        this.rootDir = this.destinationRoot();
        // enum-specific vars
        this.enums = [];

        this.existingEnum = false;

        this.fieldNamesUnderscored = ['id'];
        // these variable will hold field and relationship names for question options during update
        this.fieldNameChoices = [];
        this.relNameChoices = [];
    },
    initializing: {
        getConfig: function (args) {
            this.useConfigurationFile = false;
            this.env.options.appPath = this.config.get('appPath') || CLIENT_MAIN_SRC_DIR;
            this.baseName = this.config.get('baseName');
            this.packageName = this.config.get('packageName');
            this.applicationType = this.config.get('applicationType');
            this.packageFolder = this.config.get('packageFolder');
            this.authenticationType = this.config.get('authenticationType');
            this.hibernateCache = this.config.get('hibernateCache');
            this.databaseType = this.config.get('databaseType');
            this.prodDatabaseType = this.config.get('prodDatabaseType');
            this.searchEngine = this.config.get('searchEngine');
            this.enableTranslation = this.config.get('enableTranslation');
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
            this.buildTool = this.config.get('buildTool');
            this.testFrameworks = this.config.get('testFrameworks');
            // backward compatibility on testing frameworks
            if (this.testFrameworks === undefined) {
                this.testFrameworks = ['gatling'];
            }

            this.skipClient = this.applicationType === 'microservice' || this.config.get('skipClient') || this.options['skip-client'];

            this.angularAppName = this.getAngularAppName();
            this.jhipsterConfigDirectory = '.jhipster';
            this.mainClass = this.getMainClassName();

            this.filename = this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json';
            if (shelljs.test('-f', this.filename)) {
                this.log(chalk.green(`\nFound the ${ this.filename } configuration file, entity can be automatically generated!\n`));
                this.useConfigurationFile = true;
                this.fromPath = this.filename;
            }
        },

        validateDbExistence: function () {
            if(this.databaseType === 'no') {
                this.error(chalk.red('The entity cannot be generated as the application does not have a database configured!'));
            }
        },

        validateEntityName: function () {
            if (!(/^([a-zA-Z0-9_]*)$/.test(this.name))) {
                this.error(chalk.red('The entity name cannot contain special characters'));
            } else if (this.name === '') {
                this.error(chalk.red('The entity name cannot be empty'));
            } else if (this.name.indexOf('Detail', this.name.length - 'Detail'.length) !== -1) {
                this.error(chalk.red('The entity name cannot end with \'Detail\''));
            } else if (jhiCore.isReservedClassName(this.name)) {
                this.error(chalk.red('The entity name cannot contain a Java or JHipster reserved keyword'));
            }
        },

        validateTableName: function () {
            var prodDatabaseType = this.prodDatabaseType;
            if (!(/^([a-zA-Z0-9_]*)$/.test(this.entityTableName))) {
                this.error(chalk.red('The table name cannot contain special characters'));
            } else if (this.entityTableName === '') {
                this.error(chalk.red('The table name cannot be empty'));
            } else if (jhiCore.isReservedTableName(this.entityTableName, prodDatabaseType)) {
                this.error(chalk.red(`The table name cannot contain a ${prodDatabaseType.toUpperCase()} reserved keyword`));
            } else if (prodDatabaseType === 'oracle' && this.entityTableName.length > 26) {
                this.error(chalk.red('The table name is too long for Oracle, try a shorter name'));
            } else if (prodDatabaseType === 'oracle' && this.entityTableName.length > 14) {
                this.warning('The table name is long for Oracle, long table names can cause issues when used to create constraint names and join table names');
            }

        },

        setupVars: function () {
            // Specific Entity sub-generator variables
            if (!this.useConfigurationFile) {
                //no file present, new entity creation
                this.log(`\nThe entity ${ this.name } is being created.\n`);
                this.fields = [];
                this.relationships = [];
                this.pagination = 'no';
                this.validation = false;
                this.dto = 'no';
                this.service = 'no';
            } else {
                //existing entity reading values from file
                this.log(`\nThe entity ${ this.name } is being updated.\n`);
                this._loadJson();
            }
        }
    },

    /* private Helper methods */
    _loadJson: function () {
        try {
            this.fileData = this.fs.readJSON(this.fromPath);
        } catch (err) {
            this.error(chalk.red('\nThe entity configuration file could not be read!\n'));
        }
        this.relationships = this.fileData.relationships;
        this.fields = this.fileData.fields;
        this.changelogDate = this.fileData.changelogDate;
        this.dto = this.fileData.dto;
        this.service = this.fileData.service;
        this.fluentMethods = this.fileData.fluentMethods;
        this.pagination = this.fileData.pagination;
        this.javadoc = this.fileData.javadoc;
        this.entityTableName = this.fileData.entityTableName;
        if (_.isUndefined(this.entityTableName)) {
            this.warning(`entityTableName is missing in .jhipster/${ this.name }.json, using entity name as fallback`);
            this.entityTableName = this.getTableName(this.name);
        }
        this.fields && this.fields.forEach(function (field) {
            this.fieldNamesUnderscored.push(_.snakeCase(field.fieldName));
            this.fieldNameChoices.push({name: field.fieldName, value: field.fieldName});
        }, this);
        this.relationships && this.relationships.forEach(function (rel) {
            this.relNameChoices.push({name: rel.relationshipName + ':' + rel.relationshipType, value: rel.relationshipName + ':' + rel.relationshipType});
        }, this);
        if (this.fileData.angularJSSuffix !== undefined){
            this.entityAngularJSSuffix = this.fileData.angularJSSuffix;
        }
        this.useMicroserviceJson = this.useMicroserviceJson || !_.isUndefined(this.fileData.microserviceName);
        if (this.applicationType === 'gateway' && this.useMicroserviceJson){
            this.microserviceName = this.fileData.microserviceName;
            if (!this.microserviceName) {
                this.error(chalk.red('Microservice name for the entity is not found. Entity cannot be generated!'));
            }
            this.skipServer = true;
            this.searchEngine = this.fileData.searchEngine || this.searchEngine;
        }
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
        askForPagination: prompts.askForPagination
    },

    configuring : {
        validateFile: function() {
            if (!this.useConfigurationFile) {
                return;
            }
            // Validate entity json field content
            for (var idx in this.fields) {
                var field = this.fields[idx];
                if (_.isUndefined(field.fieldName)) {
                    this.error(chalk.red(`fieldName is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                }

                if (_.isUndefined(field.fieldType)) {
                    this.error(chalk.red(`fieldType is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                }

                if (!_.isUndefined(field.fieldValidateRules)) {
                    if (!_.isArray(field.fieldValidateRules)) {
                        this.error(chalk.red(`fieldValidateRules is not an array in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                    for (var idxRules in field.fieldValidateRules) {
                        var fieldValidateRule = field.fieldValidateRules[idxRules];
                        if (!_.includes(SUPPORTED_VALIDATION_RULES, fieldValidateRule)) {
                            this.error(chalk.red(`fieldValidateRules contains unknown validation rule ${ fieldValidateRule } in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) } [supported validation rules ${ SUPPORTED_VALIDATION_RULES }]`));
                        }
                    }
                    if (_.includes(field.fieldValidateRules, 'max') && _.isUndefined(field.fieldValidateRulesMax)) {
                        this.error(chalk.red(`fieldValidateRulesMax is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                    if (_.includes(field.fieldValidateRules, 'min') && _.isUndefined(field.fieldValidateRulesMin)) {
                        this.error(chalk.red(`fieldValidateRulesMin is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                    if (_.includes(field.fieldValidateRules, 'maxlength') && _.isUndefined(field.fieldValidateRulesMaxlength)) {
                        this.error(chalk.red(`fieldValidateRulesMaxlength is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                    if (_.includes(field.fieldValidateRules, 'minlength') && _.isUndefined(field.fieldValidateRulesMinlength)) {
                        this.error(chalk.red(`fieldValidateRulesMinlength is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                    if (_.includes(field.fieldValidateRules, 'maxbytes') && _.isUndefined(field.fieldValidateRulesMaxbytes)) {
                        this.error(chalk.red(`fieldValidateRulesMaxbytes is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                    if (_.includes(field.fieldValidateRules, 'minbytes') && _.isUndefined(field.fieldValidateRulesMinbytes)) {
                        this.error(chalk.red(`fieldValidateRulesMinbytes is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                    if (_.includes(field.fieldValidateRules, 'pattern') && _.isUndefined(field.fieldValidateRulesPattern)) {
                        this.error(chalk.red(`fieldValidateRulesPattern is missing in .jhipster/${ this.name }.json for field ${ JSON.stringify(field, null, 4) }`));
                    }
                }
            }

            // Validate entity json relationship content
            for (idx in this.relationships) {
                var relationship = this.relationships[idx];
                if (_.isUndefined(relationship.relationshipName)) {
                    relationship.relationshipName = relationship.otherEntityName;
                    this.warning(`relationshipName is missing in .jhipster/${ this.name }.json for relationship ${ JSON.stringify(relationship, null, 4) }, using ${ relationship.otherEntityName } as fallback`);
                }

                if (_.isUndefined(relationship.otherEntityName)) {
                    this.error(chalk.red(`otherEntityName is missing in .jhipster/${ this.name }.json for relationship ${ JSON.stringify(relationship, null, 4) }`));
                }

                if (_.isUndefined(relationship.otherEntityRelationshipName)
                    && (relationship.relationshipType === 'one-to-many' || (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === false) || (relationship.relationshipType === 'one-to-one'))) {
                    relationship.otherEntityRelationshipName = _.lowerFirst(this.name);
                    this.warning(`otherEntityRelationshipName is missing in .jhipster/${ this.name }.json for relationship ${ JSON.stringify(relationship, null, 4) }, using ${ _.lowerFirst(this.name) } as fallback`);
                }

                if (_.isUndefined(relationship.otherEntityField)
                    && (relationship.relationshipType === 'many-to-one' || (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) || (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true))) {
                    this.warning(`otherEntityField is missing in .jhipster/${ this.name }.json for relationship ${ JSON.stringify(relationship, null, 4) }, using id as fallback`);
                    relationship.otherEntityField = 'id';
                }

                if (_.isUndefined(relationship.relationshipType)) {
                    this.error(chalk.red(`relationshipType is missing in .jhipster/${ this.name }.json for relationship ${ JSON.stringify(relationship, null, 4) }`));
                }

                if (_.isUndefined(relationship.ownerSide)
                    && (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')) {
                    this.error(chalk.red(`ownerSide is missing in .jhipster/${ this.name }.json for relationship ${ JSON.stringify(relationship, null, 4) }`));
                }
            }

            // Validate root entity json content
            if (_.isUndefined(this.changelogDate)
                && (this.databaseType === 'sql' || this.databaseType === 'cassandra')) {
                var currentDate = this.dateFormatForLiquibase();
                this.warning(`hangelogDate is missing in .jhipster/${ this.name }.json, using ${ currentDate } as fallback`);
                this.changelogDate = currentDate;
            }
            if (_.isUndefined(this.dto)) {
                this.warning(`dto is missing in .jhipster/${ this.name }.json, using no as fallback`);
                this.dto = 'no';
            }
            if (_.isUndefined(this.service)) {
                this.warning(`service is missing in .jhipster/${ this.name }.json, using no as fallback`);
                this.service = 'no';
            }
            if (_.isUndefined(this.pagination)) {
                if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                    this.warning(`pagination is missing in .jhipster/${ this.name }.json, using no as fallback`);
                    this.pagination = 'no';
                } else {
                    this.pagination = 'no';
                }
            }
        },

        writeEntityJson: function () {
            if (this.useConfigurationFile && this.updateEntity === 'regenerate') {
                return; //do not update if regenerating entity
            }
            // store informations in a file for further use.
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
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.data.pagination = this.pagination;
            } else {
                this.data.pagination = 'no';
            }
            this.data.javadoc = this.javadoc;
            if (this.entityAngularJSSuffix) {
                this.data.angularJSSuffix = this.entityAngularJSSuffix;
            }
            if (this.applicationType === 'microservice'){
                this.data.microserviceName = this.baseName;
                this.data.searchEngine = this.searchEngine;
            }
            if (this.applicationType === 'gateway' && this.useMicroserviceJson){
                this.data.microserviceName = this.microserviceName;
                this.data.searchEngine = this.searchEngine;
            }
            this.fs.writeJSON(this.filename, this.data, null, 4);
        },

        loadInMemoryData: function () {
            var entityNameSpinalCased = _.kebabCase(_.lowerFirst(this.name));
            var entityNamePluralizedAndSpinalCased = _.kebabCase(_.lowerFirst(pluralize(this.name)));

            this.entityClass = this.entityNameCapitalized;
            this.entityClassHumanized = _.startCase(this.entityNameCapitalized);
            this.entityClassPlural = pluralize(this.entityClass);
            this.entityClassPluralHumanized = _.startCase(this.entityClassPlural);
            this.entityInstance = _.lowerFirst(this.name);
            this.entityInstancePlural = pluralize(this.entityInstance);
            this.entityApiUrl = entityNamePluralizedAndSpinalCased;
            this.entityFolderName = entityNameSpinalCased;
            this.entityFileName = entityNameSpinalCased + this.entityAngularJSSuffix;
            this.entityPluralFileName = entityNamePluralizedAndSpinalCased + this.entityAngularJSSuffix;
            this.entityServiceFileName = entityNameSpinalCased;
            this.entityAngularJSName = this.entityClass + _.upperFirst(_.camelCase(this.entityAngularJSSuffix));
            this.entityStateName = entityNameSpinalCased + this.entityAngularJSSuffix;
            this.entityUrl = entityNameSpinalCased + this.entityAngularJSSuffix;
            this.entityTranslationKey = this.entityInstance;
            this.entityTranslationKeyMenu = _.camelCase(this.entityStateName);

            this.fieldsContainZonedDateTime = false;
            this.fieldsContainLocalDate = false;
            this.fieldsContainBigDecimal = false;
            this.fieldsContainBlob = false;
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

            // Load in-memory data for fields
            this.fields && this.fields.forEach( function (field) {
                // Migration from JodaTime to Java Time
                if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
                    field.fieldType = 'ZonedDateTime';
                }
                var fieldType = field.fieldType;

                var nonEnumType = _.includes(['String', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal',
                    'LocalDate', 'ZonedDateTime', 'Boolean', 'byte[]', 'ByteBuffer'], fieldType);
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

                if (_.isUndefined(field.fieldNameHumanized)) {
                    field.fieldNameHumanized = _.startCase(field.fieldName);
                }

                if (_.isUndefined(field.fieldInJavaBeanMethod)) {
                    // Handle the specific case when the second letter is capitalized
                    // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
                    if (field.fieldName.length > 1) {
                        var firstLetter = field.fieldName.charAt(0);
                        var secondLetter = field.fieldName.charAt(1);
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
                        field.fieldValidateRulesPattern.replace(/\\/g, '\\\\') : field.fieldValidateRulesPattern;
                }

                if (_.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1) {
                    field.fieldValidate = true;
                } else {
                    field.fieldValidate = false;
                }

                if (fieldType === 'ZonedDateTime') {
                    this.fieldsContainZonedDateTime = true;
                } else if (fieldType === 'LocalDate') {
                    this.fieldsContainLocalDate = true;
                } else if (fieldType === 'BigDecimal') {
                    this.fieldsContainBigDecimal = true;
                } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
                    this.fieldsContainBlob = true;
                }

                if (field.fieldValidate) {
                    this.validation = true;
                }
            }, this);

            // Load in-memory data for relationships
            this.relationships && this.relationships.forEach( function (relationship) {
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

                if (_.isUndefined(relationship.otherEntityRelationshipNamePlural) && (relationship.relationshipType === 'one-to-many' || (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === false) || (relationship.relationshipType === 'one-to-one' && relationship.otherEntityName.toLowerCase() !== 'user'))) {
                    relationship.otherEntityRelationshipNamePlural = pluralize(relationship.otherEntityRelationshipName);
                }

                if (_.isUndefined(relationship.otherEntityRelationshipNameCapitalized)) {
                    relationship.otherEntityRelationshipNameCapitalized = _.upperFirst(relationship.otherEntityRelationshipName);
                }

                if (_.isUndefined(relationship.otherEntityRelationshipNameCapitalizedPlural)) {
                    relationship.otherEntityRelationshipNameCapitalizedPlural = pluralize(_.upperFirst(relationship.otherEntityRelationshipName));
                }

                if (_.isUndefined(relationship.otherEntityNamePlural)) {
                    relationship.otherEntityNamePlural = pluralize(relationship.otherEntityName);
                }

                if (_.isUndefined(relationship.otherEntityNameCapitalized)) {
                    relationship.otherEntityNameCapitalized = _.upperFirst(relationship.otherEntityName);
                }

                if (_.isUndefined(relationship.otherEntityNameCapitalizedPlural)) {
                    relationship.otherEntityNameCapitalizedPlural = pluralize(_.upperFirst(relationship.otherEntityName));
                }

                if (_.isUndefined(relationship.otherEntityFieldCapitalized)) {
                    relationship.otherEntityFieldCapitalized = _.upperFirst(relationship.otherEntityField);
                }

                if (_.isUndefined(relationship.otherEntityStateName)) {
                    relationship.otherEntityStateName = _.trim(_.kebabCase(relationship.otherEntityName), '-') + this.entityAngularJSSuffix;
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

                var entityType = relationship.otherEntityNameCapitalized;
                if (this.differentTypes.indexOf(entityType) === -1) {
                    this.differentTypes.push(entityType);
                }
            }, this);

            if (this.databaseType === 'cassandra' || this.databaseType === 'mongodb') {
                this.pkType = 'String';
            } else {
                this.pkType = 'Long';
            }
        },

        insight: function () {
            // track insights
            var insight = this.insight();

            insight.trackWithEvent('generator', 'entity');
            insight.track('entity/fields', this.fields.length);
            insight.track('entity/relationships', this.relationships.length);
            insight.track('entity/pagination', this.pagination);
            insight.track('entity/dto', this.dto);
            insight.track('entity/service', this.service);
            insight.track('entity/fluentMethods', this.fluentMethods);
        }
    },
    writing : {
        saveRemoteEntityPath: function() {
            if (_.isUndefined(this.microservicePath)) {
                return;
            }

            this.copy(this.microservicePath + '/' + this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json', this.destinationPath(this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json'));
        },

        writeEnumFiles: function() {
            for (var idx in this.fields) {
                var field = this.fields[idx];
                if (field.fieldIsEnum === true) {
                    var fieldType = field.fieldType;
                    var enumInfo = new Object();
                    enumInfo.packageName = this.packageName;
                    enumInfo.enumName = fieldType;
                    enumInfo.enumValues = field.fieldValues;
                    field.enumInstance = _.lowerFirst(enumInfo.enumName);
                    enumInfo.enumInstance = field.enumInstance;
                    enumInfo.angularAppName = this.angularAppName;
                    enumInfo.enums = enumInfo.enumValues.replace(/\s/g, '').split(',');
                    if (!this.skipServer) {
                        this.template(SERVER_MAIN_SRC_DIR + 'package/domain/enumeration/_Enum.java',
                            SERVER_MAIN_SRC_DIR + this.packageFolder + '/domain/enumeration/' + fieldType + '.java', enumInfo, {});
                    }

                    // Copy for each
                    if (!this.skipClient && this.enableTranslation) {
                        var languages = this.languages || this.getAllInstalledLanguages();
                        languages.forEach(function (language) {
                            this.copyEnumI18n(language, enumInfo);
                        }, this);
                    }

                }
            }
        },

        writeServerFiles: function() {
            if (this.skipServer) return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_Entity.java',
                SERVER_MAIN_SRC_DIR + this.packageFolder + '/domain/' + this.entityClass + '.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_EntityRepository.java',
                SERVER_MAIN_SRC_DIR + this.packageFolder + '/repository/' + this.entityClass + 'Repository.java', this, {});

            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_EntitySearchRepository.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/repository/search/' + this.entityClass + 'SearchRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_EntityResource.java',
                SERVER_MAIN_SRC_DIR + this.packageFolder + '/web/rest/' + this.entityClass + 'Resource.java', this, {});
            if (this.service === 'serviceImpl') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/_EntityService.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/' + this.entityClass + 'Service.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/impl/_EntityServiceImpl.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/impl/' + this.entityClass + 'ServiceImpl.java', this, {});
            } else if (this.service === 'serviceClass') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/impl/_EntityServiceImpl.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/' + this.entityClass + 'Service.java', this, {});
            }
            if (this.dto === 'mapstruct') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/dto/_EntityDTO.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/dto/' + this.entityClass + 'DTO.java', this, {});

                this.template(SERVER_MAIN_SRC_DIR + 'package/service/mapper/_EntityMapper.java',
                    SERVER_MAIN_SRC_DIR + this.packageFolder + '/service/mapper/' + this.entityClass + 'Mapper.java', this, {});
            }
        },

        writeDbFiles: function() {
            if (this.skipServer) return;

            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/_added_entity.xml',
                    SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml', this, {'interpolate': INTERPOLATE_REGEX});

                if (this.fieldsContainOwnerManyToMany || this.fieldsContainOwnerOneToOne || this.fieldsContainManyToOne) {
                    this.template(SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/_added_entity_constraints.xml',
                        SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_constraints_' + this.entityClass + '.xml', this, {'interpolate': INTERPOLATE_REGEX});
                    this.addConstraintsChangelogToLiquibase(this.changelogDate + '_added_entity_constraints_' + this.entityClass);
                }

                this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
            }
            if (this.databaseType === 'cassandra') {
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/changelog/_added_entity.cql',
                    SERVER_MAIN_RES_DIR + 'config/cql/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.cql', this, {});
            }
        },

        writeClientFiles: function () {
            if (this.skipClient) {
                return;
            }

            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityPluralFileName + '.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management-detail.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management-dialog.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-dialog.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-management-delete-dialog.html', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-delete-dialog.html', this, {}, true);

            this.addEntityToMenu(this.entityStateName, this.enableTranslation);

            this.template(ANGULAR_DIR + 'entities/_entity-management.state.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '.state.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management-dialog.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-dialog.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management-delete-dialog.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-delete-dialog.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'entities/_entity-management-detail.controller.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.controller' + '.js', this, {});
            this.template(ANGULAR_DIR + 'services/_entity.service.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityServiceFileName + '.service' + '.js', this, {});
            if (this.searchEngine === 'elasticsearch') {
                this.template(ANGULAR_DIR + 'services/_entity-search.service.js', ANGULAR_DIR + 'entities/' + this.entityFolderName + '/' + this.entityServiceFileName + '.search.service' + '.js', this, {});
            }

            // Copy for each
            if (this.enableTranslation) {
                var languages = this.languages || this.getAllInstalledLanguages();
                languages.forEach(function (language) {
                    this.copyI18n(language);
                }, this);
            }
        },

        writeClientTestFiles: function () {
            if (this.skipClient) return;

            this.template(CLIENT_TEST_SRC_DIR + 'spec/app/entities/_entity-management-detail.controller.spec.js',
                CLIENT_TEST_SRC_DIR + 'spec/app/entities/' + this.entityFolderName + '/' + this.entityFileName + '-detail.controller.spec.js', this, {});
            // Create Protractor test files
            if (this.testFrameworks.indexOf('protractor') !== -1) {
                this.template(CLIENT_TEST_SRC_DIR + 'e2e/entities/_entity.js', CLIENT_TEST_SRC_DIR + 'e2e/entities/' + this.entityFileName + '.js', this, {});
            }
        },

        writeTestFiles: function() {
            if (this.skipServer) return;

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_EntityResourceIntTest.java',
                    SERVER_TEST_SRC_DIR + this.packageFolder + '/web/rest/' + this.entityClass + 'ResourceIntTest.java', this, {});

            if (this.testFrameworks.indexOf('gatling') !== -1) {
                this.template(TEST_DIR + 'gatling/simulations/_EntityGatlingTest.scala',
                    TEST_DIR + 'gatling/simulations/' + this.entityClass + 'GatlingTest.scala', this, {'interpolate': INTERPOLATE_REGEX});
            }
        }
    },

    install: function () {
        var injectJsFilesToIndex = function () {
            this.log('\n' + chalk.bold.green('Running gulp Inject to add javascript to index\n'));
            this.spawnCommand('gulp', ['inject:app']);
        };
        if (!this.options['skip-install'] && !this.skipClient) {
            injectJsFilesToIndex.call(this);
        }
    },

    end: {
        afterRunHook: function () {
            try {
                var modules = this.getModuleHooks();
                if (modules.length > 0) {
                    this.log('\n' + chalk.bold.green('Running post run module hooks\n'));
                    // form the data to be passed to modules
                    var entityConfig = {
                        jhipsterConfigDirectory: this.jhipsterConfigDirectory,
                        filename: this.filename,
                        data: this.data || this.fileData,
                        useConfigurationFile: this.useConfigurationFile,
                        fieldsContainOwnerManyToMany: this.fieldsContainOwnerManyToMany,
                        fieldsContainNoOwnerOneToOne: this.fieldsContainNoOwnerOneToOne,
                        fieldsContainOwnerOneToOne: this.fieldsContainOwnerOneToOne,
                        fieldsContainOneToMany: this.fieldsContainOneToMany,
                        fieldsContainZonedDateTime: this.fieldsContainZonedDateTime,
                        fieldsContainLocalDate: this.fieldsContainLocalDate,
                        fieldsContainBigDecimal: this.fieldsContainBigDecimal,
                        fieldsContainBlob: this.fieldsContainBlob,
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
                    modules.forEach(function (module) {
                        if (module.hookFor === 'entity' && module.hookType === 'post') {
                            // compose with the modules callback generator
                            try {
                                this.composeWith(module.generatorCallback, {
                                    options: {
                                        entityConfig: entityConfig,
                                        force: this.options['force']
                                    }
                                });
                            } catch (err) {
                                this.log(chalk.red('Could not compose module ') + chalk.bold.yellow(module.npmPackageName) +
                                    chalk.red('. \nMake sure you have installed the module with ') + chalk.bold.yellow('\'npm -g ' + module.npmPackageName + '\''));
                            }
                        }
                    }, this);
                }
            } catch (err) {
                this.log('\n' + chalk.bold.red('Running post run module hooks failed. No modification done to the generated entity.'));
            }
        }
    }
});
