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
const BaseGenerator = require('../base/index.cjs');
const { CUSTOM_PRIORITIES, PRIORITY_NAMES, QUEUES } = require('./priorities.cjs');
const SharedData = require('../../lib/support/shared-data.cjs');

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

/**
 * This is the base class for a generator that generates entities.
 *
 * @class
 * @template ApplicationType
 * @extends {BaseGenerator}
 */
class BaseApplicationGenerator extends BaseGenerator {
  static CONFIGURING_EACH_ENTITY = asPriority(CONFIGURING_EACH_ENTITY);

  static LOADING_ENTITIES = asPriority(LOADING_ENTITIES);

  static PREPARING_EACH_ENTITY = asPriority(PREPARING_EACH_ENTITY);

  static PREPARING_EACH_ENTITY_FIELD = asPriority(PREPARING_EACH_ENTITY_FIELD);

  static PREPARING_EACH_ENTITY_RELATIONSHIP = asPriority(PREPARING_EACH_ENTITY_RELATIONSHIP);

  static POST_PREPARING_EACH_ENTITY = asPriority(POST_PREPARING_EACH_ENTITY);

  static WRITING_ENTITIES = asPriority(WRITING_ENTITIES);

  static POST_WRITING_ENTITIES = asPriority(POST_WRITING_ENTITIES);

  /** @type {SharedData<ApplicationType>} */
  #sharedData;

  constructor(args, options, features) {
    super(args, options, features);

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);

