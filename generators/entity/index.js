/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const chalk = require('chalk');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const prompts = require('./prompts');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { isReservedClassName, isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');
const { prepareEntityForTemplates, prepareEntityPrimaryKeyForTemplates, loadRequiredConfigIntoEntity } = require('../../utils/entity');
const { prepareFieldForTemplates, fieldIsEnum } = require('../../utils/field');
const { prepareRelationshipForTemplates } = require('../../utils/relationship');
const { stringify } = require('../../utils');

/* constants used throughout */
const SUPPORTED_VALIDATION_RULES = constants.SUPPORTED_VALIDATION_RULES;
const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const JHIPSTER_CONFIG_DIR = constants.JHIPSTER_CONFIG_DIR;

let useBlueprints;

class EntityGenerator extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'argument' });

    // This makes `name` a required argument.
    this.argument('name', {
      type: String,
      required: true,
      description: 'Entity name',
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
      desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
      type: Boolean,
    });

    this.option('single-entity', {
      desc: 'Regenerate only a single entity, relationships can be not correctly generated',
      type: Boolean,
    });

    if (this.options.help) {
      return;
    }

    const name = _.upperFirst(this.options.name).replace('.json', '');
    this.entityStorage = this.getEntityConfig(name, true);
    this.entityConfig = this.entityStorage.createProxy();

    const configExisted = this.entityStorage.existed;
    const filename = path.join(JHIPSTER_CONFIG_DIR, `${name}.json`);
    const entityExisted = fs.existsSync(this.destinationPath(filename));

    this.context = {
      name,
      filename,
      configExisted,
      entityExisted,
      configurationFileExists: this.fs.exists(this.destinationPath(filename)),
    };

    this._setupEntityOptions(this, this, this.context);

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entity', { entityExisted, configExisted, arguments: [name] });
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      isBuiltInEntity() {
        if (this.isBuiltInUser(this.context.name) || this.isBuiltInAuthority(this.context.name)) {
          throw new Error(`Is not possible to override built in ${this.context.name}`);
        }
      },

      /* Use need microservice path to load the entity file */
      askForMicroserviceJson: prompts.askForMicroserviceJson,

      setupMicroServiceEntity() {
        const context = this.context;

        if (this.jhipsterConfig.applicationType === 'microservice') {
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
          }
          if (this.entityConfig.clientRootFolder === undefined) {
            context.clientRootFolder = this.entityConfig.clientRootFolder = context.skipUiGrouping
              ? ''
              : this.entityConfig.microserviceName;
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
        this.context.databaseType = this.context.databaseType || this.entityConfig.databaseType || this.jhipsterConfig.databaseType;
      },

      setupSharedConfig() {
        const context = this.context;

        context.protractorTests = context.testFrameworks.includes('protractor');
        context.gatlingTests = context.testFrameworks.includes('gatling');
        context.cucumberTests = context.testFrameworks.includes('cucumber');

        context.jhiPrefixDashed = _.kebabCase(context.jhiPrefix);
        context.jhiTablePrefix = this.getTableName(context.jhiPrefix);
        context.capitalizedBaseName = _.upperFirst(context.baseName);

        context.frontendAppName = this.getFrontendAppName(context.baseName);
        context.mainClass = this.getMainClassName(context.baseName);
        context.microserviceAppName = '';

        if (context.entitySuffix === context.dtoSuffix) {
          throw new Error('The entity cannot be generated as the entity suffix and DTO suffix are equals !');
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
        context.entityTableName = this.entityConfig.entityTableName || this.getTableName(context.name);

        const fixedEntityTableName = this._fixEntityTableName(context.entityTableName, context.prodDatabaseType, context.jhiTablePrefix);
        if (fixedEntityTableName !== context.entityTableName) {
          context.entityTableName = this.entityConfig.entityTableName = fixedEntityTableName;
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

        this.entityConfig.name = this.entityConfig.name || context.name;
        if (!['sql', 'mongodb', 'couchbase', 'neo4j'].includes(context.databaseType)) {
          this.entityConfig.pagination = 'no';
        }

        if (
          this.entityConfig.jpaMetamodelFiltering &&
          (context.databaseType !== 'sql' || this.entityConfig.service === 'no' || context.reactive === true)
        ) {
          this.warning('Not compatible with jpaMetamodelFiltering, disabling');
          this.entityConfig.jpaMetamodelFiltering = false;
        }

        // Validate root entity json content
        if (this.entityConfig.changelogDate === undefined) {
          const currentDate = this.dateFormatForLiquibase();
          if (this.context.entityExisted) {
            this.info(`changelogDate is missing in .jhipster/${this.entityConfig.name}.json, using ${currentDate} as fallback`);
          }
          context.changelogDate = this.entityConfig.changelogDate = currentDate;
        }

        if (this.entityConfig.incrementalChangelog === undefined) {
          // Keep entity's original incrementalChangelog option.
          this.entityConfig.incrementalChangelog =
            this.jhipsterConfig.incrementalChangelog &&
            !fs.existsSync(
              this.destinationPath(
                `src/main/resources/config/liquibase/changelog/${this.entityConfig.changelogDate}_added_entity_${this.entityConfig.name}.xml`
              )
            );
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
          if (field.fieldType === 'byte[]' && context.databaseType === 'cassandra') {
            field.fieldType = 'ByteBuffer';
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
              `relationshipName is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}, using ${
                relationship.otherEntityName
              } as fallback`
            );
          }
          if (relationship.useJPADerivedIdentifier) {
            this.info('Option useJPADerivedIdentifier is deprecated, use id instead');
            relationship.id = true;
          }
        });
        this.entityConfig.relationships = relationships;
      },

      addToYoRc() {
        if (this.jhipsterConfig.entities === undefined) {
          this.jhipsterConfig.entities = [];
        }
        if (!this.jhipsterConfig.entities.find(entityName => entityName === this.context.name)) {
          this.jhipsterConfig.entities = this.jhipsterConfig.entities.concat([this.context.name]);
        }
      },
    };
  }

  get configuring() {
    if (useBlueprints) return;
    return this._configuring();
  }

  // Public API method used by the getter and also by Blueprints
  _composing() {
    return {
      composeEntities() {
        // We need to compose with others entities to update relationships.
        this.composeWithJHipster(
          'entities',
          {
            entities: this.options.singleEntity ? [this.context.name] : undefined,
            regenerate: true,
            writeEveryEntity: false,
            composedEntities: [this.context.name],
            skipDbChangelog: this.options.skipDbChangelog,
            skipInstall: this.options.skipInstall,
          },
          true
        );
      },
    };
  }

  get composing() {
    if (useBlueprints) return;
    return this._composing();
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadEntity() {
        // Update current context with config from file.
        Object.assign(this.context, this.entityStorage.getAll());
        loadRequiredConfigIntoEntity(this.context, this.jhipsterConfig);

        if (this.context.fields) {
          this.context.fields
            .filter(field => field.options)
            .forEach(field => {
              // Load jdl annotations as default values.
              Object.assign(field, field.options);
            });
        }

        if (this.context.relationships) {
          this.context.relationships
            .filter(relationship => relationship.options)
            .forEach(relationship => {
              // Load jdl annotations as default values.
              Object.assign(relationship, relationship.options);
            });
        }
      },

      shareEntity() {
        this.configOptions.sharedEntities[this.context.name] = this.context;
      },

      composing() {
        if (this.options.skipWriting) return;
        const context = this.context;
        if (!context.skipServer) {
          this.composeWithJHipster('entity-server', this.arguments, {
            context,
          });
        }

        if (!context.skipClient) {
          this.composeWithJHipster('entity-client', this.arguments, {
            context,
            skipInstall: this.options.skipInstall,
          });
          if (this.jhipsterConfig.enableTranslation) {
            this.composeWithJHipster('entity-i18n', this.arguments, {
              context,
              skipInstall: this.options.skipInstall,
            });
          }
        }
      },
    };
  }

  get loading() {
    if (useBlueprints) return;
    return this._loading();
  }

  // Public API method used by the getter and also by Blueprints
  _preparing() {
    return {
      loadRelationships() {
        this.context.relationships.forEach(relationship => {
          const otherEntityName = this._.upperFirst(relationship.otherEntityName);
          const otherEntity = this.configOptions.sharedEntities[otherEntityName];
          if (!otherEntity) {
            throw new Error(`Error looking for otherEntity ${otherEntityName}`);
          }
          relationship.otherEntity = otherEntity;
          otherEntity.otherRelationships = otherEntity.otherRelationships || [];
          otherEntity.otherRelationships.push(relationship);

          if (
            relationship.unidirectional &&
            (relationship.relationshipType === 'many-to-many' ||
              // OneToOne back reference is required due to filtering
              relationship.relationshipType === 'one-to-one' ||
              (relationship.relationshipType === 'one-to-many' && !this.context.databaseTypeNeo4j))
          ) {
            relationship.otherEntityRelationshipName = _.lowerFirst(this.context.name);
            otherEntity.relationships.push({
              otherEntityName: relationship.otherEntityRelationshipName,
              ownerSide: !relationship.ownerSide,
              otherEntityRelationshipName: relationship.relationshipName,
              relationshipName: relationship.otherEntityRelationshipName,
              relationshipType: relationship.relationshipType.split('-').reverse().join('-'),
            });
          }
        });
      },

      prepareEntityForTemplates() {
        const entity = this.context;
        prepareEntityForTemplates(entity, this);
      },
    };
  }

  get preparingFields() {
    if (useBlueprints) return;
    return this._preparingFields();
  }

  // Public API method used by the getter and also by Blueprints
  _preparingFields() {
    return {
      // If primaryKey doesn't exist, create it.
      preparePrimaryKey() {
        const entity = this.context;
        if (!entity.embedded && !entity.primaryKey) {
          prepareEntityPrimaryKeyForTemplates(entity, this);
        }
      },

      prepareFieldsForTemplates() {
        const entity = this.context;

        this.context.fields.forEach(field => {
          prepareFieldForTemplates(entity, field, this);
        });
      },
    };
  }

  get preparing() {
    if (useBlueprints) return;
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _preparingRelationships() {
    return {
      prepareRelationshipsForTemplates() {
        this.context.relationships.forEach(relationship => {
          prepareRelationshipForTemplates(this.context, relationship, this);

          // Load in-memory data for root
          if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide) {
            this.context.fieldsContainOwnerManyToMany = true;
          } else if (relationship.relationshipType === 'one-to-one' && !relationship.ownerSide) {
            this.context.fieldsContainNoOwnerOneToOne = true;
          } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide) {
            this.context.fieldsContainOwnerOneToOne = true;
          } else if (relationship.relationshipType === 'one-to-many') {
            this.context.fieldsContainOneToMany = true;
          } else if (relationship.relationshipType === 'many-to-one') {
            this.context.fieldsContainManyToOne = true;
          }
          if (relationship.otherEntityIsEmbedded) {
            this.context.fieldsContainEmbedded = true;
          }
          if (relationship.relationshipValidate) {
            this.context.validation = true;
          }

          const entityType = relationship.otherEntityNameCapitalized;
          if (!this.context.differentTypes.includes(entityType)) {
            this.context.differentTypes.push(entityType);
          }
          if (!this.context.differentRelationships[entityType]) {
            this.context.differentRelationships[entityType] = [];
          }
          this.context.differentRelationships[entityType].push(relationship);
        });
      },

      processEntityFields() {
        const entity = this.context;
        entity.fields.forEach(field => {
          const fieldType = field.fieldType;
          if (!['Instant', 'ZonedDateTime', 'Boolean'].includes(fieldType)) {
            entity.fieldsIsReactAvField = true;
          }

          if (field.javadoc) {
            entity.haveFieldWithJavadoc = true;
          }

          if (fieldIsEnum(fieldType)) {
            entity.i18nToLoad.push(field.enumInstance);
          }

          if (fieldType === 'ZonedDateTime') {
            entity.fieldsContainZonedDateTime = true;
            entity.fieldsContainDate = true;
          } else if (fieldType === 'Instant') {
            entity.fieldsContainInstant = true;
            entity.fieldsContainDate = true;
          } else if (fieldType === 'Duration') {
            entity.fieldsContainDuration = true;
          } else if (fieldType === 'LocalDate') {
            entity.fieldsContainLocalDate = true;
            entity.fieldsContainDate = true;
          } else if (fieldType === 'BigDecimal') {
            entity.fieldsContainBigDecimal = true;
          } else if (fieldType === 'UUID') {
            entity.fieldsContainUUID = true;
          } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
            entity.blobFields.push(field);
            entity.fieldsContainBlob = true;
            if (field.fieldTypeBlobContent === 'image') {
              entity.fieldsContainImageBlob = true;
            }
            if (field.fieldTypeBlobContent !== 'text') {
              entity.fieldsContainBlobOrImage = true;
            } else {
              entity.fieldsContainTextBlob = true;
            }
          }

          if (Array.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1) {
            entity.validation = true;
          }
        });
      },

      prepareReferences() {
        this.context.allReferences = [
          ...this.context.fields.map(field => field.reference),
          ...this.context.relationships.map(relationship => relationship.reference),
        ];
        this.context.dtoReferences = [
          ...this.context.fields.map(field => field.reference),
          ...this.context.relationships
            .map(relationship => relationship.reference)
            .filter(reference => reference.owned || reference.relationship.otherEntity.embedded),
        ];
      },
    };
  }

  get preparingRelationships() {
    if (useBlueprints) return;
    return this._preparingRelationships();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      ...super._missingPreDefault(),

      loadUserManagementEntities() {
        if (!this.configOptions.sharedEntities) return;
        // Make user entity available to templates.
        this.context.user = this.configOptions.sharedEntities.User;
      },

      processOtherReferences() {
        this.context.otherReferences = this.context.otherRelationships.map(relationship => relationship.reference);
        this.context.allReferences
          .filter(reference => reference.relationship && reference.relationship.relatedField)
          .forEach(reference => {
            reference.relatedReference = reference.relationship.relatedField.reference;
          });

        // Get all required back references for dto.
        this.context.otherDtoReferences = this.context.otherReferences.filter(reference =>
          reference.entity.dtoReferences.includes(reference)
        );
      },

      processCollectionRelationships() {
        this.context.relationships.forEach(relationship => {
          relationship.relationshipCollection = ['one-to-many', 'many-to-many'].includes(relationship.relationshipType);
          relationship.relationshipReferenceField = relationship.relationshipCollection
            ? relationship.relationshipFieldNamePlural
            : relationship.relationshipFieldName;
        });
        this.context.entityContainsCollectionField = this.context.relationships.some(relationship => relationship.relationshipCollection);
      },

      processPrimaryKeyTypesForRelations() {
        const types = this.context.relationships
          .filter(rel => rel.otherEntity.primaryKey)
          .map(rel => rel.otherEntity.primaryKey.fields.map(f => f.fieldType))
          .flat();
        this.context.otherEntityPrimaryKeyTypes = Array.from(new Set(types));
      },

      /**
       * Process relationships that should be loaded eagerly.
       */
      processEagerLoadRelationships() {
        this.context.relationships
          .filter(relationship => relationship.relationshipEagerLoad === undefined)
          .forEach(relationship => {
            relationship.relationshipEagerLoad =
              !relationship.embedded &&
              // Allows the entity to force earger load every relationship
              (this.context.eagerLoad ||
                (this.context.paginate !== 'pagination' &&
                  relationship.relationshipType === 'many-to-many' &&
                  relationship.ownerSide === true)) &&
              // Neo4j eagerly loads relations by default
              this.context.databaseType !== 'neo4j';
          });
        this.context.relationshipsContainEagerLoad = this.context.relationships.some(relationship => relationship.relationshipEagerLoad);
        this.context.eagerRelations = this.context.relationships.filter(rel => rel.relationshipEagerLoad);
        this.context.regularEagerRelations = this.context.eagerRelations.filter(rel => rel.id !== true);

        this.context.reactiveEagerRelations = this.context.relationships.filter(
          rel => rel.relationshipType === 'many-to-one' || (rel.relationshipType === 'one-to-one' && rel.ownerSide === true)
        );
        this.context.reactiveRegularEagerRelations = this.context.reactiveEagerRelations.filter(rel => rel.id !== true);
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
    if (this.options.skipWriting) {
      return {};
    }
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

      ...super._missingPostWriting(),
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
        try {
          const modules = this.getModuleHooks();
          if (modules.length > 0) {
            this.log(`\n${chalk.bold.green('Running post run module hooks\n')}`);
            // form the data to be passed to modules
            const context = this.context;

            // run through all post entity creation module hooks
            this.callHooks('entity', 'post', {
              entityConfig: context,
              force: this.options.force,
            });
          }
        } catch (err) {
          this.log(`\n${chalk.bold.red('Running post run module hooks failed. No modification done to the generated entity.')}`);
          this.debug('Error:', err);
        }
      },
    };
  }

  get install() {
    if (useBlueprints) return;
    return this._install();
  }

  // Public API method used by the getter and also by Blueprints
  _end() {
    return {
      end() {
        this.log(chalk.bold.green(`Entity ${this.context.entityNameCapitalized} generated successfully.`));
      },
    };
  }

  get end() {
    if (useBlueprints) return;
    return this._end();
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
    dest.experimental = context.options.experimental;

    dest.entityTableName = generator.getTableName(context.options.tableName || dest.name);
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

  _fixEntityTableName(entityTableName, prodDatabaseType, jhiTablePrefix) {
    if (isReservedTableName(entityTableName, prodDatabaseType) && jhiTablePrefix) {
      entityTableName = `${jhiTablePrefix}_${entityTableName}`;
    }
    return entityTableName;
  }
}

module.exports = EntityGenerator;
