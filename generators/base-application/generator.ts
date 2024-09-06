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
import { upperFirst } from 'lodash-es';
import type { ComposeOptions, Storage } from 'yeoman-generator';

import BaseGenerator from '../base/index.js';
import { JHIPSTER_CONFIG_DIR } from '../generator-constants.js';
import type { JHipsterGeneratorFeatures, JHipsterGeneratorOptions } from '../base/api.js';
import { mutateData } from '../../lib/utils/object.js';
import {
  GENERATOR_BOOTSTRAP_APPLICATION,
  GENERATOR_BOOTSTRAP_APPLICATION_BASE,
  GENERATOR_BOOTSTRAP_APPLICATION_CLIENT,
  GENERATOR_BOOTSTRAP_APPLICATION_SERVER,
} from '../generator-list.js';
import type { TaskTypes as DefaultTaskTypes } from '../../lib/types/application/tasks.js';
import type { ApplicationType } from '../../lib/types/application/application.js';
import type { Entity } from '../../lib/types/application/entity.js';
import type { GenericTaskGroup } from '../../lib/types/base/tasks.js';
import { getEntitiesFromDir } from './support/index.js';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES, QUEUES } from './priorities.js';

const {
  LOADING,
  PREPARING,
  POST_PREPARING,
  CONFIGURING_EACH_ENTITY,
  LOADING_ENTITIES,
  PREPARING_EACH_ENTITY,
  PREPARING_EACH_ENTITY_FIELD,
  PREPARING_EACH_ENTITY_RELATIONSHIP,
  POST_PREPARING_EACH_ENTITY,
  DEFAULT,
  WRITING,
  POST_WRITING,
  WRITING_ENTITIES,
  POST_WRITING_ENTITIES,
  PRE_CONFLICTS,
  INSTALL,
  END,
} = PRIORITY_NAMES;

const {
  CONFIGURING_EACH_ENTITY_QUEUE,
  LOADING_ENTITIES_QUEUE,
  PREPARING_EACH_ENTITY_QUEUE,
  PREPARING_EACH_ENTITY_FIELD_QUEUE,
  PREPARING_EACH_ENTITY_RELATIONSHIP_QUEUE,
  POST_PREPARING_EACH_ENTITY_QUEUE,
  WRITING_ENTITIES_QUEUE,
  POST_WRITING_ENTITIES_QUEUE,
} = QUEUES;

const asPriority = BaseGenerator.asPriority;

/**
 * This is the base class for a generator that generates entities.
 */
export default class BaseApplicationGenerator<
  E = Entity,
  A = ApplicationType<E>,
  TaskTypes extends DefaultTaskTypes<any, any> = DefaultTaskTypes<E, A>,
