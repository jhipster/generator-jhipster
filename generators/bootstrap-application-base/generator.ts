/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import assert from 'assert';
import { kebabCase, lowerFirst, upperFirst } from 'lodash-es';
import chalk from 'chalk';
import { passthrough } from '@yeoman/transform';

import { isFileStateModified } from 'mem-fs-editor/state';
import type { MemFsEditorFile } from 'mem-fs-editor';
import BaseApplicationGenerator from '../base-application/index.js';
import type { Entity as BaseApplicationEntity } from '../base-application/index.js';
import type { Application as SpringBootApplication } from '../spring-boot/types.js';
import type { Application as SpringDataRelationalApplication } from '../spring-data-relational/types.js';
import {
  addFakerToEntity,
  derivedPrimaryKeyProperties,
  loadEntitiesAnnotations,
  loadEntitiesOtherSide,
  prepareCommonFieldForTemplates,
  prepareEntity as prepareEntityForTemplates,
  prepareEntityPrimaryKeyForTemplates,
  preparePostEntitiesCommonDerivedProperties,
  preparePostEntityCommonDerivedProperties,
  prepareRelationship,
  stringifyApplicationData,
} from '../base-application/support/index.js';
import { JAVA_DOCKER_DIR, LOGIN_REGEX, RECOMMENDED_NODE_VERSION } from '../generator-constants.js';
import { GENERATOR_COMMON, GENERATOR_PROJECT_NAME } from '../generator-list.js';
import { packageJson } from '../../lib/index.js';
import { loadLanguagesConfig } from '../languages/support/index.js';
import { loadDerivedAppConfig } from '../app/support/index.js';
import { lookupCommandsConfigs } from '../../lib/command/lookup-commands-configs.js';
import { loadCommandConfigsIntoApplication, loadCommandConfigsKeysIntoTemplatesContext } from '../../lib/command/load.js';
import { getConfigWithDefaults } from '../../lib/jhipster/default-application-options.js';
import { isWin32 } from '../base-core/support/index.ts';
import { mutateData, removeFieldsWithNullishValues } from '../../lib/utils/index.js';
import {
  convertFieldBlobType,
  getBlobContentType,
  isFieldBinaryType,
  isFieldBlobType,
} from '../base-application/internal/types/field-types.ts';
import { baseNameProperties } from '../project-name/support/index.js';
import type { ApplicationAll } from '../../lib/types/application-all.js';
import { createAuthorityEntity, createUserEntity, createUserManagementEntity } from './utils.js';
import { exportJDLTransform, importJDLTransform } from './support/index.js';
import type {
  Application as BootstrapApplicationBaseApplication,
  Config as BootstrapApplicationBaseConfig,
  Entity as BootstrapApplicationBaseEntity,
  Options as BootstrapApplicationBaseOptions,
} from './types.js';