    /* Add tasks allowing entities priorities to match normal priorities pattern */
    this.on('queueOwnTasks', () => {
      this.debug('Queueing entity tasks');
      this.queueEntityTasks();
    });
  }

  /**
   * @returns {import('./tasks.js').LoadingTaskGroup<this, ApplicationType>}
   */
  get loading() {
    return {};
  }

  /**
   * @returns {import('./tasks.js').WritingTaskGroup<this, ApplicationType>}
   */
  get writing() {
    return this.asWritingTaskGroup({});
  }

  /**
   * @returns {import('./tasks.js').PreparingEachEntityTaskGroup<this, ApplicationType>}
   */
  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   *
   * Configuring each entity should configure entities.
   */
  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({});
  }

  /**
   * Priority API stub for blueprints.
   */
  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({});
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').InitializingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.js').InitializingTaskGroup<this>}
   */
  asInitialingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').ConfiguringTaskGroup<this>} taskGroup
   * @returns {import('./tasks.js').ConfiguringTaskGroup<this>}
   */
  asConfiguringTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PromptingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.js').PromptingTaskGroup<this>}
   */
  asPromptingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').ComposingTaskGroup<this>} taskGroup
   * @returns {import('./tasks.js').ComposingTaskGroup<this>}
   */
  asComposingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').LoadingTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').LoadingTaskGroup<this, ApplicationType>}
   */
  asLoadingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PreparingTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PreparingTaskGroup<this, ApplicationType>}
   */
  asPreparingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').ConfiguringEachEntityTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').ConfiguringEachEntityTaskGroup<this, ApplicationType>}
   */
  asConfiguringEachEntityTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').LoadingEntitiesTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').LoadingEntitiesTaskGroup<this, ApplicationType>}
   */
  asLoadingEntitiesTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PreparingEachEntityTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PreparingEachEntityTaskGroup<this, ApplicationType>}
   */
  asPreparingEachEntityTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PreparingEachEntityFieldTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PreparingEachEntityFieldTaskGroup<this, ApplicationType>}
   */
  asPreparingEachEntityFieldTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PreparingEachEntityRelationshipTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PreparingEachEntityRelationshipTaskGroup<this, ApplicationType>}
   */
  asPreparingEachEntityRelationshipTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PostPreparingEachEntityTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PostPreparingEachEntityTaskGroup<this, ApplicationType>}
   */
  asPostPreparingEachEntityTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').DefaultTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').DefaultTaskGroup<this, ApplicationType>}
   */
  asDefaultTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').WritingTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').WritingTaskGroup<this, ApplicationType>} taskGroup
   */
  asWritingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').WritingEntitiesTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').WritingEntitiesTaskGroup<this, ApplicationType>}
   */
  asWritingEntitiesTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PostWritingTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PostWritingTaskGroup<this, ApplicationType>}
   */
  asPostWritingTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PostWritingEntitiesTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PostWritingEntitiesTaskGroup<this, ApplicationType>}
   */
  asPostWritingEntitiesTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').InstallTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').InstallTaskGroup<this, ApplicationType>}
   */
  asInstallTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').PostInstallTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').PostInstallTaskGroup<this, ApplicationType>}
   */
  asPostInstallTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   *
   * @param {import('./tasks.js').EndTaskGroup<this, ApplicationType>} taskGroup
   * @returns {import('./tasks.js').EndTaskGroup<this, ApplicationType>}
   */
  asEndTaskGroup(taskGroup) {
    return taskGroup;
  }

  /**
   * Shared Data
   * @type {SharedData<ApplicationType>}
   */
  get sharedData() {
    if (!this.#sharedData) {
      const { baseName } = this.jhipsterConfig;
      if (!baseName) {
        throw new Error('baseName is required');
      }
      if (this.options.sharedData.applications === undefined) {
        this.options.sharedData.applications = {};
      }
      const sharedApplications = this.options.sharedData.applications;
      if (!sharedApplications[baseName]) {
        sharedApplications[baseName] = {};
      }
      this.#sharedData = new SharedData(sharedApplications[baseName]);
    }
    return this.#sharedData;
  }

  /**
   * @deprecated
   * expose custom CLIENT_MAIN_SRC_DIR to templates and needles
   */
  get CLIENT_MAIN_SRC_DIR() {
    return this.sharedData.getApplication().clientSrcDir;
  }

  /**
   * @deprecated
   * expose custom CLIENT_MAIN_SRC_DIR to templates and needles
   */
  get CLIENT_TEST_SRC_DIR() {
    return this.sharedData.getApplication().clientTestDir;
  }

  /**
   * Reset entities fake data seed.
   * @param {string} seed
   */
  resetEntitiesFakeData(seed) {
    seed = `${this.sharedData.getApplication().baseName}-${seed}`;
    this.debug(`Reseting entities seed with '${seed}'`);
    this.sharedData.getEntities().forEach(({ entity }) => {
      entity.resetFakerSeed(seed);
    });
  }

  /**
   * @protected
   */
  getArgsForPriority(priorityName) {
    return [this.getTaskFirstArgForPriority(priorityName)];
  }

  /**
   * @protected
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
      throw new Error(`${priorityName} data not available`);
    }
    if (!this.jhipsterConfig.baseName) {
      throw new Error(`BaseName (${this.jhipsterConfig.baseName}) application not available for priotity ${priorityName}`);
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
      return {
        application,
        ...this.getEntitiesDataToWrite(),
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
        this.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(CONFIGURING_EACH_ENTITY, { skip: false });
        this.getEntitiesDataToConfigure().forEach(({ entityName, entityStorage, entityConfig }) => {
          this.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY} for ${entityName}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ ...this.getTaskFirstArgForPriority(CONFIGURING_EACH_ENTITY), entityName, entityStorage, entityConfig }],
            });
          });
        });
      },
    });

    this.queueTask({
      queueName: LOADING_ENTITIES_QUEUE,
      taskName: 'queueLoadingEntities',
      cancellable: true,
      method: () => {
        this.debug(`Queueing entity tasks ${LOADING_ENTITIES}`);
        const tasks = this.extractTasksFromPriority(LOADING_ENTITIES, { skip: false });
        this.debug(`Queueing entity tasks ${LOADING_ENTITIES}`);
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args: [this.getTaskFirstArgForPriority(LOADING_ENTITIES)],
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
              args: [{ ...this.getTaskFirstArgForPriority(PREPARING_EACH_ENTITY), description, ...data }],
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
              args: [{ ...this.getTaskFirstArgForPriority(PREPARING_EACH_ENTITY_FIELD), description, ...data }],
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
              args: [{ ...this.getTaskFirstArgForPriority(PREPARING_EACH_ENTITY_RELATIONSHIP), description, ...data }],
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
              args: [{ ...this.getTaskFirstArgForPriority(POST_PREPARING_EACH_ENTITY), description, ...data }],
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

module.exports = BaseApplicationGenerator;
