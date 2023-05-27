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
import _ from 'lodash';
import type { Storage } from 'yeoman-generator';

import BaseGenerator from '../base/index.mjs';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES, QUEUES } from './priorities.mjs';
import { JHIPSTER_CONFIG_DIR } from '../generator-constants.mjs';
import type { BaseApplicationGeneratorDefinition, GenericApplicationDefinition } from './tasks.mjs';
import { GenericTaskGroup, GenericSourceTypeDefinition } from '../base/tasks.mjs';
import type { BaseApplication } from './types.mjs';
import { getEntitiesFromDir } from './support/index.mjs';
import { SpringBootSourceType } from '../server/types.mjs';
import type { CommonClientServerApplication } from './types.mjs';

const { upperFirst } = _;

const {
  LOADING,
  PREPARING,
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

export type BaseApplicationSource = Record<string, (...args: any[]) => any> & SpringBootSourceType;

export type JHipsterApplication = BaseApplication & Partial<CommonClientServerApplication>;

export type GeneratorDefinition = BaseApplicationGeneratorDefinition<
  GenericApplicationDefinition<JHipsterApplication> & GenericSourceTypeDefinition<BaseApplicationSource>
>;

/**
 * This is the base class for a generator that generates entities.
 */
export default class BaseApplicationGenerator<
  Definition extends BaseApplicationGeneratorDefinition<{
    applicationType: any;
    entityType: any;
    sourceType: any;
  }> = GeneratorDefinition
> extends BaseGenerator<Definition> {
  static CONFIGURING_EACH_ENTITY = asPriority(CONFIGURING_EACH_ENTITY);

  static LOADING_ENTITIES = asPriority(LOADING_ENTITIES);

  static PREPARING_EACH_ENTITY = asPriority(PREPARING_EACH_ENTITY);

  static PREPARING_EACH_ENTITY_FIELD = asPriority(PREPARING_EACH_ENTITY_FIELD);

  static PREPARING_EACH_ENTITY_RELATIONSHIP = asPriority(PREPARING_EACH_ENTITY_RELATIONSHIP);

  static POST_PREPARING_EACH_ENTITY = asPriority(POST_PREPARING_EACH_ENTITY);

  static WRITING_ENTITIES = asPriority(WRITING_ENTITIES);

  static POST_WRITING_ENTITIES = asPriority(POST_WRITING_ENTITIES);

  constructor(args, options, features) {
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
      // Write new definitions to memfs
      this.config.set({
        ...this.config.getAll(),
        ...this.options.applicationWithEntities.config,
      });
      if (this.options.applicationWithEntities.entities) {
        const entities = this.options.applicationWithEntities.entities.map(entity => {
          const entityName = _.upperFirst(entity.name);
          const file = this.destinationPath(JHIPSTER_CONFIG_DIR, `${entityName}.json`);
          this.fs.writeJSON(file, { ...this.fs.readJSON(file), ...entity });
          return entityName;
        });
        this.jhipsterConfig.entities = [...new Set((this.jhipsterConfig.entities || []).concat(entities))];
      }
      delete this.options.applicationWithEntities;
    }
  }

  /**
   * Get Entity configuration path
   * @param entityName Entity name
   * @returns
   */
  getEntityConfigPath(entityName: string) {
    return this.destinationPath(JHIPSTER_CONFIG_DIR, `${upperFirst(entityName)}.json`);
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
   * get sorted list of entitiy names according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntityNames(): string[] {
    return this.getExistingEntities().map(entity => entity.name);
  }

  /**
   * get sorted list of entities according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntities(): { name: string; definition: Record<string, any> }[] {
    function isBefore(e1, e2) {
      return e1.definition.changelogDate - e2.definition.changelogDate;
    }

    const configDir = this.destinationPath(JHIPSTER_CONFIG_DIR);

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
  get configuringEachEntity(): GenericTaskGroup<this, Definition['configuringEachEntityTaskParam']> {
    return this.asConfiguringEachEntityTaskGroup({});
  }

  get preparingEachEntity(): GenericTaskGroup<this, Definition['preparingEachEntityTaskParam']> {
    return this.asPreparingEachEntityTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get preparingEachEntityField(): GenericTaskGroup<this, Definition['preparingEachEntityFieldTaskParam']> {
    return this.asPreparingEachEntityFieldTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get preparingEachEntityRelationship(): GenericTaskGroup<this, Definition['preparingEachEntityRelationshipTaskParam']> {
    return this.asPreparingEachEntityRelationshipTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get postPreparingEachEntity(): GenericTaskGroup<this, Definition['postPreparingEachEntityTaskParam']> {
    return this.asPostPreparingEachEntityTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get writingEntities(): GenericTaskGroup<this, Definition['writingEntitiesTaskParam']> {
    return this.asWritingEntitiesTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get postWritingEntities(): GenericTaskGroup<this, Definition['postWritingEntitiesTaskParam']> {
    return this.asPostWritingEntitiesTaskGroup({});
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asConfiguringEachEntityTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['configuringEachEntityTaskParam']>
  ): GenericTaskGroup<this, Definition['configuringEachEntityTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asLoadingEntitiesTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['loadingEntitiesTaskParam']>
  ): GenericTaskGroup<this, Definition['loadingEntitiesTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['preparingEachEntityTaskParam']>
  ): GenericTaskGroup<this, Definition['preparingEachEntityTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityFieldTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['preparingEachEntityFieldTaskParam']>
  ): GenericTaskGroup<this, Definition['preparingEachEntityFieldTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityRelationshipTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['preparingEachEntityRelationshipTaskParam']>
  ): GenericTaskGroup<this, Definition['preparingEachEntityRelationshipTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostPreparingEachEntityTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['postPreparingEachEntityTaskParam']>
  ): GenericTaskGroup<this, Definition['postPreparingEachEntityTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asWritingEntitiesTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['writingEntitiesTaskParam']>
  ): GenericTaskGroup<this, Definition['writingEntitiesTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostWritingEntitiesTaskGroup(
    taskGroup: GenericTaskGroup<this, Definition['postWritingEntitiesTaskParam']>
  ): GenericTaskGroup<this, Definition['postWritingEntitiesTaskParam']> {
    return taskGroup;
  }

  /**
   * Reset entities fake data seed.
   * @param {string} seed
   */
  resetEntitiesFakeData(seed) {
    seed = `${this.sharedData.getApplication().baseName}-${seed}`;
    this.log.debug(`Reseting entities seed with '${seed}'`);
    this.sharedData.getEntities().forEach(({ entity }) => {
      entity.resetFakerSeed(seed);
    });
  }

  getArgsForPriority(priorityName) {
    const args = super.getArgsForPriority(priorityName);
    let firstArg = this.getTaskFirstArgForPriority(priorityName);
    if (args.length > 0) {
      firstArg = { ...args[0], ...firstArg };
    }
    return [firstArg] as any;
  }

  /**
   * @private
   */
  getTaskFirstArgForPriority(priorityName) {
    if (
      ![
        LOADING,
        PREPARING,

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
   * This method doesn't filter entities. An filtered config can be changed at thie priority.
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
   * This method doesn't filter entities. An filtered config can be changed at thie priority.
   * @returns {string[]}
   */
  getEntitiesDataToLoad() {
    return this.getExistingEntityNames().map(entityName => ({ entityName, entityStorage: this.getEntityConfig(entityName, true) }));
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
        if (this.options.skipWriting) return;
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
        if (this.options.skipWriting) return;
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
