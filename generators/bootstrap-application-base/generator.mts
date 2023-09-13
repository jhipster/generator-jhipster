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
import assert from 'assert';
import os from 'os';
import _ from 'lodash';
import chalk from 'chalk';
import { passthrough } from '@yeoman/transform';

import BaseApplicationGenerator from '../base-application/index.mjs';
import {
  addFakerToEntity,
  loadEntitiesAnnotations,
  loadEntitiesOtherSide,
  stringifyApplicationData,
  prepareEntity as prepareEntityForTemplates,
  prepareField as prepareFieldForTemplates,
  prepareRelationship,
} from '../base-application/support/index.mjs';
import { createUserEntity } from './utils.mjs';
import { DOCKER_DIR } from '../generator-constants.mjs';
import { GENERATOR_BOOTSTRAP, GENERATOR_COMMON, GENERATOR_PROJECT_NAME } from '../generator-list.mjs';
import { packageJson } from '../../lib/index.mjs';
import { loadLanguagesConfig } from '../languages/support/index.mjs';
import { loadAppConfig, loadDerivedAppConfig, loadStoredAppOptions } from '../app/support/index.mjs';

const isWin32 = os.platform() === 'win32';

const { lowerFirst } = _;

export default class BootstrapApplicationBase extends BaseApplicationGenerator {
  constructor(args: any, options: any, features: any) {
    super(args, options, { jhipsterBootstrap: false, ...features });

    if (this.options.help) return;

    loadStoredAppOptions.call(this);
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    await this.composeWithJHipster(GENERATOR_BOOTSTRAP);
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      displayLogo() {
        this.printDestinationInfo();
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
      prepareApplication({ application }) {
        loadDerivedAppConfig({ application });

        application.nodePackageManager = 'npm';
        application.dockerServicesDir = DOCKER_DIR;

        // TODO v8 drop the following variables
        const anyApplication = application as any;

        anyApplication.clientPackageManager = application.nodePackageManager;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      configureEntity({ entityStorage, entityConfig }) {
        entityStorage.defaults({ fields: [], relationships: [] });

        if (entityConfig.changelogDate === undefined) {
          entityConfig.changelogDate = this.dateFormatForLiquibase();
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
          if (this.sharedData.hasEntity('User')) {
            throw new Error("Fail to bootstrap 'User', already exists.");
          }

          const customUser = entitiesToLoad.find(entityToLoad => entityToLoad.entityName === 'User');
          const customUserData = customUser ? customUser.entityStorage.getAll() : {};
          const user = createUserEntity.call(this, customUserData, application);
          this.sharedData.setEntity('User', user);
          (application as any).user = user;
        }
      },
      loadingEntities({ entitiesToLoad }) {
        for (const { entityName, entityStorage } of entitiesToLoad) {
          if (this.sharedData.hasEntity(entityName)) {
            const existingEntity = this.sharedData.getEntity(entityName);
            if (!existingEntity.builtIn) {
              throw new Error(`Fail to bootstrap '${entityName}', already exists.`);
            }
          } else {
            const entity = entityStorage.getAll();
            entity.name = entity.name ?? entityName;
            this.sharedData.setEntity(entityName, entity);
          }
        }

        const entities = this.sharedData.getEntities().map(({ entity }) => entity);
        loadEntitiesAnnotations(entities);
        this.validateResult(loadEntitiesOtherSide(entities));

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

  get default() {
    return this.asDefaultTaskGroup({
      task({ application }) {
        const isPackageJson = file => file.path === this.destinationPath('package.json');
        const populateNullValues = dependencies => {
          if (!dependencies) return;
          for (const key of Object.keys(dependencies)) {
            if (dependencies[key] === null && application.nodeDependencies[key]) {
              dependencies[key] = application.nodeDependencies[key];
            }
          }
        };
        this.queueTransformStream(
          passthrough(file => {
            if (file.contents && isPackageJson(file)) {
              const content = JSON.parse(file.contents.toString());
              populateNullValues(content.dependencies);
              populateNullValues(content.devDependencies);
              populateNullValues(content.peerDependencies);
              file.contents = Buffer.from(`${JSON.stringify(content, null, 2)}\n`);
            }
          }),
          {
            name: 'updating package.json dependency versions',
            streamOptions: { filter: isPackageJson },
          },
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
