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
import { existsSync, readFileSync } from 'fs';
import type { Field } from '../base-application/index.js';
import BaseApplicationGenerator from '../base-application/index.js';
import { PRIORITY_NAMES } from '../base-application/priorities.js';
import { loadEntitiesAnnotations, loadEntitiesOtherSide } from '../base-application/support/index.js';
import { relationshipEquals, relationshipNeedsForeignKeyRecreationOnly } from '../liquibase/support/index.js';
import { addEntitiesOtherRelationships } from '../server/support/index.js';
import type { TaskTypes as ApplicationTaskTypes } from '../base-application/tasks.js';
import type { TaskParamWithApplication } from '../base-simple-application/tasks.js';
import type {
  BaseChangelog,
  Application as BaseEntityChangesApplication,
  Config as BaseEntityChangesConfig,
  Entity as BaseEntityChangesEntity,
  Features as BaseEntityChangesFeatures,
  Options as BaseEntityChangesOptions,
  Source as BaseEntityChangesSource,
} from './types.js';

const { DEFAULT, WRITING_ENTITIES, POST_WRITING_ENTITIES } = PRIORITY_NAMES;

const baseChangelog: () => Omit<BaseChangelog, 'changelogDate' | 'entityName' | 'entity'> = () => ({
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
  changelogData: {},
});

type BaseEntityChangesTaskTypes<
  E extends BaseEntityChangesEntity,
  A extends BaseEntityChangesApplication<E>,
  S extends BaseEntityChangesSource,
