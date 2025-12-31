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
import { mutateData } from '../../../lib/utils/index.ts';
import { getFKConstraintName, prepareRelationshipForDatabase } from '../../server/support/index.ts';
import type { Application as LiquibaseApplication, Entity as LiquibaseEntity, Relationship as LiquibaseRelationship } from '../types.ts';

function relationshipBaseDataEquals(relationshipA: LiquibaseRelationship, relationshipB: LiquibaseRelationship) {
  return (
    // name is the same
    relationshipA.relationshipName === relationshipB.relationshipName &&
    relationshipA.relationshipType === relationshipB.relationshipType &&
    relationshipA.otherEntityName === relationshipB.otherEntityName
  );
}

/**
 * Whether the two relationships are absolutely equal
 * @param relationshipA
 * @param relationshipB
 * @returns
 */
export function relationshipEquals(relationshipA: LiquibaseRelationship, relationshipB: LiquibaseRelationship) {
  return (
    relationshipBaseDataEquals(relationshipA, relationshipB) &&
    // relevant options the very same
    relationshipA.options?.onDelete === relationshipB.options?.onDelete &&
    relationshipA.options?.onUpdate === relationshipB.options?.onUpdate
  );
}

/**
 * Whether the two relationships are equal, except for the foreign key on handlers, indicating that foreign key recreation is sufficient
 * @param relationshipA
 * @param relationshipB
 * @returns
 */
export function relationshipNeedsForeignKeyRecreationOnly(relationshipA: LiquibaseRelationship, relationshipB: LiquibaseRelationship) {
  return (
    relationshipBaseDataEquals(relationshipA, relationshipB) &&
    (relationshipA.options?.onDelete !== relationshipB.options?.onDelete ||
      relationshipA.options?.onUpdate !== relationshipB.options?.onUpdate)
  );
}

export function prepareRelationshipForLiquibase({
  application,
  entity,
  relationship,
}: {
  application: LiquibaseApplication<LiquibaseEntity>;
  entity: LiquibaseEntity;
  relationship: LiquibaseRelationship;
}) {
  prepareRelationshipForDatabase({ application: application as any, entity, relationship });
  mutateData(relationship, {
    unique: ({ id, ownerSide, relationshipOneToOne }) => id || (ownerSide && relationshipOneToOne),
    nullable: ({ relationshipValidate, relationshipRequired }) => !(relationshipValidate === true && relationshipRequired),
  });

  relationship.shouldWriteRelationship =
    relationship.relationshipType === 'many-to-one' || (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true);

  if (relationship.shouldWriteJoinTable) {
    const joinTableName = relationship.joinTable!.name;
    const prodDatabaseType = (entity as any).prodDatabaseType;
    mutateData(relationship.joinTable!, {
      constraintName: getFKConstraintName(joinTableName, entity.entityTableName, { prodDatabaseType }).value,
      otherConstraintName: getFKConstraintName(joinTableName, relationship.columnName!, { prodDatabaseType }).value,
    });
  }

  mutateData(relationship, {
    __override__: false,
    columnDataType: (data: any) => data.otherEntity.columnType,
    columnRequired: data => data.nullable === false || data.relationshipRequired,
    liquibaseGenerateFakeData: data => data.columnRequired && data.persistableRelationship && !data.collection,
  });

  return relationship;
}
