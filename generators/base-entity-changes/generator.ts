/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { existsSync, readFileSync } from 'node:fs';

import BaseApplicationGenerator from '../base-application/index.ts';
import { PRIORITY_NAMES } from '../base-application/priorities.ts';
import { loadEntitiesAnnotations, loadEntitiesOtherSide } from '../base-application/support/index.ts';
import type { TaskTypes as ApplicationTaskTypes } from '../base-application/tasks.ts';
import type { TaskParamWithApplication } from '../base-simple-application/tasks.ts';
import { relationshipEquals, relationshipNeedsForeignKeyRecreationOnly } from '../liquibase/support/index.ts';
import { addEntitiesOtherRelationships } from '../server/support/index.ts';

import type {
  Application as BaseEntityChangesApplication,
  BaseChangelog as BaseEntityChangesChangelog,
  Config as BaseEntityChangesConfig,
  Entity as BaseEntityChangesEntity,
  Features as BaseEntityChangesFeatures,
  Field as BaseEntityChangesField,
  Options as BaseEntityChangesOptions,
  Source as BaseEntityChangesSource,
} from './types.ts';

const { DEFAULT, WRITING_ENTITIES, POST_WRITING_ENTITIES } = PRIORITY_NAMES;

const baseChangelog = (): Omit<BaseEntityChangesChangelog<any>, 'changelogDate' | 'entityName' | 'entity'> => ({
  newEntity: false,
  changedEntity: false,
  incremental: false,
  previousEntity: undefined,
  addedFields: [],
  removedFields: [],
  addedRelationships: [],
  removedRelationships: [],
  relationshipsToRecreateForeignKeysOnly: [],
  removedDefaultValueFields: [],
  addedDefaultValueFields: [],
});

type BaseEntityChangesTaskTypes<
  E extends BaseEntityChangesEntity,
  B extends BaseEntityChangesChangelog<E>,
  A extends BaseEntityChangesApplication<E>,
  S extends BaseEntityChangesSource,
> = ApplicationTaskTypes<E, A, S> & {
  DefaultTaskParam: { entityChanges?: B[] };
  WritingEntitiesTaskParam: { entityChanges?: B[] };
  PostWritingEntitiesTaskParam: { entityChanges?: B[] };
};

/**
 * This is the base class for a generator for every generator.
 */
export default abstract class BaseEntityChangesGenerator<
  Entity extends BaseEntityChangesEntity = BaseEntityChangesEntity,
  Application extends BaseEntityChangesApplication<Entity> = BaseEntityChangesApplication<Entity>,
  Config extends BaseEntityChangesConfig = BaseEntityChangesConfig,
  Options extends BaseEntityChangesOptions = BaseEntityChangesOptions,
  Source extends BaseEntityChangesSource = BaseEntityChangesSource,
  Features extends BaseEntityChangesFeatures = BaseEntityChangesFeatures,
  Tasks extends BaseEntityChangesTaskTypes<Entity, BaseEntityChangesChangelog<Entity>, Application, Source> = BaseEntityChangesTaskTypes<
    Entity,
    BaseEntityChangesChangelog<Entity>,
    Application,
    Source
  >,
