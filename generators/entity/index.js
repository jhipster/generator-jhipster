/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  COMPOSING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  PREPARING_FIELDS_PRIORITY,
  PREPARING_RELATIONSHIPS_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  INSTALL_PRIORITY,
  END_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const prompts = require('./prompts');
const { defaultConfig } = require('../generator-defaults');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { isReservedClassName, isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');
const {
  prepareEntityForTemplates,
  prepareEntityServerForTemplates,
  prepareEntityPrimaryKeyForTemplates,
  loadRequiredConfigIntoEntity,
  loadRequiredConfigDerivedProperties,
  preparePostEntityCommonDerivedProperties,
  preparePostEntitiesCommonDerivedProperties,
} = require('../../utils/entity');
const { prepareFieldForTemplates } = require('../../utils/field');
const { prepareRelationshipForTemplates } = require('../../utils/relationship');
const { stringify } = require('../../utils');
const { GATEWAY, MICROSERVICE } = require('../../jdl/jhipster/application-types');
const { NO: CLIENT_FRAMEWORK_NO } = require('../../jdl/jhipster/client-framework-types');
const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL } = require('../../jdl/jhipster/database-types');
const {
  GENERATOR_ENTITIES,
  GENERATOR_ENTITY,
  GENERATOR_ENTITY_CLIENT,
  GENERATOR_ENTITY_I_18_N,
  GENERATOR_ENTITY_SERVER,
} = require('../generator-list');
const { CommonDBTypes, RelationalOnlyDBTypes } = require('../../jdl/jhipster/field-types');

const { INSTANT } = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;

const { PaginationTypes, ServiceTypes } = require('../../jdl/jhipster/entity-options');

const { NO: NO_PAGINATION } = PaginationTypes;
const { NO: NO_SERVICE } = ServiceTypes;

const { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN } = require('../../jdl/jhipster/validations');

/* constants used throughout */
const { SUPPORTED_VALIDATION_RULES, JHIPSTER_CONFIG_DIR } = constants;
const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