> = ApplicationTaskTypes<E, A, S> & {
  DefaultTaskParam: { entityChanges?: BaseChangelog[] };
  WritingEntitiesTaskParam: { entityChanges?: BaseChangelog[] };
  PostWritingEntitiesTaskParam: { entityChanges?: BaseChangelog[] };
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
  Tasks extends BaseEntityChangesTaskTypes<Entity, Application, Source> = BaseEntityChangesTaskTypes<Entity, Application, Source>,
> extends BaseApplicationGenerator<Entity, Application, Config, Options, Source, Features, Tasks> {
  recreateInitialChangelog!: boolean;
  private entityChanges!: any[];

  abstract isChangelogNew({ entityName, changelogDate }): boolean;

  protected getTaskFirstArgForPriority(
    priorityName: (typeof PRIORITY_NAMES)[keyof typeof PRIORITY_NAMES],
  ): TaskParamWithApplication<Application> {
    const firstArg = super.getTaskFirstArgForPriority(priorityName);
    if (([DEFAULT, WRITING_ENTITIES, POST_WRITING_ENTITIES] as string[]).includes(priorityName)) {
      const { application, entities } = firstArg as Tasks['DefaultTaskParam'];
      this.entityChanges = this.generateIncrementalChanges({ application, entities });
    }
    if (([DEFAULT] as string[]).includes(priorityName)) {
      return { ...firstArg, entityChanges: this.entityChanges };
    }
    if (([WRITING_ENTITIES, POST_WRITING_ENTITIES] as string[]).includes(priorityName)) {
      // const { entities = [] } = this.options;
      // const filteredEntities = data.entities.filter(entity => entities.includes(entity.name));
      return { ...firstArg, entityChanges: this.entityChanges };
    }
    return firstArg;
  }

  /**
   * Generate changelog from differences between the liquibase entity and current entity.
   */
  protected generateIncrementalChanges({
    application,
    entities: paramEntities,
  }: Pick<Tasks['DefaultTaskParam'], 'application' | 'entities'>): BaseChangelog[] {
    const recreateInitialChangelog = this.recreateInitialChangelog;
    const { incrementalChangelog } = application;
    const entityNames = paramEntities.filter(e => !e.builtIn).map(e => e.name);

    const entitiesByName = Object.fromEntries(paramEntities.map(entity => [entity.name, entity]));
    const entitiesWithExistingChangelog = entityNames.filter(
      entityName => !this.isChangelogNew({ entityName, changelogDate: entitiesByName[entityName].annotations?.changelogDate }),
    );
    const previousEntitiesByName = Object.fromEntries(
      entityNames
        .map(entityName => ({ entityName, entityConfigPath: this.getEntityConfigPath(entityName) }))
        .filter(({ entityConfigPath }) => existsSync(entityConfigPath))
        .map(({ entityName, entityConfigPath }) => [
          entityName,
          { name: entityName, ...JSON.parse(readFileSync(entityConfigPath).toString()) },
        ]),
    );

    for (const [entityName, entity] of Object.entries(entitiesByName)) {
      if (entity.builtIn) {
        previousEntitiesByName[entityName] = entity;
      }
    }

    const entities: any[] = Object.values(previousEntitiesByName);
    loadEntitiesAnnotations(entities);
    loadEntitiesOtherSide(entities);
    addEntitiesOtherRelationships(entities);

    // Compare entity changes and create changelogs
    return entityNames.map(entityName => {
      const newConfig: any = entitiesByName[entityName];
      const newFields: any[] = (newConfig.fields || []).filter((field: any) => !field.transient);
      const newRelationships: any[] = newConfig.relationships || [];

      const oldConfig: any = previousEntitiesByName[entityName];

      if (!oldConfig || recreateInitialChangelog || !incrementalChangelog || !entitiesWithExistingChangelog.includes(entityName)) {
        return {
          ...baseChangelog(),
          incremental: newConfig.incrementalChangelog,
          changelogDate: newConfig.changelogDate,
          newEntity: true,
          entity: newConfig,
          entityName,
        };
      }

      this._debug(`Calculating diffs for ${entityName}`);

      const oldFields: any[] = (oldConfig.fields || []).filter((field: any) => !field.transient);
      const oldFieldNames: string[] = oldFields.filter(field => !field.id).map(field => field.fieldName);
      const newFieldNames: string[] = newFields.filter(field => !field.id).map(field => field.fieldName);

      // Calculate new fields
      const addedFieldNames = newFieldNames.filter(fieldName => !oldFieldNames.includes(fieldName));
      const addedFields = addedFieldNames.map(fieldName => newFields.find(field => fieldName === field.fieldName));
      // Calculate removed fields
      const removedFieldNames = oldFieldNames.filter(fieldName => !newFieldNames.includes(fieldName));
      const removedFields = removedFieldNames.map(fieldName => oldFields.find(field => fieldName === field.fieldName));

      const oldRelationships: any[] = oldConfig.relationships || [];

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
      const relationshipsToRecreateForeignKeysOnly = addedRelationships
        .filter(addedRelationship =>
          removedRelationships.some(removedRelationship =>
            relationshipNeedsForeignKeyRecreationOnly(removedRelationship, addedRelationship),
          ),
        )
        .concat(
          removedRelationships.filter(removedRelationship =>
            addedRelationships.some(addedRelationship => relationshipNeedsForeignKeyRecreationOnly(addedRelationship, removedRelationship)),
          ),
        );

      const oldFieldsWithDefaultValues = oldFields.filter(field => this.hasAnyDefaultValue(field));
      const newFieldsWithDefaultValues = newFields.filter(field => this.hasAnyDefaultValue(field));

      // find the old fields that have not been deleted anyway or otherwise where the default value is different on the same new field
      const removedDefaultValueFields = oldFieldsWithDefaultValues
        .filter(oldField => !removedFieldNames.includes(oldField.fieldName))
        .filter(
          // field was not removed, so check its default value
          oldField =>
            this.doDefaultValuesDiffer(
              oldField,
              newFields.find(newField => newField.fieldName === oldField.fieldName),
            ),
        );

      // find the new fields that have not been added newly anyway or otherwise where the old field had a different default value
      const addedDefaultValueFields = newFieldsWithDefaultValues
        .filter(newField => !addedFieldNames.includes(newField.fieldName))
        .filter(
          // field was not added newly, so check its default value
          newField =>
            this.doDefaultValuesDiffer(
              oldFields.find(oldField => oldField.fieldName === newField.fieldName),
              newField,
            ),
        );

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
      };
    });
  }

  private hasAnyDefaultValue(field: Field): boolean {
    return field.defaultValue !== undefined || field.defaultValueComputed !== undefined;
  }

  private doDefaultValuesDiffer(field1: Field, field2: Field): boolean {
    return field1.defaultValue !== field2.defaultValue || field1.defaultValueComputed !== field2.defaultValueComputed;
  }
}