> extends BaseApplicationGenerator<Entity, Application, Config, Options, Source, Features, Tasks> {
  recreateInitialChangelog!: boolean;
  /** The changes of the entities, computed once for the priorities giving them. */
  #entityChanges?: BaseEntityChangesChangelog<Entity>[];

  abstract isChangelogNew({ entityName, changelogDate }: { entityName: string; changelogDate: string }): boolean;

  protected abstract prepareEntityForComparison(entity: Entity): void;

  protected getTaskFirstArgForPriority(
    priorityName: (typeof PRIORITY_NAMES)[keyof typeof PRIORITY_NAMES],
  ): TaskParamWithApplication<Application> {
    const firstArg = super.getTaskFirstArgForPriority(priorityName);
    if (([DEFAULT, WRITING_ENTITIES, POST_WRITING_ENTITIES] as string[]).includes(priorityName)) {
      const { application, entities } = firstArg as Tasks['DefaultTaskParam'];
      this.#entityChanges ??= this.generateIncrementalChanges({ application, entities });
      return { ...firstArg, entityChanges: this.#entityChanges };
    }
    return firstArg;
  }

  /**
   * Generate changelog from differences between the liquibase entity and current entity.
   */
  protected generateIncrementalChanges({
    application,
    entities: paramEntities,
  }: Pick<Tasks['DefaultTaskParam'], 'application' | 'entities'>): BaseEntityChangesChangelog<Entity>[] {
    const { recreateInitialChangelog } = this;
    const { incrementalChangelog } = application;
    const entityNames = paramEntities.filter(e => !e.builtIn).map(e => e.name);

    const entitiesByName = Object.fromEntries(paramEntities.map(entity => [entity.name, entity]));
    const entitiesWithExistingChangelog = new Set(
      entityNames.filter(entityName => !this.isChangelogNew({ entityName, changelogDate: entitiesByName[entityName].changelogDate })),
    );
    const previousEntitiesByName = Object.fromEntries(
      entityNames
        .map(entityName => ({ entityName, entityConfigPath: this.getEntityConfigPath(entityName) }))
        .filter(({ entityConfigPath }) => existsSync(entityConfigPath))
        .map(({ entityName, entityConfigPath }) => [
          entityName,
          { name: entityName, ...JSON.parse(readFileSync(entityConfigPath).toString()) } as Entity,
        ]),
    );
    // The primary keys as the entity files declare them, before the entities are prepared.
    const previousIdSignatures = Object.fromEntries(
      Object.entries(previousEntitiesByName).map(([entityName, entity]) => [entityName, this.#idSignature(entity)]),
    );

    for (const [entityName, entity] of Object.entries(entitiesByName)) {
      if (entity.builtIn) {
        previousEntitiesByName[entityName] = entity;
      }
    }

    if (application.generateBuiltInUserEntity && !previousEntitiesByName.User) {
      previousEntitiesByName.User = { name: 'User', builtIn: true } as Entity;
    }

    const entities = Object.values(previousEntitiesByName);
    loadEntitiesAnnotations(entities);
    loadEntitiesOtherSide(entities);
    addEntitiesOtherRelationships(entities);

    // Compare entity changes and create changelogs
    return entityNames.map(entityName => {
      const newConfig = entitiesByName[entityName];
      const oldConfig = previousEntitiesByName[entityName];
      this.prepareEntityForComparison(newConfig);
      if (oldConfig) {
        this.prepareEntityForComparison(oldConfig);
      }

      const newFields = (newConfig.fields || []).filter(field => !field.transient);
      const newRelationships = newConfig.relationships || [];

      if (!oldConfig || recreateInitialChangelog || !incrementalChangelog || !entitiesWithExistingChangelog.has(entityName)) {
        return {
          ...baseChangelog(),
          incremental: Boolean(newConfig.incrementalChangelogDate),
          changelogDate: newConfig.changelogDate,
          newEntity: true,
          entity: newConfig,
          entityName,
        } satisfies BaseEntityChangesChangelog<Entity>;
      }

      this._debug(`Calculating diffs for ${entityName}`);

      const oldFields = (oldConfig.fields || []).filter(field => !field.transient);
      const oldFieldNames: string[] = oldFields.filter(field => !field.id).map(field => field.fieldName);
      const newFieldNames: string[] = newFields.filter(field => !field.id).map(field => field.fieldName);

      // Calculate new fields
      const addedFieldNames = new Set(newFieldNames.filter(fieldName => !oldFieldNames.includes(fieldName)));
      const addedFields = newFields.filter(field => addedFieldNames.has(field.fieldName));
      // Calculate removed fields
      const removedFieldNames = new Set(oldFieldNames.filter(fieldName => !newFieldNames.includes(fieldName)));
      const removedFields = oldFields.filter(field => removedFieldNames.has(field.fieldName));

      const oldRelationships = oldConfig.relationships || [];

      if (previousIdSignatures[entityName] !== this.#idSignature(this.fs.readJSON(this.getEntityConfigPath(entityName)))) {
        // The changes of the primary key are not written to the incremental changelog.
        this.log.warn(
          `The primary key of the entity ${entityName} changed: the incremental changelog does not migrate it, the database has to be changed by hand.`,
        );
      }

      // Calculate changed/newly added relationships
      const addedRelationships = newRelationships.filter(
        newRelationship =>
          // id changes are not supported
          !newRelationship.id &&
          // check if the same relationship wasn't already part of the old config
          !oldRelationships.some(oldRelationship => relationshipEquals(oldRelationship, newRelationship)),
      );

      // Calculate to be removed relationships
      const removedRelationships = oldRelationships.filter(
        oldRelationship =>
          // id changes are not supported
          !oldRelationship.id &&
          // check if there are relationships not anymore in the new config
          !newRelationships.some(newRelationship => relationshipEquals(newRelationship, oldRelationship)),
      );

      // calculate relationships that only need a foreign key recreation from the ones that are added
      // we need both the added and the removed ones here
      const relationshipsToRecreateForeignKeysOnly = [
        ...addedRelationships.filter(addedRelationship =>
          removedRelationships.some(removedRelationship =>
            relationshipNeedsForeignKeyRecreationOnly(removedRelationship, addedRelationship),
          ),
        ),
        ...removedRelationships.filter(removedRelationship =>
          addedRelationships.some(addedRelationship => relationshipNeedsForeignKeyRecreationOnly(addedRelationship, removedRelationship)),
        ),
      ];

      const oldFieldsWithDefaultValues = oldFields.filter(field => this.hasAnyDefaultValue(field));
      const newFieldsWithDefaultValues = newFields.filter(field => this.hasAnyDefaultValue(field));

      // find the old fields that have not been deleted anyway or otherwise where the default value is different on the same new field
      const removedDefaultValueFields = oldFieldsWithDefaultValues
        .filter(oldField => !removedFieldNames.has(oldField.fieldName))
        .filter(oldField => {
          // field was not removed, so check its default value
          const newField = newFields.find(field => field.fieldName === oldField.fieldName);
          return newField !== undefined && this.doDefaultValuesDiffer(oldField, newField);
        });

      // find the new fields that have not been added newly anyway or otherwise where the old field had a different default value
      const addedDefaultValueFields = newFieldsWithDefaultValues
        .filter(newField => !addedFieldNames.has(newField.fieldName))
        .filter(newField => {
          // field was not added newly, so check its default value
          const oldField = oldFields.find(field => field.fieldName === newField.fieldName);
          return oldField !== undefined && this.doDefaultValuesDiffer(oldField, newField);
        });

      return {
        ...baseChangelog(),
        previousEntity: oldConfig,
        entity: newConfig,
        incremental: true,
        changedEntity: true,
        entityName,
        addedFields,
        removedFields,
        addedRelationships,
        removedRelationships,
        relationshipsToRecreateForeignKeysOnly,
        removedDefaultValueFields,
        addedDefaultValueFields,
      } satisfies BaseEntityChangesChangelog<Entity>;
    });
  }

  /** The fields and the relationships an entity file declares as its primary key. */
  #idSignature(entity: unknown): string {
    type Declared = { id?: boolean; options?: { id?: boolean } };
    const { fields = [], relationships = [] } = (entity ?? {}) as {
      fields?: (Declared & { fieldName: string; fieldType?: string })[];
      relationships?: (Declared & { relationshipName: string; otherEntityName: string; relationshipType?: string })[];
    };
    const isId = ({ id, options }: Declared) => Boolean(id ?? options?.id);
    return [
      ...fields.filter(field => isId(field) || field.fieldName === 'id').map(field => `${field.fieldName}:${field.fieldType}`),
      ...relationships
        .filter(relationship => isId(relationship))
        .map(relationship => `${relationship.relationshipName}:${relationship.otherEntityName}:${relationship.relationshipType}`),
    ]
      .sort()
      .join();
  }

  private hasAnyDefaultValue(field: BaseEntityChangesField): boolean {
    return field.defaultValue !== undefined || field.defaultValueComputed !== undefined;
  }

  private doDefaultValuesDiffer(field1: BaseEntityChangesField, field2: BaseEntityChangesField): boolean {
    return field1.defaultValue !== field2.defaultValue || field1.defaultValueComputed !== field2.defaultValueComputed;
  }
}
