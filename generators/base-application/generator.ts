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
import { upperFirst } from 'lodash-es';
import type { ComposeOptions, Storage } from 'yeoman-generator';

import { getConfigWithDefaults } from '../../lib/jhipster/default-application-options.ts';
import type { Entity as BaseEntity } from '../../lib/jhipster/types/entity.ts';
import { mutateData } from '../../lib/utils/index.ts';
import type { GenericTask } from '../base-core/types.ts';
import BaseGenerator from '../base-simple-application/index.ts';
import { BOOTSTRAP_APPLICATION } from '../base-simple-application/priorities.ts';
import { CONTEXT_DATA_APPLICATION_KEY, CONTEXT_DATA_SOURCE_KEY } from '../base-simple-application/support/index.ts';
import { JHIPSTER_CONFIG_DIR } from '../generator-constants.js';
import type GeneratorsByNamespace from '../types.ts';

import { CUSTOM_PRIORITIES, PRIORITY_NAMES, QUEUES } from './priorities.ts';
import { CONTEXT_DATA_APPLICATION_ENTITIES_KEY, getEntitiesFromDir } from './support/index.ts';
import type {
  ConfiguringEachEntityTaskParam,
  EntityToLoad,
  PreparingEachEntityFieldTaskParam,
  PreparingEachEntityRelationshipTaskParam,
  PreparingEachEntityTaskParam,
  TaskTypes as DefaultTasks,
} from './tasks.ts';
import type {
  Application as BaseApplication,
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Features as BaseApplicationFeatures,
  Options as BaseApplicationOptions,
  Source as BaseApplicationSource,
} from './types.ts';

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

const PRIORITY_WITH_ENTITIES_TO_LOAD: string[] = [LOADING_ENTITIES];
const PRIORITY_WITH_ENTITIES: string[] = [DEFAULT];
const PRIORITY_WITH_FILTERED_ENTITIES: string[] = [WRITING_ENTITIES, POST_WRITING_ENTITIES];

const PRIORITY_WITH_SOURCE: string[] = [PREPARING, POST_PREPARING, POST_WRITING, POST_WRITING_ENTITIES];
const PRIORITY_WITH_APPLICATION_DEFAULTS: string[] = [BOOTSTRAP_APPLICATION, PREPARING, LOADING];
const PRIORITY_WITH_APPLICATION: string[] = [
  LOADING,
  PREPARING,
  POST_PREPARING,

  DEFAULT,
  WRITING,
  POST_WRITING,
  PRE_CONFLICTS,
  INSTALL,
  END,

  CONFIGURING_EACH_ENTITY,
  LOADING_ENTITIES,
  PREPARING_EACH_ENTITY,
  PREPARING_EACH_ENTITY_FIELD,
  PREPARING_EACH_ENTITY_RELATIONSHIP,
  POST_PREPARING_EACH_ENTITY,

  WRITING_ENTITIES,
  POST_WRITING_ENTITIES,
];

const getFirstArgForPriority = (priorityName: string) => ({
  source: PRIORITY_WITH_SOURCE.includes(priorityName),
  application: PRIORITY_WITH_APPLICATION.includes(priorityName),
  applicationDefaults: PRIORITY_WITH_APPLICATION_DEFAULTS.includes(priorityName),
  entitiesToLoad: PRIORITY_WITH_ENTITIES_TO_LOAD.includes(priorityName),
  entities: PRIORITY_WITH_ENTITIES.includes(priorityName),
  filteredEntities: PRIORITY_WITH_FILTERED_ENTITIES.includes(priorityName),
});

/**
 * This is the base class for a generator that generates entities.
 */
export default class BaseApplicationGenerator<
  Entity extends BaseApplicationEntity = BaseApplicationEntity,
  Application extends BaseApplication<Entity> = BaseApplication<Entity>,
  Config extends BaseApplicationConfig = BaseApplicationConfig,
  Options extends BaseApplicationOptions = BaseApplicationOptions,
  Source extends BaseApplicationSource = BaseApplicationSource,
  Features extends BaseApplicationFeatures = BaseApplicationFeatures,
  Tasks extends DefaultTasks<Entity, Application, Source> = DefaultTasks<Entity, Application, Source>,
