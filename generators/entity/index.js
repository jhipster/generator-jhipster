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
/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const pluralize = require('pluralize');
const path = require('path');
const prompts = require('./prompts');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { isReservedClassName, isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');
const { entityDefaultConfig } = require('../generator-defaults');

/* constants used throughout */
const SUPPORTED_VALIDATION_RULES = constants.SUPPORTED_VALIDATION_RULES;
const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const JHIPSTER_CONFIG_DIR = constants.JHIPSTER_CONFIG_DIR;

const stringify = data => JSON.stringify(data, null, 4);

let useBlueprints;

class EntityGenerator extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This makes `name` a required argument.
        this.argument('name', {
            type: String,
            required: true,
            description: 'Entity name',
        });

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });

        // This method adds support for a `--[no-]regenerate` flag
        this.option('regenerate', {
            desc: 'Regenerate the entity without presenting an option to update it',
            type: Boolean,
            defaults: false,
        });

        this.option('table-name', {
            desc: 'Specify table name that will be used by the entity',
            type: String,
        });

        // This method adds support for a `--[no-]fluent-methods` flag
        this.option('fluent-methods', {
            desc: 'Generate fluent methods in entity beans to allow chained object construction',
            type: Boolean,
        });

        // This adds support for a `--angular-suffix` flag
        this.option('angular-suffix', {
            desc: 'Use a suffix to generate Angular routes and files, to avoid name clashes',
            type: String,
        });

        // This adds support for a `--client-root-folder` flag
        this.option('client-root-folder', {
            desc:
                'Use a root folder name for entities on client side. By default its empty for monoliths and name of the microservice for gateways',
            type: String,
        });

        // This adds support for a `--skip-ui-grouping` flag
        this.option('skip-ui-grouping', {
            desc: 'Disables the UI grouping behaviour for entity client side code',
            type: Boolean,
        });

        // This adds support for a `--skip-server` flag
        this.option('skip-server', {
            desc: 'Skip the server-side code generation',
            type: Boolean,
        });

        // This adds support for a `--skip-client` flag
        this.option('skip-client', {
            desc: 'Skip the client-side code generation',
            type: Boolean,
        });

        // This adds support for a `--skip-db-changelog` flag
        this.option('skip-db-changelog', {
            desc: 'Skip the generation of database changelog (liquibase for sql databases)',
            type: Boolean,
        });

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB option for the application when using skip-server flag',
            type: String,
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false,
        });

        if (this.options.help) {
            return;
        }

        const name = _.upperFirst(this.options.name).replace('.json', '');
        this.entityStorage = this.getEntityConfig(name);
        this.entityConfig = this.entityStorage.createProxy();

        const entityExisted = this.options.entityExisted !== undefined ? this.options.entityExisted : this.entityStorage.existed;

        this.context = {
            name,
            entityExisted,
            haveFieldWithJavadoc: false,
            enums: [],
            existingEnum: false,

            // these variable hold field and relationship names for question options during update
            fieldNameChoices: [],

            fieldsContainDate: false,
            fieldsContainInstant: false,
            fieldsContainUUID: false,
            fieldsContainZonedDateTime: false,
            fieldsContainDuration: false,
            fieldsContainLocalDate: false,
            fieldsContainBigDecimal: false,
            fieldsContainBlob: false,
            fieldsContainImageBlob: false,
            fieldsContainTextBlob: false,
            fieldsContainBlobOrImage: false,
            validation: false,
            fieldsContainOwnerManyToMany: false,
            fieldsContainNoOwnerOneToOne: false,
            fieldsContainOwnerOneToOne: false,
            fieldsContainOneToMany: false,
            fieldsContainManyToOne: false,
            fieldsContainEmbedded: false,
            fieldsIsReactAvField: false,

            blobFields: [],
            differentTypes: [],
            differentRelationships: {},
            i18nToLoad: [],
        };

        this._setupEntityOptions(this, this, this.context);
        this.registerPrettierTransform();

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entity', { entityExisted, arguments: [name] });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            setupRequiredConfigForMicroservicePrompt() {
                this.context.filename = path.join(JHIPSTER_CONFIG_DIR, `${_.upperFirst(this.context.name)}.json`);
            },

            /* Use need microservice path to load the entity file */
            askForMicroserviceJson: prompts.askForMicroserviceJson,

            setupMicroServiceEntity() {
                const context = this.context;

                if (this.jhipsterConfig.applicationType === 'uaa') {
                    this.entityConfig.microserviceName = this.jhipsterConfig.baseName;
                } else if (this.jhipsterConfig.applicationType === 'microservice') {
                    context.skipClient = true;
                    context.microserviceName = this.entityConfig.microserviceName = this.jhipsterConfig.baseName;
                    if (!this.entityConfig.clientRootFolder) {
                        context.clientRootFolder = this.entityConfig.clientRootFolder = this.entityConfig.microserviceName;
                    }
                } else if (this.jhipsterConfig.applicationType === 'gateway') {
                    // If microservicePath is set we are loading the entity from the microservice side.
                    context.useMicroserviceJson = !!this.entityConfig.microservicePath;
                    if (context.useMicroserviceJson) {
                        context.microserviceFileName = this.destinationPath(this.entityConfig.microservicePath, context.filename);
                        context.useConfigurationFile = true;

                        this.log(`\nThe entity ${context.name} is being updated.\n`);
                        try {
                            // We are generating a entity from a microservice.
                            // Load it directly into our entity configuration.
                            this.microserviceConfig = this.fs.readJSON(context.microserviceFileName);
                            this.entityStorage.set(this.microserviceConfig);
                        } catch (err) {
                            this.debug('Error:', err);
                            throw new Error('\nThe entity configuration file could not be read!\n');
                        }
                        if (this.entityConfig.clientRootFolder === undefined) {
                            context.clientRootFolder = this.entityConfig.clientRootFolder = context.skipUiGrouping
                                ? ''
                                : this.entityConfig.microserviceName;
                        }
                    }
                }
            },

            loadSharedConfig() {
                this.loadAppConfig(undefined, this.context);
                this.loadClientConfig(undefined, this.context);
                this.loadTranslationConfig(undefined, this.context);
                // Try to load server config from microservice side, falling back to the app config.
                this.loadServerConfig(_.defaults({}, this.microserviceConfig, this.jhipsterConfig), this.context);
            },

            loadOptions() {
                const context = this.context;
                context.options = this.options;

                if (this.options.db) {
                    context.databaseType = this.getDBTypeFromDBValue(this.options.db);
                    context.prodDatabaseType = this.options.db;
                    context.devDatabaseType = this.options.db;
                }

                context.skipServer = context.skipServer || this.options.skipServer;
                context.skipDbChangelog = context.skipDbChangelog || this.options.skipDbChangelog;
                context.skipClient = context.skipClient || this.options.skipClient;
            },

            loadEntitySpecificOptions() {
                this.context.skipClient = this.context.skipClient || this.entityConfig.skipClient;
                this.context.databaseType = this.entityConfig.databaseType || this.context.databaseType;
            },

            setupSharedConfig() {
                const context = this.context;

                context.protractorTests = context.testFrameworks.includes('protractor');
                context.gatlingTests = context.testFrameworks.includes('gatling');
                context.cucumberTests = context.testFrameworks.includes('cucumber');

                context.jhiPrefixDashed = _.kebabCase(context.jhiPrefix);
                context.jhiTablePrefix = this.getTableName(context.jhiPrefix);
                context.capitalizedBaseName = _.upperFirst(context.baseName);

                context.angularAppName = this.getAngularAppName(context.baseName);
                context.angularXAppName = this.getAngularXAppName(context.baseName);
                context.mainClass = this.getMainClassName(context.baseName);
                context.microserviceAppName = '';

                if (context.entitySuffix === context.dtoSuffix) {
                    throw new Error('The entity cannot be generated as the entity suffix and DTO suffix are equals !');
                }
            },

            validateReactiveCompatibility() {
                if (this.context.reactive && !['mongodb', 'cassandra', 'couchbase', 'neo4j'].includes(this.context.databaseType)) {
                    throw new Error(
                        `The entity generator doesn't support reactive apps with databases of type ${this.context.databaseType} at the moment`
                    );
                }
            },

            validateEntityName() {
                const validation = this._validateEntityName(this.context.name);
                if (validation !== true) {
                    throw new Error(validation);
                }
            },

            bootstrapConfig() {
                const context = this.context;
                const entityName = context.name;
                if (['microservice', 'gateway'].includes(this.jhipsterConfig.applicationType)) {
                    if (this.entityConfig.databaseType === undefined) {
                        this.entityConfig.databaseType = context.databaseType;
                    }
                }
                context.filename = this.destinationPath(context.filename);
                context.configurationFileExists = this.fs.exists(context.filename);
                context.useConfigurationFile = context.configurationFileExists || context.useConfigurationFile;
                if (context.configurationFileExists) {
                    this.log(chalk.green(`\nFound the ${context.filename} configuration file, entity can be automatically generated!\n`));
                }

                // Structure for prompts.
                this.entityStorage.defaults({ fields: [], relationships: [] });

                if (!context.useConfigurationFile) {
                    this.log(`\nThe entity ${entityName} is being created.\n`);
                }
            },
        };
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            /* ask question to user if s/he wants to update entity */
            askForUpdate: prompts.askForUpdate,
            askForFields: prompts.askForFields,
            askForFieldsToRemove: prompts.askForFieldsToRemove,
            askForRelationships: prompts.askForRelationships,
            askForRelationsToRemove: prompts.askForRelationsToRemove,
            askForService: prompts.askForService,
            askForDTO: prompts.askForDTO,
            askForFiltering: prompts.askForFiltering,
            askForReadOnly: prompts.askForReadOnly,
            askForPagination: prompts.askForPagination,
        };
    }

    get prompting() {
        if (useBlueprints) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            configureEntityTable() {
                const context = this.context;
                context.entityTableName = this.entityConfig.entityTableName;
                if (context.entityTableName === undefined) {
                    context.entityTableName = this.getTableName(context.name);
                }
                if (isReservedTableName(context.entityTableName, context.prodDatabaseType) && context.jhiTablePrefix) {
                    context.entityTableName = this.entityConfig.entityTableName = `${context.jhiTablePrefix}_${this.entityConfig.entityTableName}`;
                }
            },

            /*
             * Postpone entity table name prompt to wait entity table to be configured.
             * It should be asked only when entity table name isn't valid.
             */
            askForTableName: prompts.askForTableName,

            configureEntity() {
                const context = this.context;
                const validation = this._validateTableName(context.entityTableName);
                if (validation !== true) {
                    throw new Error(validation);
                }

                if (!['sql', 'mongodb', 'couchbase', 'neo4j'].includes(context.databaseType)) {
                    this.entityConfig.pagination = 'no';
                }

                if (this.entityConfig.jpaMetamodelFiltering && (context.databaseType !== 'sql' || this.entityConfig.service === 'no')) {
                    this.warning('Not compatible with jpaMetamodelFiltering, disabling');
                    this.entityConfig.jpaMetamodelFiltering = false;
                }
            },

            configureFields() {
                const context = this.context;
                const entityName = context.name;
                // Validate entity json field content
                const fields = this.entityConfig.fields;
                fields.forEach(field => {
                    // Migration from JodaTime to Java Time
                    if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
                        field.fieldType = 'Instant';
                    }

                    this._validateField(field);

                    if (field.fieldType === 'ByteBuffer') {
                        this.warning(
                            `Cannot use validation in .jhipster/${entityName}.json for field ${stringify(
                                field
                            )} \nHibernate JPA 2 Metamodel does not work with Bean Validation 2 for LOB fields, so LOB validation is disabled`
                        );
                        field.validation = false;
                        field.fieldValidateRules = [];
                    }
                });
                this.entityConfig.fields = fields;
            },

            configureRelationships() {
                const context = this.context;
                const entityName = context.name;

                // Validate entity json relationship content
                const relationships = this.entityConfig.relationships;
                relationships.forEach(relationship => {
                    this._validateRelationship(relationship);

                    if (relationship.relationshipName === undefined) {
                        relationship.relationshipName = relationship.otherEntityName;
                        this.warning(
                            `relationshipName is missing in .jhipster/${entityName}.json for relationship ${stringify(
                                relationship
                            )}, using ${relationship.otherEntityName} as fallback`
                        );
                    }

                    if (
                        relationship.otherEntityField === undefined &&
                        (relationship.relationshipType === 'many-to-one' ||
                            (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) ||
                            (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true))
                    ) {
                        this.warning(
                            `otherEntityField is missing in .jhipster/${entityName}.json for relationship ${stringify(
                                relationship
                            )}, using id as fallback`
                        );
                        relationship.otherEntityField = 'id';
                    }
                });
                this.entityConfig.relationships = relationships;

                // Validate root entity json content
                if (this.entityConfig.changelogDate === undefined && ['sql', 'cassandra', 'couchbase'].includes(context.databaseType)) {
                    const currentDate = this.dateFormatForLiquibase();
                    this.info(`changelogDate is missing in .jhipster/${entityName}.json, using ${currentDate} as fallback`);
                    context.changelogDate = this.entityConfig.changelogDate = currentDate;
                }
            },
        };
    }

    get configuring() {
        if (useBlueprints) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            loadInMemoryData() {
                const context = this.context;
                const entityName = context.name;
                const entityNamePluralizedAndSpinalCased = _.kebabCase(pluralize(entityName));

                this._loadEntityJson(_.defaults({}, this.entityStorage.getAll(), entityDefaultConfig));

                context.entityClass = context.entityNameCapitalized;
                context.entityClassPlural = pluralize(context.entityClass);

                // Used for i18n
                context.entityClassHumanized = this.entityConfig.entityClassHumanized || _.startCase(context.entityNameCapitalized);
                context.entityClassPluralHumanized = this.entityConfig.entityClassPluralHumanized || _.startCase(context.entityClassPlural);
                // Implement i18n variant ex: 'male', 'female' when applied
                context.entityI18nVariant = this.entityConfig.entityI18nVariant || 'default';

                context.entityInstance = _.lowerFirst(entityName);
                context.entityInstancePlural = pluralize(context.entityInstance);

                context.entityFileName = _.kebabCase(context.entityNameCapitalized + _.upperFirst(context.entityAngularJSSuffix));
                context.entityFolderName = this.getEntityFolderName(context.clientRootFolder, context.entityFileName);
                context.entityModelFileName = context.entityFolderName;
                context.entityParentPathAddition = this.getEntityParentPathAddition(context.clientRootFolder);
                context.entityPluralFileName = entityNamePluralizedAndSpinalCased + context.entityAngularJSSuffix;
                context.entityServiceFileName = context.entityFileName;

                context.entityAngularName = context.entityClass + this.upperFirstCamelCase(context.entityAngularJSSuffix);
                context.entityReactName = context.entityClass + this.upperFirstCamelCase(context.entityAngularJSSuffix);

                context.entityApiUrl = entityNamePluralizedAndSpinalCased;
                context.entityStateName = _.kebabCase(context.entityAngularName);
                context.entityUrl = context.entityStateName;

                context.entityTranslationKey = context.clientRootFolder
                    ? _.camelCase(`${context.clientRootFolder}-${context.entityInstance}`)
                    : context.entityInstance;
                context.entityTranslationKeyMenu = _.camelCase(
                    context.clientRootFolder ? `${context.clientRootFolder}-${context.entityStateName}` : context.entityStateName
                );

                context.reactiveRepositories =
                    context.reactive && ['mongodb', 'cassandra', 'couchbase', 'neo4j'].includes(context.databaseType);

                context.differentTypes.push(context.entityClass);
                context.i18nToLoad.push(context.entityInstance);
                context.i18nKeyPrefix = `${context.angularAppName}.${context.entityTranslationKey}`;

                // Load in-memory data for fields
                context.fields.forEach(field => {
                    const fieldOptions = field.options || {};
                    _.defaults(field, {
                        fieldNameCapitalized: _.upperFirst(field.fieldName),
                        fieldNameUnderscored: _.snakeCase(field.fieldName),
                        fieldNameHumanized: fieldOptions.fieldNameHumanized || _.startCase(field.fieldName),
                    });
                    const fieldType = field.fieldType;

                    field.fieldIsEnum = ![
                        'String',
                        'Integer',
                        'Long',
                        'Float',
                        'Double',
                        'BigDecimal',
                        'LocalDate',
                        'Instant',
                        'ZonedDateTime',
                        'Duration',
                        'UUID',
                        'Boolean',
                        'byte[]',
                        'ByteBuffer',
                    ].includes(fieldType);

                    if (field.fieldNameAsDatabaseColumn === undefined) {
                        const fieldNameUnderscored = _.snakeCase(field.fieldName);
                        const jhiFieldNamePrefix = this.getColumnName(context.jhiPrefix);
                        if (isReservedTableName(fieldNameUnderscored, context.prodDatabaseType)) {
                            if (!jhiFieldNamePrefix) {
                                this.warning(
                                    `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`
                                );
                                field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
                            } else {
                                field.fieldNameAsDatabaseColumn = `${jhiFieldNamePrefix}_${fieldNameUnderscored}`;
                            }
                        } else {
                            field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
                        }
                    }

                    if (field.fieldInJavaBeanMethod === undefined) {
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

                    if (field.fieldValidateRulesPatternJava === undefined) {
                        field.fieldValidateRulesPatternJava = field.fieldValidateRulesPattern
                            ? field.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
                            : field.fieldValidateRulesPattern;
                    }

                    if (field.fieldValidateRulesPatternAngular === undefined) {
                        field.fieldValidateRulesPatternAngular = field.fieldValidateRulesPattern
                            ? field.fieldValidateRulesPattern.replace(/"/g, '&#34;')
                            : field.fieldValidateRulesPattern;
                    }

                    if (field.fieldValidateRulesPatternReact === undefined) {
                        field.fieldValidateRulesPatternReact = field.fieldValidateRulesPattern
                            ? field.fieldValidateRulesPattern.replace(/'/g, "\\'")
                            : field.fieldValidateRulesPattern;
                    }

                    field.fieldValidate = Array.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;

                    if (!['Instant', 'ZonedDateTime', 'Boolean'].includes(fieldType)) {
                        context.fieldsIsReactAvField = true;
                    }

                    if (field.javadoc) {
                        context.haveFieldWithJavadoc = true;
                    }

                    if (field.fieldIsEnum === true) {
                        context.i18nToLoad.push(field.enumInstance);
                    }

                    if (fieldType === 'ZonedDateTime') {
                        context.fieldsContainZonedDateTime = true;
                        context.fieldsContainDate = true;
                    } else if (fieldType === 'Instant') {
                        context.fieldsContainInstant = true;
                        context.fieldsContainDate = true;
                    } else if (fieldType === 'Duration') {
                        context.fieldsContainDuration = true;
                    } else if (fieldType === 'LocalDate') {
                        context.fieldsContainLocalDate = true;
                        context.fieldsContainDate = true;
                    } else if (fieldType === 'BigDecimal') {
                        context.fieldsContainBigDecimal = true;
                    } else if (fieldType === 'UUID') {
                        context.fieldsContainUUID = true;
                    } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
                        context.blobFields.push(field);
                        context.fieldsContainBlob = true;
                        if (field.fieldTypeBlobContent === 'image') {
                            context.fieldsContainImageBlob = true;
                        }
                        if (field.fieldTypeBlobContent !== 'text') {
                            context.fieldsContainBlobOrImage = true;
                        } else {
                            context.fieldsContainTextBlob = true;
                        }
                    }

                    if (field.fieldValidate) {
                        context.validation = true;
                    }
                });

                let hasUserField = false;
                // Load in-memory data for relationships
                context.relationships.forEach(relationship => {
                    const relationshipOptions = relationship.options || {};
                    const otherEntityName = relationship.otherEntityName;
                    const otherEntityData = this._getEntityJson(otherEntityName) || {};
                    const jhiTablePrefix = context.jhiTablePrefix;

                    relationship.otherEntityIsEmbedded = otherEntityData.embedded;
                    if (otherEntityData.microserviceName && !otherEntityData.clientRootFolder) {
                        otherEntityData.clientRootFolder = otherEntityData.microserviceName;
                    }

                    if (this.isBuiltInUserEntity(otherEntityName)) {
                        hasUserField = true;
                    }

                    relationship.otherEntityPrimaryKeyType =
                        this.isBuiltInUserEntity(otherEntityName) && context.authenticationType === 'oauth2'
                            ? 'String'
                            : this.getPkType(context.databaseType);

                    // Look for fields at the other other side of the relationship
                    if (otherEntityData.relationships) {
                        let otherRelationship;
                        if (relationship.relationshipType === 'many-to-one' || !relationship.ownerSide) {
                            otherRelationship = otherEntityData.relationships.find(otherSideRelationship => {
                                if (_.upperFirst(otherSideRelationship.otherEntityName) !== entityName) {
                                    return false;
                                }
                                if (!otherSideRelationship.otherEntityRelationshipName) {
                                    return false;
                                }
                                return otherSideRelationship.otherEntityRelationshipName === relationship.relationshipName;
                            });
                        } else {
                            otherRelationship = otherEntityData.relationships.find(otherSideRelationship => {
                                if (_.upperFirst(otherSideRelationship.otherEntityName) !== entityName) {
                                    return false;
                                }
                                if (!relationship.otherEntityRelationshipName) {
                                    return false;
                                }
                                return relationship.otherEntityRelationshipName === otherSideRelationship.relationshipName;
                            });
                        }
                        if (otherRelationship) {
                            if (
                                relationship.otherEntityRelationshipName &&
                                relationship.otherEntityRelationshipName !== otherRelationship.relationshipName
                            ) {
                                throw new Error(
                                    `Relationship name is not synchronized ${stringify(relationship)} with ${stringify(otherRelationship)}`
                                );
                            }
                            if (
                                !(relationship.relationshipType === 'one-to-one' && otherRelationship.relationshipType === 'one-to-one') &&
                                !(
                                    relationship.relationshipType === 'many-to-one' && otherRelationship.relationshipType === 'one-to-many'
                                ) &&
                                !(
                                    relationship.relationshipType === 'one-to-many' && otherRelationship.relationshipType === 'many-to-one'
                                ) &&
                                !(relationship.relationshipType === 'many-to-many' && otherRelationship.relationshipType === 'many-to-many')
                            ) {
                                throw new Error(
                                    `Relationship type is not synchronized ${stringify(relationship)} with ${stringify(otherRelationship)}`
                                );
                            }
                            _.defaults(relationship, {
                                otherEntityRelationshipName: otherRelationship.relationshipName,
                                otherEntityRelationshipNamePlural: otherRelationship.relationshipNamePlural,
                                otherEntityRelationshipNameCapitalized: otherRelationship.relationshipNameCapitalized,
                                otherEntityRelationshipNameCapitalizedPlural: relationship.relationshipNameCapitalizedPlural,
                            });
                        } else {
                            this.warning(`Could not find the other side of the relationship ${stringify(relationship)}`);
                        }
                    }

                    if (relationship.otherEntityRelationshipName !== undefined) {
                        _.defaults(relationship, {
                            otherEntityRelationshipNamePlural: pluralize(relationship.otherEntityRelationshipName),
                            otherEntityRelationshipNameCapitalized: _.upperFirst(relationship.otherEntityRelationshipName),
                        });
                        _.defaults(relationship, {
                            otherEntityRelationshipNameCapitalizedPlural: pluralize(relationship.otherEntityRelationshipNameCapitalized),
                        });
                    }

                    const relationshipName = relationship.relationshipName;
                    _.defaults(relationship, {
                        relationshipNamePlural: pluralize(relationshipName),
                        relationshipFieldName: _.lowerFirst(relationshipName),
                        relationshipNameCapitalized: _.upperFirst(relationshipName),
                        relationshipNameHumanized: relationshipOptions.relationshipNameHumanized || _.startCase(relationshipName),
                        otherEntityNamePlural: pluralize(otherEntityName),
                        otherEntityNameCapitalized: _.upperFirst(otherEntityName),
                        otherEntityFieldCapitalized: _.upperFirst(relationship.otherEntityField),
                        otherEntityTableName:
                            otherEntityData.entityTableName ||
                            this.getTableName(
                                this.isBuiltInUserEntity(otherEntityName) ? `${jhiTablePrefix}_${otherEntityName}` : otherEntityName
                            ),
                    });

                    _.defaults(relationship, {
                        relationshipFieldNamePlural: pluralize(relationship.relationshipFieldName),
                        relationshipNameCapitalizedPlural:
                            relationship.relationshipName.length > 1
                                ? pluralize(relationship.relationshipNameCapitalized)
                                : _.upperFirst(pluralize(relationship.relationshipName)),
                        otherEntityNameCapitalizedPlural: pluralize(relationship.otherEntityNameCapitalized),
                    });

                    if (context.dto === 'mapstruct') {
                        if (otherEntityData.dto !== 'mapstruct' && !this.isBuiltInUserEntity(otherEntityName)) {
                            this.warning(
                                `This entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`
                            );
                        }
                    }

                    if (isReservedTableName(relationship.otherEntityTableName, context.prodDatabaseType) && jhiTablePrefix) {
                        const otherEntityTableName = relationship.otherEntityTableName;
                        relationship.otherEntityTableName = `${jhiTablePrefix}_${otherEntityTableName}`;
                    }

                    if (relationship.otherEntityAngularName === undefined) {
                        if (this.isBuiltInUserEntity(otherEntityName)) {
                            relationship.otherEntityAngularName = 'User';
                        } else {
                            const otherEntityAngularSuffix = otherEntityData ? otherEntityData.angularJSSuffix || '' : '';
                            relationship.otherEntityAngularName =
                                _.upperFirst(relationship.otherEntityName) + this.upperFirstCamelCase(otherEntityAngularSuffix);
                        }
                    }

                    _.defaults(relationship, {
                        otherEntityStateName: _.kebabCase(relationship.otherEntityAngularName),
                        jpaMetamodelFiltering: otherEntityData.jpaMetamodelFiltering,
                    });

                    if (!this.isBuiltInUserEntity(otherEntityName)) {
                        _.defaults(relationship, {
                            otherEntityFileName: _.kebabCase(relationship.otherEntityAngularName),
                            otherEntityFolderName: _.kebabCase(relationship.otherEntityAngularName),
                        });

                        if (
                            context.skipUiGrouping ||
                            otherEntityData.clientRootFolder === '' ||
                            otherEntityData.clientRootFolder === undefined
                        ) {
                            relationship.otherEntityClientRootFolder = '';
                        } else {
                            relationship.otherEntityClientRootFolder = `${otherEntityData.clientRootFolder}/`;
                        }
                        if (otherEntityData.clientRootFolder) {
                            if (context.clientRootFolder === otherEntityData.clientRootFolder) {
                                relationship.otherEntityModulePath = relationship.otherEntityFolderName;
                            } else {
                                relationship.otherEntityModulePath = `${
                                    context.entityParentPathAddition ? `${context.entityParentPathAddition}/` : ''
                                }${otherEntityData.clientRootFolder}/${relationship.otherEntityFolderName}`;
                            }
                            relationship.otherEntityModelName = `${otherEntityData.clientRootFolder}/${relationship.otherEntityFileName}`;
                            relationship.otherEntityPath = `${otherEntityData.clientRootFolder}/${relationship.otherEntityFolderName}`;
                        } else {
                            relationship.otherEntityModulePath = `${
                                context.entityParentPathAddition ? `${context.entityParentPathAddition}/` : ''
                            }${relationship.otherEntityFolderName}`;
                            relationship.otherEntityModelName = relationship.otherEntityFileName;
                            relationship.otherEntityPath = relationship.otherEntityFolderName;
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
                    if (relationship.otherEntityIsEmbedded) {
                        context.fieldsContainEmbedded = true;
                    }

                    if (relationship.relationshipValidateRules && relationship.relationshipValidateRules.includes('required')) {
                        if (entityName.toLowerCase() === relationship.otherEntityName.toLowerCase()) {
                            this.warning('Required relationships to the same entity are not supported.');
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

                context.saveUserSnapshot =
                    context.applicationType === 'microservice' &&
                    context.authenticationType === 'oauth2' &&
                    hasUserField &&
                    context.dto === 'no';

                context.primaryKeyType = this.getPkTypeBasedOnDBAndAssociation(
                    context.authenticationType,
                    context.databaseType,
                    context.relationships
                );
                // Deprecated: kept for compatibility, should be removed in next major release
                context.pkType = context.primaryKeyType;
                context.hasUserField = hasUserField;
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
            },
        };
    }

    get default() {
        if (useBlueprints) return;
        return this._default();
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
                if (this.isJhipsterVersionLessThan('6.3.0') && context.clientFramework === ANGULAR) {
                    this.removeFile(`${constants.ANGULAR_DIR}entities/${context.entityFolderName}/index.ts`);
                }
            },

            composeServer() {
                const context = this.context;
                if (context.skipServer) return;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../entity-server'), {
                    context,
                    configOptions,
                    force: context.options.force,
                    debug: context.isDebugEnabled,
                });
            },

            composeClient() {
                const context = this.context;
                if (context.skipClient) return;
                const configOptions = this.configOptions;

                this.composeWith(require.resolve('../entity-client'), {
                    context,
                    configOptions,
                    skipInstall: context.options.skipInstall,
                    force: context.options.force,
                    debug: context.isDebugEnabled,
                });
            },

            composeI18n() {
                const context = this.context;
                if (context.skipClient) return;
                const configOptions = this.configOptions;
                this.composeWith(require.resolve('../entity-i18n'), {
                    context,
                    configOptions,
                    skipInstall: context.options.skipInstall,
                    force: context.options.force,
                    debug: context.isDebugEnabled,
                });
            },
        };
    }

    get writing() {
        if (useBlueprints) return;
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

                        // run through all post entity creation module hooks
                        this.callHooks(
                            'entity',
                            'post',
                            {
                                entityConfig: context,
                                force: context.options.force,
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
            },
        };
    }

    get install() {
        if (useBlueprints) return;
        return this._install();
    }

    /**
     * Validate the entityName
     * @return {true|string} true for a valid value or error message.
     */
    _validateEntityName(entityName) {
        if (!/^([a-zA-Z0-9]*)$/.test(entityName)) {
            return 'The entity name must be alphanumeric only';
        }
        if (/^[0-9].*$/.test(entityName)) {
            return 'The entity name cannot start with a number';
        }
        if (entityName === '') {
            return 'The entity name cannot be empty';
        }
        if (entityName.indexOf('Detail', entityName.length - 'Detail'.length) !== -1) {
            return "The entity name cannot end with 'Detail'";
        }
        if (!this.context.skipServer && isReservedClassName(entityName)) {
            return 'The entity name cannot contain a Java or JHipster reserved keyword';
        }
        return true;
    }

    /**
     * Validate the entityTableName
     * @return {true|string} true for a valid value or error message.
     */
    _validateTableName(entityTableName) {
        const context = this.context;
        const prodDatabaseType = context.prodDatabaseType;
        const jhiTablePrefix = context.jhiTablePrefix;
        const skipCheckLengthOfIdentifier = context.skipCheckLengthOfIdentifier;
        const instructions = `You can specify a different table name in your JDL file or change it in .jhipster/${context.name}.json file and then run again 'jhipster entity ${context.name}.'`;

        if (!/^([a-zA-Z0-9_]*)$/.test(entityTableName)) {
            return `The table name cannot contain special characters.\n${instructions}`;
        }
        if (!entityTableName) {
            return 'The table name cannot be empty';
        }
        if (isReservedTableName(entityTableName, prodDatabaseType)) {
            if (jhiTablePrefix) {
                this.warning(
                    `The table name cannot contain the '${entityTableName.toUpperCase()}' reserved keyword, so it will be prefixed with '${jhiTablePrefix}_'.\n${instructions}`
                );
                context.entityTableName = `${jhiTablePrefix}_${entityTableName}`;
            } else {
                this.warning(
                    `The table name contain the '${entityTableName.toUpperCase()}' reserved keyword but you have defined an empty jhiPrefix so it won't be prefixed and thus the generated application might not work'.\n${instructions}`
                );
            }
        } else if (prodDatabaseType === 'oracle' && entityTableName.length > 26 && !skipCheckLengthOfIdentifier) {
            return `The table name is too long for Oracle, try a shorter name.\n${instructions}`;
        } else if (prodDatabaseType === 'oracle' && entityTableName.length > 14 && !skipCheckLengthOfIdentifier) {
            this.warning(
                `The table name is long for Oracle, long table names can cause issues when used to create constraint names and join table names.\n${instructions}`
            );
        }
        return true;
    }

    /**
     * get an entity from the configuration file
     * @param {string} file - configuration file name for the entity
     */
    _getEntityJson(file) {
        let entityJson = null;

        try {
            let filename = path.join(JHIPSTER_CONFIG_DIR, `${_.upperFirst(file)}.json`);
            if (this.context && this.context.microservicePath) {
                filename = path.join(this.context.microservicePath, filename);
            }
            // TODO 7.0 filename = this.destinationPath(filename);
            entityJson = this.fs.readJSON(filename);
        } catch (err) {
            this.log(chalk.red(`The JHipster entity configuration file could not be read for file ${file}!`) + err);
            this.debug('Error:', err);
        }

        return entityJson;
    }

    /**
     * Setup Entity instance level options from context.
     * all variables should be set to dest,
     * all variables should be referred from context,
     * all methods should be called on generator,
     * @param {any} generator - generator instance
     * @param {any} context - context to use default is generator instance
     * @param {any} dest - destination context to use default is context
     */
    _setupEntityOptions(generator, context = generator, dest = context) {
        dest.regenerate = context.options.regenerate;

        if (context.options.fluentMethods !== undefined) {
            this.entityConfig.fluentMethods = context.options.fluentMethods;
        }
        if (context.options.skipCheckLengthOfIdentifier !== undefined) {
            this.entityConfig.skipCheckLengthOfIdentifier = context.options.skipCheckLengthOfIdentifier;
        }
        if (context.options.angularSuffix !== undefined) {
            this.entityConfig.angularJSSuffix = context.options.angularSuffix;
        }
        if (context.options.skipUiGrouping !== undefined) {
            this.entityConfig.skipUiGrouping = context.options.skipUiGrouping;
        }
        if (context.options.clientRootFolder !== undefined) {
            if (this.entityConfig.skipUiGrouping) {
                this.warn('Ignoring client-root-folder due to skip-ui-grouping configuration');
            } else {
                this.entityConfig.clientRootFolder = context.options.clientRootFolder;
            }
        }
        dest.isDebugEnabled = context.options.debug;
        dest.experimental = context.options.experimental;

        dest.entityNameCapitalized = _.upperFirst(dest.name);
        dest.entityTableName = generator.getTableName(context.options.tableName || dest.name);
    }

    /**
     * Load an entity configuration file into context.
     */
    _loadEntityJson(data) {
        const context = this.context;
        if (data.databaseType) {
            context.databaseType = data.databaseType;
        }
        context.skipUiGrouping = context.skipUiGrouping || data.skipUiGrouping;
        context.relationships = data.relationships || [];
        context.fields = data.fields || [];
        context.changelogDate = data.changelogDate;
        context.dto = data.dto;
        context.service = data.service;
        context.fluentMethods = data.fluentMethods;
        context.clientRootFolder = data.clientRootFolder;
        context.pagination = data.pagination;
        context.javadoc = data.javadoc;
        context.entityTableName = data.entityTableName || context.entityTableName;
        context.jhiPrefix = data.jhiPrefix || context.jhiPrefix;
        context.skipCheckLengthOfIdentifier = data.skipCheckLengthOfIdentifier || context.skipCheckLengthOfIdentifier;
        context.skipClient = data.skipClient || context.skipClient;
        context.readOnly = data.readOnly || false;
        context.embedded = data.embedded || false;
        context.jpaMetamodelFiltering = data.jpaMetamodelFiltering;

        context.entityAngularJSSuffix = data.angularJSSuffix;
        if (context.entityAngularJSSuffix && !context.entityAngularJSSuffix.startsWith('-')) {
            context.entityAngularJSSuffix = `-${context.entityAngularJSSuffix}`;
        }

        context.useMicroserviceJson = context.useMicroserviceJson || data.microserviceName !== undefined;
        if (context.applicationType === 'gateway' && context.useMicroserviceJson) {
            context.microserviceName = data.microserviceName;
            if (!context.microserviceName) {
                throw new Error('Microservice name for the entity is not found. Entity cannot be generated!');
            }
            context.microserviceAppName = this.getMicroserviceAppName(context.microserviceName);
            context.skipServer = true;
        }
    }

    _validateField(field) {
        const entityName = this.context.name;
        if (field.fieldName === undefined) {
            throw new Error(`fieldName is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
        }

        if (field.fieldType === undefined) {
            throw new Error(`fieldType is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
        }

        if (field.fieldValidateRules !== undefined) {
            if (!Array.isArray(field.fieldValidateRules)) {
                throw new Error(`fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
            field.fieldValidateRules.forEach(fieldValidateRule => {
                if (!SUPPORTED_VALIDATION_RULES.includes(fieldValidateRule)) {
                    throw new Error(
                        `fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${stringify(
                            field
                        )} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`
                    );
                }
            });
            if (field.fieldValidateRules.includes('max') && field.fieldValidateRulesMax === undefined) {
                throw new Error(`fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
            if (field.fieldValidateRules.includes('min') && field.fieldValidateRulesMin === undefined) {
                throw new Error(`fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
            if (field.fieldValidateRules.includes('maxlength') && field.fieldValidateRulesMaxlength === undefined) {
                throw new Error(`fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
            if (field.fieldValidateRules.includes('minlength') && field.fieldValidateRulesMinlength === undefined) {
                throw new Error(`fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
            if (field.fieldValidateRules.includes('maxbytes') && field.fieldValidateRulesMaxbytes === undefined) {
                throw new Error(`fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
            if (field.fieldValidateRules.includes('minbytes') && field.fieldValidateRulesMinbytes === undefined) {
                throw new Error(`fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
            if (field.fieldValidateRules.includes('pattern') && field.fieldValidateRulesPattern === undefined) {
                throw new Error(`fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
            }
        }
    }

    _validateRelationship(relationship) {
        const entityName = this.context.name;
        if (relationship.otherEntityName === undefined) {
            throw new Error(`otherEntityName is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`);
        }
        if (relationship.relationshipType === undefined) {
            throw new Error(`relationshipType is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`);
        }

        if (
            relationship.ownerSide === undefined &&
            (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')
        ) {
            throw new Error(`ownerSide is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`);
        }
    }
}

module.exports = EntityGenerator;
