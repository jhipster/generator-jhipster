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
const { CUSTOM_PRIORITIES_ENTITIES, compat } = require('../lib/constants/priorities.cjs');

const {
  QUEUE_EACH_ENTITY_PRIORITY,
  CONFIGURING_EACH_ENTITY_PRIORITY,
  PREPARING_EACH_ENTITY_PRIORITY,
  PREPARING_EACH_ENTITY_FIELD_PRIORITY,
  PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY,
  WRITING_ENTITIES_PRIORITY,
} = compat;

/**
 * This is the base class for a generator that generates entities.
 */
class JHipsterBaseEntityGenerator extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES_ENTITIES);

    /* Add tasks allowing entities priorities to match normal priorities pattern */
    this.on('queueOwnTasks', () => {
      this.debug(`Queueing entity tasks ${QUEUE_EACH_ENTITY_PRIORITY}`);
      this.queueOwnTask(QUEUE_EACH_ENTITY_PRIORITY, { taskOrigin: JHipsterBaseEntityGenerator.prototype, skip: false, taskPrefix: '' });
    });
  }

  /**
   * @private
   * Get entities to configure.
   * This method doesn't filter entities. An filtered config can be changed at thie priority.
   * @returns {string[]}
   */
  getEntitiesToConfigure() {
    return this.getExistingEntityNames().map(entityName => {
      const entityStorage = this.getEntityConfig(entityName, true);
      return { entityName, entityStorage, entityConfig: entityStorage.createProxy() };
    });
  }

  /**
   * @private
   * Get entities names to generate.
   * @returns {object[]}
   */
  getEntitiesDataToPrepare() {
    return this.sharedData.getEntities(this.getExistingEntityNames());
  }

  /**
   * Get entities names to generate.
   * @returns {object[]}
   */
  getEntitiesDataToWrite() {
    return this.sharedData.getEntities(this.getExistingEntityNames());
  }

  get [QUEUE_EACH_ENTITY_PRIORITY]() {
    return {
      queueConfiguringEachEntity() {
        this.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY_PRIORITY}`);
        const tasks = this.extractTasksFromPriority(CONFIGURING_EACH_ENTITY_PRIORITY, { skip: false });
        this.getEntitiesToConfigure().forEach(({ entityName, entityStorage, entityConfig }) => {
          this.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY_PRIORITY} for ${entityName}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ entityName, entityStorage, entityConfig }],
            });
          });
        });
      },
      queuePreparingEachEntity() {
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_PRIORITY, { skip: false });
        this.getEntitiesDataToPrepare().forEach(({ entityName, entity }) => {
          this.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY_PRIORITY} for ${entityName}`);
          tasks.forEach(task => {
            this.queueTask({
              ...task,
              args: [{ entityName, entity }],
            });
          });
        });
      },
      queuePreparingEachEntityField() {
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_FIELD_PRIORITY, { skip: false });
        this.getEntitiesDataToPrepare().forEach(({ entityName, entity }) => {
          if (!entity.fields) return;
          entity.fields.forEach(field => {
            this.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY_FIELD_PRIORITY} for ${entityName}#${field.fieldName}`);
            tasks.forEach(task => {
              this.queueTask({
                ...task,
                args: [{ entityName, entity, field }],
              });
            });
          });
        });
      },
      queuePreparingEachEntityRelationship() {
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY, { skip: false });
        this.getEntitiesDataToPrepare().forEach(({ entityName, entity }) => {
          if (!entity.relationships) return;

          entity.relationships.forEach(relationship => {
            this.debug(
              `Queueing entity tasks ${PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY} for ${entityName}#${relationship.relationshipName}`
            );
            tasks.forEach(task => {
              this.queueTask({
                ...task,
                args: [{ entityName, entity, relationship }],
              });
            });
          });
        });
      },
      queueWritingEachEntity() {
        const tasks = this.extractTasksFromPriority(WRITING_ENTITIES_PRIORITY, { skip: false });
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args: [{ entities: this.getEntitiesDataToWrite().map(({ entity }) => entity) }],
          });
        });
      },
    };
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
}

module.exports = JHipsterBaseEntityGenerator;