> extends BaseGenerator<Application, Config, Options, Source, Features, Tasks> {
  static CONFIGURING_EACH_ENTITY = asPriority(CONFIGURING_EACH_ENTITY);

  static LOADING_ENTITIES = asPriority(LOADING_ENTITIES);

  static PREPARING_EACH_ENTITY = asPriority(PREPARING_EACH_ENTITY);

  static PREPARING_EACH_ENTITY_FIELD = asPriority(PREPARING_EACH_ENTITY_FIELD);

  static PREPARING_EACH_ENTITY_RELATIONSHIP = asPriority(PREPARING_EACH_ENTITY_RELATIONSHIP);

  static POST_PREPARING_EACH_ENTITY = asPriority(POST_PREPARING_EACH_ENTITY);

  static WRITING_ENTITIES = asPriority(WRITING_ENTITIES);

  static POST_WRITING_ENTITIES = asPriority(POST_WRITING_ENTITIES);

  constructor(args?: string[], options?: Options, features?: Features) {
    super(args, options, { storeJHipsterVersion: true, storeBlueprintVersion: true, ...features } as Features);

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);

    /* Add tasks allowing entities priorities to match normal priorities pattern */
    this.on('queueOwnTasks', () => {
      this.log.debug('Queueing entity tasks');
      this.#queueEntityTasks();
    });

    this.on('before:render', (sourceBasename, context) => {
      const seed = `${context.entityClass}-${sourceBasename}${context.fakerSeed ?? ''}`;
      this.resetEntitiesFakeData(seed);
    });
  }

  get #application(): Application {
    return this.getContextData(CONTEXT_DATA_APPLICATION_KEY, {
      factory: () => ({}) as unknown as Application,
    });
  }

  get #entities(): Map<string, BaseEntity> {
    return this.getContextData(CONTEXT_DATA_APPLICATION_ENTITIES_KEY, { factory: () => new Map() });
  }

  get #entitiesForTasks() {
    return [...this.#entities.entries()].map(([key, value]) => ({
      description: key,
      entityName: key,
      entity: value as any,
    }));
  }

  get #source(): Record<string, any> {
    return this.getContextData(CONTEXT_DATA_SOURCE_KEY, { factory: () => ({}) });
  }

  /**
   * JHipster config with default values fallback
   */
  override get jhipsterConfigWithDefaults(): Readonly<Config> {
    return getConfigWithDefaults(super.jhipsterConfigWithDefaults) as Config;
  }

  /**
   * @deprecated use dependsOnBootstrap('app')
   */
  dependsOnBootstrapApplication(
    options?: ComposeOptions<GeneratorsByNamespace['jhipster:base-application:bootstrap']> | undefined,
  ): Promise<GeneratorsByNamespace['jhipster:base-application:bootstrap']> {
    return this.dependsOnJHipster('jhipster:base-application:bootstrap', options);
  }

  /**
   * @deprecated use dependsOnBootstrap('server')
   */
  dependsOnBootstrapApplicationServer(
    options?: ComposeOptions<GeneratorsByNamespace['jhipster:server:bootstrap']> | undefined,
  ): Promise<GeneratorsByNamespace['jhipster:server:bootstrap']> {
    return this.dependsOnJHipster('jhipster:server:bootstrap', options);
  }

  /**
   * @deprecated use dependsOnBootstrap('client')
   */
  dependsOnBootstrapApplicationClient(
    options?: ComposeOptions<GeneratorsByNamespace['jhipster:client:bootstrap']> | undefined,
  ): Promise<GeneratorsByNamespace['jhipster:client:bootstrap']> {
    return this.dependsOnJHipster('jhipster:client:bootstrap', options);
  }

  /**
   * Get Entities configuration path
   * @returns
   */
  getEntitiesConfigPath(...args: string[]): string {
    return this.destinationPath(JHIPSTER_CONFIG_DIR, ...args);
  }

  /**
   * Get Entity configuration path
   * @param entityName Entity name
   * @returns
   */
  getEntityConfigPath(entityName: string): string {
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
  getExistingEntities(): { name: string; definition: Entity }[] {
    function isBefore(
      e1: { definition: { annotations?: { changelogDate?: number } } },
      e2: { definition: { annotations?: { changelogDate?: number } } },
    ): number {
      return (e1.definition.annotations?.changelogDate ?? 0) - (e2.definition.annotations?.changelogDate ?? 0);
    }

    const configDir = this.getEntitiesConfigPath();

    const entities: { name: string; definition: Entity }[] = [];
    for (const entityName of [...new Set(((this.jhipsterConfig.entities as string[]) || []).concat(getEntitiesFromDir(configDir)))]) {
      const definition: Entity = this.getEntityConfig(entityName)?.getAll() as unknown as Entity;
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
  asConfiguringEachEntityTaskGroup<T extends Record<string, GenericTask<this, Tasks['ConfiguringEachEntityTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['ConfiguringEachEntityTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asLoadingEntitiesTaskGroup<T extends Record<string, GenericTask<this, Tasks['LoadingEntitiesTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['LoadingEntitiesTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityTaskGroup<T extends Record<string, GenericTask<this, Tasks['PreparingEachEntityTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['PreparingEachEntityTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityFieldTaskGroup<T extends Record<string, GenericTask<this, Tasks['PreparingEachEntityFieldTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['PreparingEachEntityFieldTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingEachEntityRelationshipTaskGroup<
    T extends Record<string, GenericTask<this, Tasks['PreparingEachEntityRelationshipTaskParam']>>,
  >(taskGroup: T): Record<keyof T, GenericTask<any, Tasks['PreparingEachEntityRelationshipTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostPreparingEachEntityTaskGroup<T extends Record<string, GenericTask<this, Tasks['PostPreparingEachEntityTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['PostPreparingEachEntityTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asWritingEntitiesTaskGroup<T extends Record<string, GenericTask<this, Tasks['WritingEntitiesTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['WritingEntitiesTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPostWritingEntitiesTaskGroup<T extends Record<string, GenericTask<this, Tasks['PostWritingEntitiesTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['PostWritingEntitiesTaskParam']>> {
    return taskGroup;
  }

  /**
   * Reset entities fake data seed.
   * @param {string} seed
   */
  resetEntitiesFakeData(seed: string | undefined): void {
    seed = `${this.#application.baseName}-${seed}`;
    this.log.debug(`Resetting entities seed with '${seed}'`);
    for (const entity of this.#entities.values()) {
      (entity as any).resetFakerSeed?.(seed);
    }
  }

  getArgsForPriority(priorityName: (typeof PRIORITY_NAMES)[keyof typeof PRIORITY_NAMES]): any {
    const args = super.getArgsForPriority(priorityName as any);
    let firstArg = this.getTaskFirstArgForPriority(priorityName);
    if (args.length > 0) {
      firstArg = { ...args[0], ...firstArg };
    }
    return [firstArg];
  }

  /**
   * @protected
   */
  protected getTaskFirstArgForPriority(priorityName: string): any {
    const { source, application, applicationDefaults, entitiesToLoad, entities, filteredEntities } = getFirstArgForPriority(priorityName);

    const args: Record<string, any> = {};
    if (source) {
      args.source = this.#source;
    }
    if (application) {
      args.application = this.#application;
    }
    if (applicationDefaults) {
      args.applicationDefaults = (...args: any[]) => mutateData(this.#application, ...args.map(data => ({ __override__: false, ...data })));
    }
    if (entitiesToLoad) {
      args.entitiesToLoad = this.#getEntitiesDataToLoad();
    }
    if (entities) {
      args.entities = [...this.#entities.values()];
    }
    if (filteredEntities) {
      const { entities: entitiesToFilter = [] } = this.options;
      if (entitiesToFilter.length === 0) {
        args.entities = [...this.#entities.values()];
      } else {
        args.entities = [...this.#entities.values()].filter(entity => entitiesToFilter.includes(entity.name));
      }
    }
    return args;
  }

  /**
   * @private
   * Get entities to configure.
   * This method doesn't filter entities. An filtered config can be changed at this priority.
   * @returns {string[]}
   */
  #getEntitiesDataToConfigure(): ConfiguringEachEntityTaskParam<Entity, Application>[] {
    return this.getExistingEntityNames().map(entityName => {
      const entityStorage = this.getEntityConfig(entityName, true);
      return { entityName, entityStorage, entityConfig: entityStorage!.createProxy() } as ConfiguringEachEntityTaskParam<
        Entity,
        Application
      >;
    });
  }

  /**
   * @private
   * Get entities to load.
   * This method doesn't filter entities. An filtered config can be changed at this priority.
   * @returns {string[]}
   */
  #getEntitiesDataToLoad(): EntityToLoad<any>[] {
    const application = this.#application;
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
      if (!this.#entities.has(entityName)) {
        this.#entities.set(entityName, { name: entityName, fields: [], relationships: [] });
      }
      const entityBootstrap = this.#entities.get(entityName);
      return {
        entityName,
        get entityStorage() {
          return generator.getEntityConfig(entityName, true);
        },
        get entityConfig() {
          return generator.getEntityConfig(entityName, true)!.createProxy();
        },
        entityBootstrap,
      } as EntityToLoad<any>;
    });
  }

  /**
   * @private
   * Get entities to prepare.
   * @returns {object[]}
   */
  #getEntitiesDataToPrepare(): Pick<PreparingEachEntityTaskParam<Entity, Application>, 'entity' | 'entityName' | 'description'>[] {
    return this.#entitiesForTasks;
  }

  /**
   * @private
   * Get entities and fields to prepare.
   * @returns {object[]}
   */
  #getEntitiesFieldsDataToPrepare(): Pick<
    PreparingEachEntityFieldTaskParam<Entity, Application>,
    'entity' | 'entityName' | 'field' | 'fieldName' | 'description'
  >[] {
    return this.#getEntitiesDataToPrepare()
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
      .flat() as any;
  }

  /**
   * @private
   * Get entities and relationships to prepare.
   * @returns {object[]}
   */
  #getEntitiesRelationshipsDataToPrepare(): Pick<
    PreparingEachEntityRelationshipTaskParam<Entity, Application>,
    'entity' | 'entityName' | 'relationship' | 'relationshipName' | 'description'
  >[] {
    return this.#getEntitiesDataToPrepare()
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
      .flat() as any;
  }

  /**
   * @private
   * Get entities to post prepare.
   * @returns {object[]}
   */
  #getEntitiesDataToPostPrepare() {
    return this.#getEntitiesDataToPrepare();
  }

  /**
   * @private
   * Queue entity tasks.
   */
  #queueEntityTasks() {
    this.queueTask({
      queueName: CONFIGURING_EACH_ENTITY_QUEUE,
      taskName: 'queueConfiguringEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(CONFIGURING_EACH_ENTITY)) return;
        this.log.debug(`Queueing entity tasks ${CONFIGURING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(CONFIGURING_EACH_ENTITY, { skip: false });
        this.#getEntitiesDataToConfigure().forEach(({ entityName, entityStorage, entityConfig }) => {
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
    });

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
    });

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_QUEUE,
      taskName: 'queuePreparingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(PREPARING_EACH_ENTITY)) return;
        this.log.debug(`Queueing entity tasks ${PREPARING_EACH_ENTITY}`);
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY, { skip: false });
        this.#getEntitiesDataToPrepare().forEach(({ description, ...data }) => {
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
    });

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_FIELD_QUEUE,
      taskName: 'queuePreparingEachEntityField',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(PREPARING_EACH_ENTITY_FIELD)) return;
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_FIELD, { skip: false });
        this.#getEntitiesFieldsDataToPrepare().forEach(({ description, ...data }) => {
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
    });

    this.queueTask({
      queueName: PREPARING_EACH_ENTITY_RELATIONSHIP_QUEUE,
      taskName: 'queuePreparingEachEntityRelationship',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(PREPARING_EACH_ENTITY_RELATIONSHIP)) return;
        const tasks = this.extractTasksFromPriority(PREPARING_EACH_ENTITY_RELATIONSHIP, { skip: false });
        this.#getEntitiesRelationshipsDataToPrepare().forEach(({ description, ...data }) => {
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
    });

    this.queueTask({
      queueName: POST_PREPARING_EACH_ENTITY_QUEUE,
      taskName: 'queuePostPreparingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(POST_PREPARING_EACH_ENTITY)) return;
        const tasks = this.extractTasksFromPriority(POST_PREPARING_EACH_ENTITY, { skip: false });
        this.#getEntitiesDataToPostPrepare().forEach(({ description, ...data }) => {
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
    });

    this.queueTask({
      queueName: WRITING_ENTITIES_QUEUE,
      taskName: 'queueWritingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(WRITING_ENTITIES)) return;
        const tasks = this.extractTasksFromPriority(WRITING_ENTITIES, { skip: false });
        const args = this.getArgsForPriority(WRITING_ENTITIES);
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args,
          });
        });
      },
    });

    this.queueTask({
      queueName: POST_WRITING_ENTITIES_QUEUE,
      taskName: 'queuePostWritingEachEntity',
      cancellable: true,
      method: () => {
        if (this.options.skipPriorities?.includes(POST_WRITING_ENTITIES)) return;
        const tasks = this.extractTasksFromPriority(POST_WRITING_ENTITIES, { skip: false });
        const args = this.getArgsForPriority(POST_WRITING_ENTITIES);
        tasks.forEach(task => {
          this.queueTask({
            ...task,
            args,
          });
        });
      },
    });
  }
}
