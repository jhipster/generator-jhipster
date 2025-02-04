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
import GeneratorBaseApplication from '../base-application/index.js';
import { PRIORITY_NAMES } from '../base-application/priorities.js';
import { loadEntitiesAnnotations, loadEntitiesOtherSide } from '../base-application/support/index.js';
import { relationshipEquals, relationshipNeedsForeignKeyRecreationOnly } from '../liquibase/support/index.js';
import { addEntitiesOtherRelationships } from '../server/support/index.js';
import type { TaskTypes as ApplicationTaskTypes, TaskParamWithApplication } from '../../lib/types/application/tasks.js';
import type { BaseChangelog } from './types.js';
import type { TaskParamWithChangelogsAndApplication } from './tasks.js';

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

type TaskTypes = ApplicationTaskTypes & {
  DefaultTaskParam: { entityChanges?: BaseChangelog[] };
  WritingEntitiesTaskParam: { entityChanges?: BaseChangelog[] };
  PostWritingEntitiesTaskParam: { entityChanges?: BaseChangelog[] };
};

/**
 * This is the base class for a generator for every generator.
 */
export default abstract class GeneratorBaseEntityChanges extends GeneratorBaseApplication<TaskTypes> {
  recreateInitialChangelog!: boolean;
  private entityChanges!: any[];

  abstract isChangelogNew({ entityName, changelogDate }): boolean;

  protected getTaskFirstArgForPriority(priorityName: string): TaskParamWithChangelogsAndApplication | TaskParamWithApplication {
    const firstArg = super.getTaskFirstArgForPriority(priorityName);
    if ([DEFAULT, WRITING_ENTITIES, POST_WRITING_ENTITIES].includes(priorityName)) {
      this.entityChanges = this.generateIncrementalChanges();
    }
    if ([DEFAULT].includes(priorityName)) {
      return { ...firstArg, entityChanges: this.entityChanges };
    }
    if ([WRITING_ENTITIES, POST_WRITING_ENTITIES].includes(priorityName)) {
      // const { entities = [] } = this.options;
      // const filteredEntities = data.entities.filter(entity => entities.includes(entity.name));
      return { ...firstArg, entityChanges: this.entityChanges };
    }
    return firstArg;
  }

  /**
   * Generate changelog from differences between the liquibase entity and current entity.
   */
  protected generateIncrementalChanges(): BaseChangelog[] {
    const recreateInitialChangelog = this.recreateInitialChangelog;
    const { generateBuiltInUserEntity, generateBuiltInAuthorityEntity, incrementalChangelog } = this.sharedData.getApplication();
    const entityNames = this.getExistingEntityNames();

    const entitiesByName = Object.fromEntries(entityNames.map(entityName => [entityName, this.sharedData.getEntity(entityName)]));
    const entitiesWithExistingChangelog = entityNames.filter(
      entityName => !this.isChangelogNew({ entityName, changelogDate: entitiesByName[entityName].annotations?.changelogDate }),
    );
    const previousEntitiesByName = Object.fromEntries(
      entityNames
        .filter(entityName => existsSync(this.getEntityConfigPath(entityName)))
        .map(entityName => [
          entityName,
          { name: entityName, ...JSON.parse(readFileSync(this.getEntityConfigPath(entityName)).toString()) },
        ]),
    );
    if (generateBuiltInUserEntity) {
      const user = this.sharedData.getEntity('User');
      previousEntitiesByName.User = user;
    }
    if (generateBuiltInAuthorityEntity) {
      const authority = this.sharedData.getEntity('Authority');
      previousEntitiesByName.Authority = authority;
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

      (this as any)._debug(`Calculating diffs for ${entityName}`);

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