export default class BootstrapApplicationBase extends BaseApplicationGenerator<
  BootstrapApplicationBaseEntity,
  BootstrapApplicationBaseApplication<BootstrapApplicationBaseEntity>,
  BootstrapApplicationBaseConfig,
  BootstrapApplicationBaseOptions
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      displayLogo() {
        this.printDestinationInfo();
      },
      async jdlStore() {
        if (this.jhipsterConfig.jdlStore) {
          this.logger.warn('Storing configuration inside a JDL file is experimental');
          this.logger.info(`Using JDL store ${this.jhipsterConfig.jdlStore}`);

          const destinationPath = this.destinationPath();
          const jdlStorePath = this.destinationPath(this.jhipsterConfig.jdlStore);
          const { jdlDefinition } = this.options;

          this.features.commitTransformFactory = () => exportJDLTransform({ destinationPath, jdlStorePath, jdlDefinition: jdlDefinition! });
          await this.pipeline(
            { refresh: true, pendingFiles: false },
            importJDLTransform({ destinationPath, jdlStorePath, jdlDefinition: jdlDefinition! }),
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.initializing;
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configuring() {
        if (this.jhipsterConfig.baseName === undefined) {
          this.jhipsterConfig.baseName = 'jhipster';
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.configuring;
  }

  get [BaseApplicationGenerator.BOOTSTRAP_APPLICATION]() {
    return this.asBootstrapApplicationTaskGroup({
      loadConfig({ applicationDefaults }) {
        applicationDefaults(removeFieldsWithNullishValues(this.config.getAll()) as any, {
          nodeDependencies: {},
          customizeTemplatePaths: [],
          packageJsonScripts: {},
          clientPackageJsonScripts: {},
          testFrameworks: [],
          dockerContainers: {},
          user: undefined,
          authenticationUsesCsrf: undefined,
          gatewayRoutes: undefined,
        });
      },
    });
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadDefaults({ application, applicationDefaults }) {
        let { applyDefaults } = this.options;
        applyDefaults ??= getConfigWithDefaults as any;
        applicationDefaults(applyDefaults!(application));
      },
      loadApplication({ application, control, applicationDefaults }) {
        applicationDefaults({
          ...baseNameProperties,
          nodeVersion: this.useVersionPlaceholders ? 'NODE_VERSION' : RECOMMENDED_NODE_VERSION,
          jhipsterVersion: this.useVersionPlaceholders ? 'JHIPSTER_VERSION' : packageJson.version,
          jhipsterPackageJson: packageJson,

          jhiPrefixCapitalized: ({ jhiPrefix }) => upperFirst(jhiPrefix),
          jhiPrefixDashed: ({ jhiPrefix }) => kebabCase(jhiPrefix),

          projectDescription: ({ projectDescription, humanizedBaseName }) => projectDescription ?? `Description for ${humanizedBaseName}`,

          backendType: 'Java',
          temporaryDir: ({ backendType, buildTool }) => {
            if (['Java'].includes(backendType!)) {
              return buildTool === 'gradle' ? 'build/' : 'target/';
            }
            return 'temp/';
          },
          clientDistDir: ({ backendType, temporaryDir, buildTool }) => {
            if (['Java'].includes(backendType!)) {
              return `${temporaryDir}${buildTool === 'gradle' ? 'resources/main/' : 'classes/'}static/`;
            }
            return 'dist/';
          },
        });

        loadLanguagesConfig({ application, config: this.jhipsterConfigWithDefaults, control });
      },
      loadApplicationKeysForEjs({ application }) {
        mutateData(application as unknown as SpringBootApplication, {
          communicationSpringWebsocket: undefined,
          embeddableLaunchScript: undefined,
          buildToolUnknown: ({ buildTool }) => !['gradle', 'maven'].includes(buildTool!),
        });

        mutateData(application as unknown as SpringDataRelationalApplication, {
          devDatabaseTypeH2Any: undefined,
        });
      },
      loadNodeDependencies({ application }) {
        this.loadNodeDependencies(application.nodeDependencies, {
          prettier: packageJson.dependencies.prettier,
          'prettier-plugin-java': packageJson.dependencies['prettier-plugin-java'],
          'prettier-plugin-packagejson': packageJson.dependencies['prettier-plugin-packagejson'],
        });

        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_COMMON, 'resources', 'package.json'),
        );
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      /**
       * Avoid having undefined keys in the application object when redering ejs templates
       */
      async loadApplicationKeys({ application }) {
        const { applyDefaults = getConfigWithDefaults, commandsConfigs = await lookupCommandsConfigs() } = this.options;
        loadCommandConfigsIntoApplication({
          source: applyDefaults(removeFieldsWithNullishValues(this.config.getAll())),
          application,
          commandsConfigs,
        });
      },
      prepareApplication({ application, applicationDefaults }) {
        loadDerivedAppConfig({ application });

        applicationDefaults({
          __override__: false,
          nodePackageManager: 'npm',
          nodePackageManagerCommand: ({ nodePackageManager }) => nodePackageManager,
          dockerServicesDir: JAVA_DOCKER_DIR,
          // TODO drop clientPackageManager
          clientPackageManager: ({ nodePackageManager }) => nodePackageManager,
          hipsterName: 'Java Hipster',
          hipsterProductName: 'JHipster',
          hipsterHomePageProductName: 'JHipster',
          hipsterStackOverflowProductName: 'JHipster',
          hipsterBugTrackerProductName: 'JHipster',
          hipsterChatProductName: 'JHipster',
          hipsterTwitterUsername: '@jhipster',
          hipsterDocumentationLink: 'https://www.jhipster.tech/',
          hipsterTwitterLink: 'https://twitter.com/jhipster',
          hipsterProjectLink: 'https://github.com/jhipster/generator-jhipster',
          hipsterStackoverflowLink: 'https://stackoverflow.com/tags/jhipster/info',
          hipsterBugTrackerLink: 'https://github.com/jhipster/generator-jhipster/issues?state=open',
          hipsterChatLink: 'https://gitter.im/jhipster/generator-jhipster',

          backendTypeSpringBoot: ({ backendType }) => backendType === 'Java',
          backendTypeJavaAny: ({ backendTypeSpringBoot }) => backendTypeSpringBoot,
          authenticationUsesCsrf: ({ authenticationType }) => ['oauth2', 'session'].includes(authenticationType!),
          endpointPrefix: ({ applicationType, lowercaseBaseName }) =>
            applicationType === 'microservice' ? `services/${lowercaseBaseName}` : '',

          loginRegex: LOGIN_REGEX,

          jwtSecretKey: undefined,
          gatewayServerPort: undefined,
        });
      },
      userRelationship({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          anyEntityHasRelationshipWithUser: this.getExistingEntities().some(entity =>
            (entity.definition.relationships ?? []).some(relationship => relationship.otherEntityName.toLowerCase() === 'user'),
          ),
        });
      },
      syncUserWithIdp({ application, applicationDefaults }) {
        if (!application.backendTypeSpringBoot) return;

        if (application.syncUserWithIdp === undefined && application.authenticationType === 'oauth2') {
          applicationDefaults({
            __override__: false,
            syncUserWithIdp: data =>
              data.databaseType !== 'no' && (data.applicationType === 'gateway' || data.anyEntityHasRelationshipWithUser),
          });
        } else if (application.syncUserWithIdp && application.authenticationType !== 'oauth2') {
          throw new Error('syncUserWithIdp is only supported with oauth2 authenticationType');
        }
      },
      userManagement({ applicationDefaults }) {
        applicationDefaults({
          generateBuiltInUserEntity: ({ generateUserManagement, syncUserWithIdp }) => generateUserManagement || syncUserWithIdp,
          generateBuiltInAuthorityEntity: ({ generateBuiltInUserEntity, databaseType }) =>
            generateBuiltInUserEntity! && databaseType !== 'cassandra',
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      configureEntity({ entityStorage, entityConfig }) {
        entityStorage.defaults({ fields: [], relationships: [], annotations: {} });

        for (const field of entityConfig.fields!.filter(field => field.fieldType === 'byte[]')) {
          convertFieldBlobType(field);
          entityStorage.save();
        }

        if (entityConfig.changelogDate) {
          entityConfig.annotations!.changelogDate = entityConfig.changelogDate;
          delete entityConfig.changelogDate;
        }
        if (!entityConfig.annotations!.changelogDate) {
          entityConfig.annotations!.changelogDate = this.nextTimestamp();
          entityStorage.save();
        }
      },

      configureRelationships({ entityName, entityStorage, entityConfig }) {
        // Validate entity json relationship content
        entityConfig.relationships!.forEach(relationship => {
          const { otherEntityName, relationshipType } = relationship;

          assert(
            otherEntityName,
            `otherEntityName is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`,
          );
          assert(
            relationshipType,
            `relationshipType is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`,
          );

          if (!relationship.relationshipSide) {
            // Try to create relationshipSide based on best bet.
            if (relationship.ownerSide !== undefined) {
              relationship.relationshipSide = relationship.ownerSide ? 'left' : 'right';
            } else {
              // Missing ownerSide (one-to-many/many-to-one relationships) depends on the otherSide existence.
              const unidirectionalRelationship = !relationship.otherEntityRelationshipName;
              const bidirectionalOneToManySide = !unidirectionalRelationship && relationship.relationshipType === 'one-to-many';
              relationship.relationshipSide = unidirectionalRelationship || bidirectionalOneToManySide ? 'left' : 'right';
            }
          }

          relationship.otherEntityName = lowerFirst(otherEntityName);
          if (relationship.relationshipName === undefined) {
            relationship.relationshipName = relationship.otherEntityName;
            this.log.warn(
              `relationshipName is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(
                relationship,
              )}, using ${relationship.otherEntityName} as fallback`,
            );
          }
        });
        entityStorage.save();
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.configuringEachEntity;
  }

  get loadingEntities() {
    return this.asLoadingEntitiesTaskGroup({
      loadUser({ application, entitiesToLoad }) {
        if (application.generateBuiltInUserEntity) {
          const User = 'User';

          const customUser = entitiesToLoad.find(entityToLoad => entityToLoad.entityName === User);
          const bootstrap = customUser?.entityBootstrap;
          if (!bootstrap) {
            throw new Error('User entity should already be passed.');
          }

          const customUserData: any = customUser?.entityStorage.getAll() ?? {};
          Object.assign(bootstrap, createUserEntity.call(this as any, { ...customUserData, ...customUserData.annotations }, application));
          application.user = bootstrap;
        }
      },
      loadUserManagement({ application, entitiesToLoad }) {
        if (application.generateBuiltInUserEntity && application.generateUserManagement) {
          const UserManagement = 'UserManagement';
          const customUserManagement = entitiesToLoad.find(entityToLoad => entityToLoad.entityName === UserManagement);
          const bootstrap = customUserManagement?.entityBootstrap;
          if (!bootstrap) {
            throw new Error('UserManagement entity should already be passed.');
          }

          const customUserManagementData: any = customUserManagement?.entityStorage.getAll() ?? {};
          Object.assign(
            bootstrap,
            createUserManagementEntity.call(
              this as any,
              { ...customUserManagementData, ...customUserManagementData.annotations },
              application as ApplicationAll,
            ),
          );
          application.userManagement = bootstrap;
        }
      },
      loadAuthority({ application, entitiesToLoad }) {
        if (application.generateBuiltInAuthorityEntity) {
          const authority = 'Authority';

          const customEntity = entitiesToLoad.find(entityToLoad => entityToLoad.entityName === authority);
          const bootstrap = customEntity?.entityBootstrap;
          if (!bootstrap) {
            throw new Error('Authority entity should already be passed.');
          }

          const customEntityData: any = customEntity?.entityStorage.getAll() ?? {};
          Object.assign(
            bootstrap,
            createAuthorityEntity.call(this as any, { ...customEntityData, ...customEntityData.annotations }, application as any),
          );
          application.authority = bootstrap;
        }
      },
      loadingEntities({ application, entitiesToLoad }) {
        for (const { entityName, entityBootstrap, entityStorage } of entitiesToLoad) {
          if (!entityBootstrap.builtIn) {
            let entity = entityStorage.getAll() as any;
            entity.name = entity.name ?? entityName;
            entity = { ...entity, ...entity.annotations };
            Object.assign(entityBootstrap, entity);
          }
        }

        const entities = entitiesToLoad.map(({ entityBootstrap }) => entityBootstrap);
        loadEntitiesAnnotations(entities);
        this.validateResult(loadEntitiesOtherSide(entities, { application }));

        for (const entity of entities) {
          if (!entity.builtIn) {
            const invalidRelationship = entity.relationships.find(
              ({ otherEntity }) => !otherEntity.builtIn && entity.microserviceName !== otherEntity.microserviceName,
            );
            if (invalidRelationship) {
              throw new Error(
                `Microservice entities cannot have relationships with entities from other microservice: '${entity.name}.${invalidRelationship.relationshipName}'`,
              );
            }
          }

          for (const field of entity.fields) {
            if (isFieldBinaryType(field)) {
              if (isFieldBlobType(field)) {
                field.fieldTypeBlobContent ??= getBlobContentType(field.fieldType);
              }
              if (application.databaseTypeCassandra || entity.databaseType === 'cassandra') {
                // @ts-expect-error set another type
                field.fieldType = 'ByteBuffer';
              } else if (isFieldBlobType(field)) {
                field.fieldType = 'byte[]' as any;
              }
            }
          }
          for (const relationship of entity.relationships) {
            if (relationship.ownerSide === undefined) {
              // ownerSide backward compatibility
              relationship.ownerSide =
                relationship.relationshipType === 'many-to-one' ||
                (relationship.relationshipType !== 'one-to-many' && relationship.relationshipSide === 'left');
            }
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.loadingEntities;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      async preparingEachEntity({ application, entity }) {
        await addFakerToEntity(entity, application.nativeLanguage);
        prepareEntityForTemplates(entity, this, application);
      },
      preparePrimaryKey({ entity, application }) {
        // If primaryKey doesn't exist, create it.
        if (!entity.embedded && !entity.primaryKey) {
          prepareEntityPrimaryKeyForTemplates.call(this, { entity: entity as any, application });
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareFieldsForTemplates({ entity, field }) {
        prepareCommonFieldForTemplates(entity, field, this);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationshipsForTemplates({ entity, relationship }) {
        prepareRelationship.call(this, entity, relationship);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      hasRequiredRelationship({ entity }) {
        entity.anyRelationshipIsRequired = entity.relationships.some(rel => rel.relationshipRequired || rel.id);
      },
      checkForCircularRelationships({ entity }) {
        const detectCyclicRequiredRelationship = (entity: BaseApplicationEntity, relatedEntities: Set<BaseApplicationEntity>): boolean => {
          if (relatedEntities.has(entity)) return true;
          relatedEntities.add(entity);
          return entity.relationships
            ?.filter(rel => rel.relationshipRequired || rel.id)
            .some(rel => detectCyclicRequiredRelationship(rel.otherEntity, new Set([...relatedEntities])));
        };
        entity.hasCyclicRequiredRelationship = detectCyclicRequiredRelationship(entity, new Set());
      },
      processEntityPrimaryKeysDerivedProperties({ entity }) {
        if (!entity.primaryKey) return;
        derivedPrimaryKeyProperties(entity.primaryKey);
      },
      processDerivedPrimaryKeyFields({ entity }) {
        const primaryKey = entity.primaryKey;
        if (!primaryKey || primaryKey.composite || !primaryKey.derived) {
          return;
        }
        // derivedPrimary uses '@MapsId', which requires for each relationship id field to have corresponding field in the model
        const derivedFields = primaryKey.derivedFields;
        entity.fields.unshift(...derivedFields!);
      },
      prepareEntityDerivedProperties({ entity }) {
        preparePostEntityCommonDerivedProperties(entity);
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }

  get default() {
    return this.asDefaultTaskGroup({
      /**
       * Avoid having undefined keys in the application object when redering ejs templates
       */
      async loadApplicationKeys({ application }) {
        if (this.options.commandsConfigs) {
          // Load keys passed from cli
          loadCommandConfigsKeysIntoTemplatesContext({
            templatesContext: application,
            commandsConfigs: this.options.commandsConfigs,
          });
        }
        // Load keys from main generators
        loadCommandConfigsKeysIntoTemplatesContext({
          templatesContext: application,
          commandsConfigs: await lookupCommandsConfigs(),
        });
      },
      hasNonBuiltInEntity({ application, entities }) {
        application.hasNonBuiltInEntity = entities.filter(e => !e.builtIn).length > 0;
      },
      task({ application }) {
        const packageJsonFiles = [this.destinationPath('package.json')];
        if (application.clientRootDir) {
          packageJsonFiles.push(this.destinationPath(`${application.clientRootDir}package.json`));
        }
        const isPackageJson = (file: MemFsEditorFile): boolean => packageJsonFiles.includes(file.path);
        const populateNullValues = (dependencies: Record<string, string | null>) => {
          if (!dependencies) return;
          for (const key of Object.keys(dependencies)) {
            if (dependencies[key] === null && application.nodeDependencies[key]) {
              dependencies[key] = application.nodeDependencies[key];
            }
          }
        };
        this.queueTransformStream(
          {
            name: 'updating package.json dependencies versions',
            filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isPackageJson(file),
            refresh: false,
          },
          passthrough(file => {
            const contents = file.contents.toString();
            if (contents.includes('null')) {
              const content = JSON.parse(file.contents.toString());
              populateNullValues(content.dependencies);
              populateNullValues(content.devDependencies);
              populateNullValues(content.peerDependencies);
              file.contents = Buffer.from(`${JSON.stringify(content, null, 2)}\n`);
            }
          }),
        );
      },
      postPreparingEntities({ entities }) {
        preparePostEntitiesCommonDerivedProperties(entities);
      },
      checkProperties({ entities }) {
        for (const entity of entities) {
          const properties = [...entity.fields.map(entity => entity.propertyName), ...entity.relationships.map(rel => rel.propertyName)];
          if (new Set(properties).size !== properties.length) {
            // Has duplicated properties.
            const duplicated = [...new Set(properties.filter((v, i, a) => a.indexOf(v) !== i))];
            throw new Error(`You have duplicate properties in entity ${entity.name}: ${duplicated.join(', ')}`);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }

  /**
   * Return the user home
   */
  getUserHome() {
    return process.env[isWin32 ? 'USERPROFILE' : 'HOME'];
  }

  printDestinationInfo(cwd = this.destinationPath()) {
    this.log.log(
      chalk.green(' _______________________________________________________________________________________________________________\n'),
    );
    this.log.log(
      chalk.white(`  Documentation for creating an application is at ${chalk.yellow('https://www.jhipster.tech/creating-an-app/')}

  Application files will be generated in folder: ${chalk.yellow(cwd)}`),
    );
    if (process.cwd() === this.getUserHome()) {
      this.log.log(chalk.red.bold('\n️⚠️  WARNING ⚠️  You are in your HOME folder!'));
      this.log.log(chalk.red('This can cause problems, you should always create a new directory and run the jhipster command from here.'));
      this.log.log(chalk.white(`See the troubleshooting section at ${chalk.yellow('https://www.jhipster.tech/installation/')}`));
    }
    this.log.log(
      chalk.green(' _______________________________________________________________________________________________________________\n'),
    );
  }
}
