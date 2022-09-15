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
const BaseBlueprintGenerator = require('./generator-base-blueprint');
const { CUSTOM_PRIORITIES_ENTITIES, PRIORITY_NAMES, QUEUES } = require('../lib/constants/priorities.cjs');

const {
  CONFIGURING_EACH_ENTITY,
  LOADING_EACH_ENTITY,
  PREPARING_EACH_ENTITY,
  PREPARING_EACH_ENTITY_FIELD,
  PREPARING_EACH_ENTITY_RELATIONSHIP,
  POST_PREPARING_EACH_ENTITY,
  DEFAULT,
  WRITING_ENTITIES,
  POST_WRITING_ENTITIES,
} = PRIORITY_NAMES;

const {
  CONFIGURING_EACH_ENTITY_QUEUE,
  LOADING_EACH_ENTITY_QUEUE,
  PREPARING_EACH_ENTITY_QUEUE,
  PREPARING_EACH_ENTITY_FIELD_QUEUE,
  PREPARING_EACH_ENTITY_RELATIONSHIP_QUEUE,
  POST_PREPARING_EACH_ENTITY_QUEUE,
  WRITING_ENTITIES_QUEUE,
  POST_WRITING_ENTITIES_QUEUE,
} = QUEUES;

/**
 * This is the base class for a generator that generates entities.
 *
 * @class
 * @extends {BaseBlueprintGenerator}
 */
class JHipsterBaseEntitiesGenerator extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { priorityArgs: true, ...features });

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES_ENTITIES);

    /* Add tasks allowing entities priorities to match normal priorities pattern */
    this.on('queueOwnTasks', () => {
      this.debug('Queueing entity tasks');
      this.queueEntityTasks();
    });
  }

  get configuringEachEntity() {
    return this._configuringEachEntity();
  }

  _configuringEachEntity() {
    return {};
  }

  get preparingEachEntity() {
    return this._preparingEachEntity();
  }

  _preparingEachEntity() {
    return {};
  }

  get preparingEachEntityField() {
    return this._preparingEachEntityField();
  }

  _preparingEachEntityField() {
    return {};
  }

  get preparingEachEntityRelationship() {
    return this._preparingEachEntityRelationship();
  }

  _preparingEachEntityRelationship() {
    return {};
  }

  get writingEachEntity() {
    return this._writingEachEntity();
  }

  _writingEachEntity() {
    return {};
  }

  getDataArgForPriority(priorityName) {
    const dataArg = super.getDataArgForPriority(priorityName);
    if (priorityName === WRITING_ENTITIES || priorityName === POST_WRITING_ENTITIES || priorityName === DEFAULT) {
      return {
        ...dataArg,
        ...this.getEntitiesDataToWrite(),
      };
    }
    return dataArg;
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
      return { entityName, entityStorage, entityConfig: entityStorage.createProxy() };
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
  getEntitiesDataToWrite() {
    const { entities = [] } = this.options;
    let entitiesDefinitions = this.sharedData.getEntities();
    if (entities.length > 0) {
      entitiesDefinitions = entitiesDefinitions.filter(({ entityName }) => entities.includes(entityName));
    }
    return { entities: entitiesDefinitions.map(({ entity }) => entity) };
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
        this.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(CONFIGURING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToConfigure().forEach(({ entityName, entityStorage, entityConfig }) => {
          this.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY} for ${entityName}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...this.getDataArgForPriority(CONFIGURING_EACH_ENTITY), entityName, entityStorage, entityConfig }],
            });
          });
        });
      },
    });

    this.queueTask({
      queueName: LOADING_EACH_ENTITY_QUEUE,
      taskName: 'queueLoadingEachEntity',
      cancellable: true,
      method: () => {
        this.debug(`Queueing entity tasks ${LOADING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(LOADING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToLoad().forEach(({ entityName, entityStorage }) => {
          this.debug(`Queueing entity tasks ${LOADING_EACH_ENTITY} for ${entityName}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...this.getDataArgForPriority(LOADING_EACH_ENTITY), entityName, entityStorage }],
            });
          });
        });
      },
    });

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_QUEUE,
      taskName: 'queuePreparingEachEntity',
      cancellable: true,
      method: () => {
        this.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToPrepare().forEach(({ description, ...data }) => {
          this.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY} for ${description}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...this.getDataArgForPriority(PREPARING_EACH_ENTITY), description, ...data }],
            });
          });
        });
      },
    });

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_FIELD_QUEUE,
      taskName: 'queuePreparingEachEntityField',
      cancellable: true,
      method: () => {
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_FIELD, { skip: false });
        this.getEntitiesFieldsDataToPrepare().forEach(({ description, ...data }) => {
          this.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY_FIELD} for ${description}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...this.getDataArgForPriority(PREPARING_EACH_ENTITY_FIELD), description, ...data }],
            });
          });
        });
      },
    });

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_RELATIONSHIP_QUEUE,
      taskName: 'queuePreparingEachEntityRelationship',
      cancellable: true,
      method: () => {
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_RELATIONSHIP, { skip: false });
        this.getEntitiesRelationshipsDataToPrepare().forEach(({ description, ...data }) => {
          this.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY_RELATIONSHIP} for ${description}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...this.getDataArgForPriority(PREPARING_EACH_ENTITY_RELATIONSHIP), description, ...data }],
            });
          });
        });
      },
    });

    this.queueTask({
      queueName: POST_PREPARING_EACH_ENTITY_QUEUE,
      taskName: 'queuePostPreparingEachEntity',
      cancellable: true,
      method: () => {
        const tasks = this.extractTasksFromPriority(POST_PREPARING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToPostPrepare().forEach(({ description, ...data }) => {
          this.debug(`Queueing entity tasks ${POST_PREPARING_EACH_ENTITY} for ${description}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...this.getDataArgForPriority(POST_PREPARING_EACH_ENTITY), description, ...data }],
            });
          });
        });
      },
    });

    this.queueTask({
      queueName: WRITING_ENTITIES_QUEUE,
      taskName: 'queueWritingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipWriting) return;
        const tasks = this.extractTasksFromPriority(WRITING_ENTITIES, { skip: false });
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args: this.getArgsForPriority(WRITING_ENTITIES),
          });
        });
      },
    });

    this.queueTask({
      queueName: POST_WRITING_ENTITIES_QUEUE,
      taskName: 'queuePostWritingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipWriting) return;
        const tasks = this.extractTasksFromPriority(POST_WRITING_ENTITIES, { skip: false });
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args: this.getArgsForPriority(POST_WRITING_ENTITIES),
          });
        });
      },
    });
  }
}

module.exports = JHipsterBaseEntitiesGenerator;