> extends BaseGenerator<TaskTypes> {
  static CONFIGURING_EACH_ENTITY = asPriority(CONFIGURING_EACH_ENTITY);

  static LOADING_ENTITIES = asPriority(LOADING_ENTITIES);

  static PREPARING_EACH_ENTITY = asPriority(PREPARING_EACH_ENTITY);

  static PREPARING_EACH_ENTITY_FIELD = asPriority(PREPARING_EACH_ENTITY_FIELD);

  static PREPARING_EACH_ENTITY_RELATIONSHIP = asPriority(PREPARING_EACH_ENTITY_RELATIONSHIP);

  static POST_PREPARING_EACH_ENTITY = asPriority(POST_PREPARING_EACH_ENTITY);

  static WRITING_ENTITIES = asPriority(WRITING_ENTITIES);

  static POST_WRITING_ENTITIES = asPriority(POST_WRITING_ENTITIES);

  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, features);

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);

    /* Add tasks allowing entities priorities to match normal priorities pattern */
    this.on('queueOwnTasks', () => {
      this.log.debug('Queueing entity tasks');
      this.queueEntityTasks();
    });

    if (this.options.applicationWithEntities) {
      this.log.warn('applicationWithEntities option is deprecated');
      // Write new definitions to memfs
      this.config.set({
        ...this.config.getAll(),
        ...this.options.applicationWithEntities.config,
      });
      if (this.options.applicationWithEntities.entities) {
        const entities = this.options.applicationWithEntities.entities.map(entity => {
          const entityName = upperFirst(entity.name);
          const file = this.getEntityConfigPath(entityName);
          this.fs.writeJSON(file, { ...this.fs.readJSON(file), ...entity });
          return entityName;
        });
        this.jhipsterConfig.entities = [...new Set((this.jhipsterConfig.entities || []).concat(entities))];
      }
      delete this.options.applicationWithEntities;
    }
  }

  dependsOnBootstrapApplication(options?: ComposeOptions | undefined) {
    return this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION, options);
  }

  dependsOnBootstrapApplicationBase(options?: ComposeOptions | undefined) {
    return this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_BASE, options);
  }

  dependsOnBootstrapApplicationServer(options?: ComposeOptions | undefined) {
    return this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER, options);
  }

  dependsOnBootstrapApplicationClient(options?: ComposeOptions | undefined) {
    return this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_CLIENT, options);
  }

  /**
   * Get Entities configuration path
   * @returns
   */
  getEntitiesConfigPath(...args) {
    return this.destinationPath(JHIPSTER_CONFIG_DIR, ...args);
  }

  /**
   * Get Entity configuration path
   * @param entityName Entity name
   * @returns
   */
  getEntityConfigPath(entityName: string) {
    return this.getEntitiesConfigPath(`${upperFirst(entityName)}.json`);
  }

  /**
   * Get all the generator configuration from the .yo-rc.json file
   * @param entityName - Name of the entity to load.
   * @param create - Create storage if doesn't exists.
   */
  getEntityConfig(entityName: string, create = false): Storage | undefined {
    const entityPath = this.getEntityConfigPath(entityName);
    if (!create && !this.fs.exists(entityPath)) return undefined;
    return this.createStorage(entityPath);
  }

  /**
   * get sorted list of entity names according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntityNames(): string[] {
    return this.getExistingEntities().map(entity => entity.name);
  }

  /**
   * get sorted list of entities according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntities(): { name: string; definition: Record<string, any> }[] {
    function isBefore(e1, e2) {
      return (e1.definition.annotations?.changelogDate ?? 0) - (e2.definition.annotations?.changelogDate ?? 0);
    }

    const configDir = this.getEntitiesConfigPath();

    const entities: { name: string; definition: Record<string, any> }[] = [];
    for (const entityName of [...new Set(((this.jhipsterConfig.entities as string[]) || []).concat(getEntitiesFromDir(configDir)))]) {
      const definition = this.getEntityConfig(entityName)?.getAll();
      if (definition) {
        entities.push({ name: entityName, definition });
      }
    }
    entities.sort(isBefore);
    this.jhipsterConfig.entities = entities.map(({ name }) => name);
    return entities;
  }

  /**
   * Priority API stub for blueprints.
   *
   * Configuring each entity should configure entities.
   */
  get configuringEachEntity() {
    return {};
  }

  get preparingEachEntity() {
    return {};
  }

  /**
   * Priority API stub for blueprints.
   */
  get preparingEachEntityField() {
    return {};
  }

  /**
   * Priority API stub for blueprints.
   */
  get preparingEachEntityRelationship() {
    return {};
  }

  /**
   * Priority API stub for blueprints.
   */
  get postPreparingEachEntity() {
    return {};
  }

  /**
   * Priority API stub for blueprints.
   */
  get writingEntities() {
    return {};
  }

  /**
   * Priority API stub for blueprints.
   */
  get postWritingEntities() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asConfiguringEachEntityTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['ConfiguringEachEntityTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['ConfiguringEachEntityTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asLoadingEntitiesTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['LoadingEntitiesTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['LoadingEntitiesTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PreparingEachEntityTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PreparingEachEntityTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityFieldTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PreparingEachEntityFieldTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PreparingEachEntityFieldTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityRelationshipTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PreparingEachEntityRelationshipTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PreparingEachEntityRelationshipTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostPreparingEachEntityTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PostPreparingEachEntityTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PostPreparingEachEntityTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asWritingEntitiesTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['WritingEntitiesTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['WritingEntitiesTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostWritingEntitiesTaskGroup<const K extends string>(
    taskGroup: GenericTaskGroup<this, TaskTypes['PostWritingEntitiesTaskParam'], K>,
  ): GenericTaskGroup<any, TaskTypes['PostWritingEntitiesTaskParam'], K> {
    return taskGroup;
  }

  /**
   * Reset entities fake data seed.
   * @param {string} seed
   */
  resetEntitiesFakeData(seed) {
    seed = `${this.sharedData.getApplication().baseName}-${seed}`;
    this.log.debug(`Resetting entities seed with '${seed}'`);
    this.sharedData.getEntities().forEach(({ entity }) => {
      entity.resetFakerSeed(seed);
    });
  }

  getArgsForPriority(priorityName): any[] {
    const args = super.getArgsForPriority(priorityName);
    let firstArg = this.getTaskFirstArgForPriority(priorityName);
    if (args.length > 0) {
      firstArg = { ...args[0], ...firstArg };
    }
    return [firstArg];
  }

  /**
   * @protected
   */
  protected getTaskFirstArgForPriority(priorityName): any {
    if (
      ![
        LOADING,
        PREPARING,
        POST_PREPARING,

        CONFIGURING_EACH_ENTITY,
        LOADING_ENTITIES,
        PREPARING_EACH_ENTITY,
        PREPARING_EACH_ENTITY_FIELD,
        PREPARING_EACH_ENTITY_RELATIONSHIP,
        POST_PREPARING_EACH_ENTITY,

        DEFAULT,
        WRITING,
        WRITING_ENTITIES,
        POST_WRITING,
        POST_WRITING_ENTITIES,
        PRE_CONFLICTS,
        INSTALL,
        END,
      ].includes(priorityName)
    ) {
      return {};
    }
    if (!this.jhipsterConfig.baseName) {
      throw new Error(`BaseName (${this.jhipsterConfig.baseName}) application not available for priority ${priorityName}`);
    }
    const application = this.sharedData.getApplication();

    if ([PREPARING, LOADING].includes(priorityName)) {
      return {
        application,
        applicationDefaults: data => mutateData(application, { __override__: false, ...data }),
      };
    }
    if (LOADING_ENTITIES === priorityName) {
      return {
        application,
        entitiesToLoad: this.getEntitiesDataToLoad(),
      };
    }
    if ([DEFAULT].includes(priorityName)) {
      return {
        application,
        ...this.getEntitiesDataForPriorities(),
      };
    }
    if ([WRITING_ENTITIES, POST_WRITING_ENTITIES].includes(priorityName)) {
      const applicationAndEntities = {
        application,
        ...this.getEntitiesDataToWrite(),
      };
      if (priorityName === WRITING_ENTITIES) {
        return applicationAndEntities;
      }
      return {
        ...applicationAndEntities,
        source: this.sharedData.getSource(),
      };
    }

    return { application };
  }

  /**
   * @private
   * Get entities to configure.
   * This method doesn't filter entities. An filtered config can be changed at this priority.
   * @returns {string[]}
   */
  getEntitiesDataToConfigure() {
    return this.getExistingEntityNames().map(entityName => {
      const entityStorage = this.getEntityConfig(entityName, true);
      return { entityName, entityStorage, entityConfig: entityStorage!.createProxy() };
    });
  }

  /**
   * @private
   * Get entities to load.
   * This method doesn't filter entities. An filtered config can be changed at this priority.
   * @returns {string[]}
   */
  getEntitiesDataToLoad() {
    const application = this.sharedData.getApplication();
    const builtInEntities: string[] = [];
    if (application.generateBuiltInUserEntity) {
      // Reorder User entity to be the first one to be loaded
      builtInEntities.push('User');
    }
    if (application.generateBuiltInUserEntity && application.generateUserManagement) {
      // Reorder User entity to be the first one to be loaded
      builtInEntities.push('UserManagement');
    }
    if (application.generateBuiltInAuthorityEntity) {
      // Reorder User entity to be the first one to be loaded
      builtInEntities.push('Authority');
    }
    const entitiesToLoad = [...new Set([...builtInEntities, ...this.getExistingEntityNames()])];
    return entitiesToLoad.map(entityName => {
      const generator = this;
      if (!this.sharedData.hasEntity(entityName)) {
        this.sharedData.setEntity(entityName, { name: entityName });
      }
      const entityBootstrap = this.sharedData.getEntity(entityName);
      return {
        entityName,
        get entityStorage() {
          return generator.getEntityConfig(entityName, true);
        },
        get entityConfig() {
          return generator.getEntityConfig(entityName, true)!.createProxy();
        },
        entityBootstrap,
      };
    });
  }

  /**
   * @private
   * Get entities to prepare.
   * @returns {object[]}
   */
  getEntitiesDataToPrepare() {
    return this.sharedData.getEntities().map(({ entityName, ...data }) => ({
      description: entityName,
      entityName,
      ...data,
    }));
  }

  /**
   * @private
   * Get entities and fields to prepare.
   * @returns {object[]}
   */
  getEntitiesFieldsDataToPrepare() {
    return this.getEntitiesDataToPrepare()
      .map(({ entity, entityName, ...data }) => {
        if (!entity.fields) return [];

        return entity.fields.map(field => ({
          entity,
          entityName,
          ...data,
          field,
          fieldName: field.fieldName,
          description: `${entityName}#${field.fieldName}`,
        }));
      })
      .flat();
  }

  /**
   * @private
   * Get entities and relationships to prepare.
   * @returns {object[]}
   */
  getEntitiesRelationshipsDataToPrepare() {
    return this.getEntitiesDataToPrepare()
      .map(({ entity, entityName, ...data }) => {
        if (!entity.relationships) return [];

        return entity.relationships.map(relationship => ({
          entity,
          entityName,
          ...data,
          relationship,
          relationshipName: relationship.relationshipName,
          description: `${entityName}#${relationship.relationshipName}`,
        }));
      })
      .flat();
  }

  /**
   * @private
   * Get entities to post prepare.
   * @returns {object[]}
   */
  getEntitiesDataToPostPrepare() {
    return this.getEntitiesDataToPrepare();
  }

  /**
   * @private
   * Get entities to write.
   * @returns {object[]}
   */
  getEntitiesDataForPriorities() {
    const entitiesDefinitions = this.sharedData.getEntities();
    return { entities: entitiesDefinitions.map(({ entity }) => entity) };
  }

  /**
   * @private
   * Get entities to write.
   * @returns {object[]}
   */
  getEntitiesDataToWrite() {
    const { entities = [] } = this.options;
    const data = this.getEntitiesDataForPriorities();
    if (entities.length === 0) return data;
    const filteredEntities = data.entities.filter(entity => entities.includes(entity.name));
    return { ...data, entities: filteredEntities };
  }

  /**
   * @private
   * Queue entity tasks.
   */
  queueEntityTasks() {
    this.queueTask({
      queueName: CONFIGURING_EACH_ENTITY_QUEUE,
      taskName: 'queueConfiguringEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(CONFIGURING_EACH_ENTITY)) return;
        this.log.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(CONFIGURING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToConfigure().forEach(({ entityName, entityStorage, entityConfig }) => {
          this.log.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY} for ${entityName}`);
          const args = this.getArgsForPriority(CONFIGURING_EACH_ENTITY);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...args[0], entityName, entityStorage, entityConfig }],
            });
          });
        });
      },
    } as any);

    this.queueTask({
      queueName: LOADING_ENTITIES_QUEUE,
      taskName: 'queueLoadingEntities',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(LOADING_ENTITIES)) return;
        this.log.debug(`Queueing entity tasks ${LOADING_ENTITIES}`);
        const tasks = this.extractTasksFromPriority(LOADING_ENTITIES, { skip: false });
        this.log.debug(`Queueing entity tasks ${LOADING_ENTITIES}`);
        const args = this.getArgsForPriority(LOADING_ENTITIES);
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args,
          });
        });
      },
    } as any);

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_QUEUE,
      taskName: 'queuePreparingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(PREPARING_EACH_ENTITY)) return;
        this.log.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToPrepare().forEach(({ description, ...data }) => {
          this.log.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY} for ${description}`);
          const args = this.getArgsForPriority(PREPARING_EACH_ENTITY);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...args[0], description, ...data }],
            });
          });
        });
      },
    } as any);

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_FIELD_QUEUE,
      taskName: 'queuePreparingEachEntityField',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(PREPARING_EACH_ENTITY_FIELD)) return;
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_FIELD, { skip: false });
        this.getEntitiesFieldsDataToPrepare().forEach(({ description, ...data }) => {
          this.log.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY_FIELD} for ${description}`);
          const args = this.getArgsForPriority(PREPARING_EACH_ENTITY_FIELD);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...args[0], description, ...data }],
            });
          });
        });
      },
    } as any);

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_RELATIONSHIP_QUEUE,
      taskName: 'queuePreparingEachEntityRelationship',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(PREPARING_EACH_ENTITY_RELATIONSHIP)) return;
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_RELATIONSHIP, { skip: false });
        this.getEntitiesRelationshipsDataToPrepare().forEach(({ description, ...data }) => {
          this.log.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY_RELATIONSHIP} for ${description}`);
          const args = this.getArgsForPriority(PREPARING_EACH_ENTITY_RELATIONSHIP);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...args[0], description, ...data }],
            });
          });
        });
      },
    } as any);

    this.queueTask({
      queueName: POST_PREPARING_EACH_ENTITY_QUEUE,
      taskName: 'queuePostPreparingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(POST_PREPARING_EACH_ENTITY)) return;
        const tasks = this.extractTasksFromPriority(POST_PREPARING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToPostPrepare().forEach(({ description, ...data }) => {
          this.log.debug(`Queueing entity tasks ${POST_PREPARING_EACH_ENTITY} for ${description}`);
          const args = this.getArgsForPriority(POST_PREPARING_EACH_ENTITY);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...args[0], description, ...data }],
            });
          });
        });
      },
    } as any);

    this.queueTask({
      queueName: WRITING_ENTITIES_QUEUE,
      taskName: 'queueWritingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipWriting || this.options.skipPriorities?.includes(WRITING_ENTITIES)) return;
        const tasks = this.extractTasksFromPriority(WRITING_ENTITIES, { skip: false });
        const args = this.getArgsForPriority(WRITING_ENTITIES);
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args,
          });
        });
      },
    } as any);

    this.queueTask({
      queueName: POST_WRITING_ENTITIES_QUEUE,
      taskName: 'queuePostWritingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipWriting || this.options.skipPriorities?.includes(POST_WRITING_ENTITIES)) return;
        const tasks = this.extractTasksFromPriority(POST_WRITING_ENTITIES, { skip: false });
        const args = this.getArgsForPriority(POST_WRITING_ENTITIES);
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args,
          });
        });
      },
    } as any);
  }
}