class EntityGenerator extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'argument', ...features });

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
      desc: 'Use a root folder name for entities on client side. By default its empty for monoliths and name of the microservice for gateways',
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
  }

  async _postConstruct() {
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

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ENTITY, {
        entityExisted,
        configExisted,
        arguments: [name],
      });
    }

    this._setupEntityOptions(this, this, this.context);
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

      loadSharedConfig() {
        this.application = {};
        this.loadAppConfig(undefined, this.application);
        this.loadClientConfig(undefined, this.application);
        this.loadTranslationConfig(undefined, this.application);
        // Try to load server config from microservice side, falling back to the app config.
        this.loadServerConfig(_.defaults({}, this.microserviceConfig, this.jhipsterConfig, defaultConfig), this.application);

        this.loadDerivedAppConfig(this.application);
        this.loadDerivedClientConfig(this.application);
        this.loadDerivedServerConfig(this.application);
        this.loadDerivedPlatformConfig(this.application);
      },

      setupMicroServiceEntity() {
        const context = this.context;

        if (this.application.applicationType === MICROSERVICE) {
          context.microserviceName = this.entityConfig.microserviceName = this.jhipsterConfig.baseName;
          if (!this.entityConfig.clientRootFolder) {
            context.clientRootFolder = this.entityConfig.clientRootFolder = this.entityConfig.microserviceName;
          }
        } else if (this.application.applicationType === GATEWAY) {
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

          if (this.jhipsterConfig.applications && !this.entityConfig.skipClient) {
            const remoteConfig = this.jhipsterConfig.applications[this.entityConfig.microserviceName];
            if (remoteConfig && remoteConfig.clientFramework && remoteConfig.clientFramework !== CLIENT_FRAMEWORK_NO) {
              // Gateway requires entities to discover a microfrontend.
              // Microfrontends is generated at the microservice side, so skip it at gateway side.
              this.entityConfig.skipClient = true;
            }
          }
        }
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

      validateEntityName() {
        const validation = this._validateEntityName(this.context.name);
        if (validation !== true) {
          throw new Error(validation);
        }
      },

      bootstrapConfig() {
        const context = this.context;
        const entityName = context.name;
        if ([MICROSERVICE, GATEWAY].includes(this.application.applicationType)) {
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

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      configureEntitySearchEngine() {
        const application = this.application;
        const { applicationTypeMicroservice, applicationTypeGateway, clientFrameworkAny } = application;
        if (this.entityConfig.microserviceName && !(applicationTypeMicroservice && clientFrameworkAny)) {
          if (this.entityConfig.searchEngine === undefined) {
            // If a non-microfrontent microservice entity, should be disabled by default.
            this.entityConfig.searchEngine = false;
          }
        }
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && this.entityConfig.microserviceName) &&
          !application.searchEngineAny &&
          ![undefined, false, 'no'].includes(this.entityConfig.searchEngine)
        ) {
          // Search engine can only be enabled at entity level and disabled at application level for gateways publishing a microservice entity
          this.entityConfig.searchEngine = false;
          this.warning('Search engine is enabled at entity level, but disabled at application level. Search engine will be disabled');
        }
      },
      configureModelFiltering() {
        const { databaseTypeSql, applicationTypeGateway, reactive } = this.application;
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && this.entityConfig.microserviceName) &&
          this.entityConfig.jpaMetamodelFiltering &&
          (!databaseTypeSql || this.entityConfig.service === NO_SERVICE || reactive)
        ) {
          this.warning('Not compatible with jpaMetamodelFiltering, disabling');
          this.entityConfig.jpaMetamodelFiltering = false;
        }
      },
      configureEntityTable() {
        const entity = this.context;
        entity.entityTableName = this.entityConfig.entityTableName || this.getTableName(entity.name);

        const fixedEntityTableName = this._fixEntityTableName(
          entity.entityTableName,
          entity.prodDatabaseType ?? this.application.prodDatabaseType,
          entity.jhiTablePrefix
        );
        if (fixedEntityTableName !== entity.entityTableName) {
          entity.entityTableName = this.entityConfig.entityTableName = fixedEntityTableName;
        }
        const validation = this._validateTableName(
          entity.entityTableName,
          entity.prodDatabaseType ?? this.application.prodDatabaseType,
          entity
        );
        if (validation !== true) {
          throw new Error(validation);
        }

        this.entityConfig.name = this.entityConfig.name || entity.name;

        // disable pagination if there is no database, unless it’s a microservice entity published by a gateway
        if (
          ![SQL, MONGODB, COUCHBASE, NEO4J].includes(entity.databaseType) &&
          (this.application.applicationType !== GATEWAY || !this.entityConfig.microserviceName)
        ) {
          this.entityConfig.pagination = NO_PAGINATION;
        }

        // Validate root entity json content
        if (this.entityConfig.changelogDate === undefined) {
          const currentDate = this.dateFormatForLiquibase();
          if (entity.entityExisted) {
            this.info(`changelogDate is missing in .jhipster/${this.entityConfig.name}.json, using ${currentDate} as fallback`);
          }
          entity.changelogDate = this.entityConfig.changelogDate = currentDate;
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
            field.fieldType = INSTANT;
          }
          if (field.fieldType === BYTES && context.databaseType === CASSANDRA) {
            field.fieldType = BYTE_BUFFER;
          }

          this._validateField(field);

          if (field.fieldType === BYTE_BUFFER) {
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

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  // Public API method used by the getter and also by Blueprints
  _composing() {
    return {
      async composeEntities() {
        // We need to compose with others entities to update relationships.
        await this.composeWithJHipster(
          GENERATOR_ENTITIES,
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

  get [COMPOSING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._composing();
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadEntity() {
        const entity = this.context;
        // Update current context with config from file.
        Object.assign(entity, this.entityStorage.getAll());

        loadRequiredConfigIntoEntity(entity, this.application);
        loadRequiredConfigDerivedProperties(entity);
        this.loadDerivedMicroserviceAppConfig(entity);

        if (entity.fields) {
          entity.fields
            .filter(field => field.options)
            .forEach(field => {
              // Load jdl annotations as default values.
              Object.assign(field, field.options);
            });
        }

        if (entity.relationships) {
          entity.relationships
            .filter(relationship => relationship.options)
            .forEach(relationship => {
              // Load jdl annotations as default values.
              Object.assign(relationship, relationship.options);
            });
        }
      },

      setupSharedConfig() {
        const context = this.context;
        if (context.entitySuffix === context.dtoSuffix) {
          throw new Error('The entity cannot be generated as the entity suffix and DTO suffix are equals !');
        }
      },

      shareEntity() {
        this.configOptions.sharedEntities[this.context.name] = this.context;
      },

      async composing() {
        if (this.options.skipWriting) return;
        const context = this.context;
        const application = this.application;
        if (!context.skipServer) {
          await this.composeWithJHipster(GENERATOR_ENTITY_SERVER, this.arguments, {
            context,
            application,
          });
        }

        if (!context.skipClient || this.application.applicationType === GATEWAY) {
          await this.composeWithJHipster(GENERATOR_ENTITY_CLIENT, this.arguments, {
            context,
            application,
            skipInstall: this.options.skipInstall,
          });
          if (this.application.enableTranslation) {
            await this.composeWithJHipster(GENERATOR_ENTITY_I_18_N, this.arguments, {
              context,
              application,
              skipInstall: this.options.skipInstall,
            });
          }
        }
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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
            throw new Error(`Error looking for otherEntity ${otherEntityName} at ${Object.keys(this.configOptions.sharedEntities)}`);
          }
          relationship.otherEntity = otherEntity;
          otherEntity.otherRelationships = otherEntity.otherRelationships || [];
          otherEntity.otherRelationships.push(relationship);

          if (
            relationship.unidirectional &&
            (relationship.relationshipType === 'many-to-many' ||
              // OneToOne back reference is required due to filtering
              relationship.relationshipType === 'one-to-one' ||
              (relationship.relationshipType === 'one-to-many' && !this.context.databaseTypeNeo4j && !this.context.databaseTypeNo))
          ) {
            relationship.otherEntityRelationshipName = _.lowerFirst(this.context.name);
            otherEntity.relationships.push({
              otherEntity: this.context,
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

      loadDomain() {
        prepareEntityServerForTemplates(this.context);
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
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

  get [PREPARING_FIELDS_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparingFields();
  }

  // Public API method used by the getter and also by Blueprints
  _preparingRelationships() {
    return {
      prepareRelationshipsForTemplates() {
        this.context.relationships.forEach(relationship => {
          prepareRelationshipForTemplates(this.context, relationship, this);
        });
      },
    };
  }

  get [PREPARING_RELATIONSHIPS_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparingRelationships();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      preparePostEntityCommonDerivedProperties() {
        if (this.configOptions.sharedEntities) {
          // Make user entity available to templates.
          this.context.user = this.configOptions.sharedEntities.User;
        }

        preparePostEntityCommonDerivedProperties(this.context);
        preparePostEntitiesCommonDerivedProperties(Object.values(this.configOptions.sharedEntities));

        this._.defaults(this.context, this.application);
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

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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
            this.callHooks(GENERATOR_ENTITY, 'post', {
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

  get [INSTALL_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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

  get [END_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
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
  _validateTableName(entityTableName, prodDatabaseType, entity) {
    const jhiTablePrefix = entity.jhiTablePrefix;
    const instructions = `You can specify a different table name in your JDL file or change it in .jhipster/${entity.name}.json file and then run again 'jhipster entity ${entity.name}.'`;

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
        entity.entityTableName = `${jhiTablePrefix}_${entityTableName}`;
      } else {
        this.warning(
          `The table name contain the '${entityTableName.toUpperCase()}' reserved keyword but you have defined an empty jhiPrefix so it won't be prefixed and thus the generated application might not work'.\n${instructions}`
        );
      }
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
    if (context.options.skipClient !== undefined) {
      this.entityConfig.skipClient = context.options.skipClient;
    }
    if (context.options.skipServer !== undefined) {
      this.entityConfig.skipServer = context.options.skipServer;
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
      if (field.fieldValidateRules.includes(MAX) && field.fieldValidateRulesMax === undefined) {
        throw new Error(`fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MIN) && field.fieldValidateRulesMin === undefined) {
        throw new Error(`fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MAXLENGTH) && field.fieldValidateRulesMaxlength === undefined) {
        throw new Error(`fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MINLENGTH) && field.fieldValidateRulesMinlength === undefined) {
        throw new Error(`fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MAXBYTES) && field.fieldValidateRulesMaxbytes === undefined) {
        throw new Error(`fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MINBYTES) && field.fieldValidateRulesMinbytes === undefined) {
        throw new Error(`fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(PATTERN) && field.fieldValidateRulesPattern === undefined) {
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
