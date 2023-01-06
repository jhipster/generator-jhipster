/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import chalk from 'chalk';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';

import BaseGenerator from '../base/index.mjs';
import prompts from './prompts.mjs';
import { JHIPSTER_CONFIG_DIR, ANGULAR_DIR } from '../generator-constants.mjs';
import { applicationTypes, clientFrameworkTypes, getConfigWithDefaults, reservedKeywords } from '../../jdl/jhipster/index.mjs';
import { GENERATOR_ENTITIES, GENERATOR_ENTITY } from '../generator-list.mjs';

const { GATEWAY, MICROSERVICE } = applicationTypes;
const { NO: CLIENT_FRAMEWORK_NO, ANGULAR } = clientFrameworkTypes;
const { isReservedClassName } = reservedKeywords;

export default class EntityGenerator extends BaseGenerator {
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
  get initializing() {
    return {
      /* Use need microservice path to load the entity file */
      askForMicroserviceJson: prompts.askForMicroserviceJson,

      loadSharedConfig() {
        this.application = {};
        this.loadAppConfig(undefined, this.application);
        this.loadClientConfig(undefined, this.application);
        this.loadTranslationConfig(undefined, this.application);
        // Try to load server config from microservice side, falling back to the app config.
        this.loadServerConfig(getConfigWithDefaults({ ...this.jhipsterConfig, ...this.microserviceConfig }), this.application);

        this.loadDerivedAppConfig(this.application);
        this.loadDerivedClientConfig(this.application);
        this.loadDerivedServerConfig(this.application);
        this.loadDerivedPlatformConfig(this.application);
      },

      isBuiltInEntity() {
        if (this.isBuiltInUser(this.context.name) || this.isBuiltInAuthority(this.context.name)) {
          throw new Error(`Is not possible to override built in ${this.context.name}`);
        }
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

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
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

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get composing() {
    return {
      async composeEntities() {
        // We need to compose with others entities to update relationships.
        await this.composeWithJHipster(GENERATOR_ENTITIES, {
          entities: this.options.singleEntity ? [this.context.name] : undefined,
          regenerate: true,
          writeEveryEntity: false,
          composedEntities: [this.context.name],
          skipDbChangelog: this.options.skipDbChangelog,
          skipInstall: this.options.skipInstall,
        });
      },
    };
  }

  get [BaseGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    if (this.options.skipWriting) {
      return {};
    }
    return {
      cleanup() {
        const context = this.context;
        const entityName = context.name;
        if (this.isJhipsterVersionLessThan('5.0.0')) {
          this.removeFile(`${ANGULAR_DIR}entities/${entityName}/${entityName}.model.ts`);
        }
        if (this.isJhipsterVersionLessThan('6.3.0') && context.clientFramework === ANGULAR) {
          this.removeFile(`${ANGULAR_DIR}entities/${context.entityFolderName}/index.ts`);
        }
      },
    };
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  // Public API method used by the getter and also by Blueprints
  get end() {
    return {
      end() {
        this.log(chalk.bold.green(`Entity ${this.context.entityNameCapitalized} generated successfully.`));
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * @private
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

    if (context.options.tableName) {
      this.entityConfig.entityTableName = generator.getTableName(context.options.tableName);
    }
  }

  /**
   * @private
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
   * @private
   * Verify if the entity is a built-in User.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is User and is built-in.
   */
  isBuiltInUser(entityName) {
    return this.generateBuiltInUserEntity && this.isUserEntity(entityName);
  }

  /**
   * @private
   * Verify if the entity is a User entity.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is User.
   */
  isUserEntity(entityName) {
    return _.upperFirst(entityName) === 'User';
  }

  /**
   * @private
   * Verify if the entity is a Authority entity.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is Authority.
   */
  isAuthorityEntity(entityName) {
    return _.upperFirst(entityName) === 'Authority';
  }

  /**
   * @private
   * Verify if the entity is a built-in Authority.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is Authority and is built-in.
   */
  isBuiltInAuthority(entityName) {
    return this.generateBuiltInAuthorityEntity && this.isAuthorityEntity(entityName);
  }
}
