/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import os from 'os';
import { lowerFirst } from 'lodash-es';
import chalk from 'chalk';
import { passthrough } from '@yeoman/transform';

import { isFileStateModified } from 'mem-fs-editor/state';
import BaseApplicationGenerator from '../base-application/index.js';
import {
  addFakerToEntity,
  loadEntitiesAnnotations,
  loadEntitiesOtherSide,
  stringifyApplicationData,
  prepareEntity as prepareEntityForTemplates,
  prepareField as prepareFieldForTemplates,
  prepareRelationship,
} from '../base-application/support/index.js';
import { createAuthorityEntity, createUserEntity, createUserManagementEntity } from './utils.js';
import { JAVA_DOCKER_DIR } from '../generator-constants.js';
import { GENERATOR_BOOTSTRAP, GENERATOR_COMMON, GENERATOR_PROJECT_NAME } from '../generator-list.js';
import { packageJson } from '../../lib/index.js';
import { loadLanguagesConfig } from '../languages/support/index.js';
import { loadAppConfig, loadDerivedAppConfig, loadStoredAppOptions } from '../app/support/index.js';
import { exportJDLTransform, importJDLTransform } from './support/index.js';
import command from './command.js';

const isWin32 = os.platform() === 'win32';

export default class BootstrapApplicationBase extends BaseApplicationGenerator {
  constructor(args: any, options: any, features: any) {
    super(args, options, { jhipsterBootstrap: false, ...features });

    if (this.options.help) return;

    loadStoredAppOptions.call(this);
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    const projectNameGenerator = (await this.dependsOnJHipster(GENERATOR_PROJECT_NAME)) as any;
    projectNameGenerator.javaApplication = true;
    await this.composeWithJHipster(GENERATOR_BOOTSTRAP);
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      displayLogo() {
        this.printDestinationInfo();
      },
      parseOptions() {
        this.parseJHipsterCommand(command);
      },
      async jdlStore() {
        if (this.jhipsterConfig.jdlStore) {
          this.logger.warn('Storing configuration inside a JDL file is experimental');
          this.logger.info(`Using JDL store ${this.jhipsterConfig.jdlStore}`);

          const destinationPath = this.destinationPath();
          const jdlStorePath = this.destinationPath(this.jhipsterConfig.jdlStore);

          this.features.commitTransformFactory = () => exportJDLTransform({ destinationPath, jdlStorePath });
          await this.pipeline({ refresh: true, pendingFiles: false }, importJDLTransform({ destinationPath, jdlStorePath }));
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

  get loading() {
    return this.asLoadingTaskGroup({
      loadApplication({ application, control }) {
        loadAppConfig({
          config: this.jhipsterConfigWithDefaults,
          application,
          useVersionPlaceholders: (this as any).useVersionPlaceholders,
        });
        loadLanguagesConfig({ application, config: this.jhipsterConfigWithDefaults, control });
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
      prepareApplication({ application, applicationDefaults }) {
        loadDerivedAppConfig({ application });

        applicationDefaults({
          nodePackageManager: 'npm',
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

        if (entityConfig.changelogDate) {
          entityConfig.annotations.changelogDate = entityConfig.changelogDate;
          delete entityConfig.changelogDate;
        }
        if (!entityConfig.annotations.changelogDate) {
          entityConfig.annotations.changelogDate = this.dateFormatForLiquibase();
          entityStorage.save();
        }
      },

      configureRelationships({ entityName, entityStorage, entityConfig }) {
        // Validate entity json relationship content
        entityConfig.relationships.forEach((relationship: any) => {
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
          Object.assign(bootstrap!, createUserEntity.call(this, { ...customUserData, ...customUserData.annotations }, application));
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
            bootstrap!,
            createUserManagementEntity.call(this, { ...customUserManagementData, ...customUserManagementData.annotations }, application),
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
            bootstrap!,
            createAuthorityEntity.call(this, { ...customEntityData, ...customEntityData.annotations }, application),
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

        const entities = this.sharedData.getEntities().map(({ entity }) => entity);
        loadEntitiesAnnotations(entities);
        this.validateResult(loadEntitiesOtherSide(entities, { application }));

        for (const entity of entities) {
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
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareFieldsForTemplates({ entity, field }) {
        prepareFieldForTemplates(entity, field, this);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationshipsForTemplates({ entity, relationship }) {
        prepareRelationship(entity, relationship, this);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      checkForCircularRelationships({ entity }) {
        const detectCyclicRequiredRelationship = (entity, relatedEntities) => {
          if (relatedEntities.has(entity)) return true;
          relatedEntities.add(entity);
          return entity.relationships
            ?.filter(rel => rel.relationshipRequired || rel.id)
            .some(rel => detectCyclicRequiredRelationship(rel.otherEntity, new Set([...relatedEntities])));
        };
        entity.hasCyclicRequiredRelationship = detectCyclicRequiredRelationship(entity, new Set());
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      task({ application }) {
        const packageJsonFiles = [this.destinationPath('package.json')];
        if (application.clientRootDir) {
          packageJsonFiles.push(this.destinationPath(`${application.clientRootDir}package.json`));
        }
        const isPackageJson = file => packageJsonFiles.includes(file.path);
        const populateNullValues = dependencies => {
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
