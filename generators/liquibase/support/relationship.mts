/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { getFKConstraintName } from '../../server/support/index.mjs';

function relationshipBaseDataEquals(relationshipA, relationshipB) {
  return (
    // name is the same
    relationshipA.relationshipName === relationshipB.relationshipName &&
    relationshipA.relationshipType === relationshipB.relationshipType &&
    // related entities same
    relationshipA.entityName === relationshipB.entityName &&
    relationshipA.otherEntityName === relationshipB.otherEntityName
  );
}

/**
 * Whether the two relationships are absolutely equal
 * @param relationshipA
 * @param relationshipB
 * @returns
 */
export function relationshipEquals(relationshipA, relationshipB) {
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
export function relationshipNeedsForeignKeyRecreationOnly(relationshipA, relationshipB) {
  return (
    relationshipBaseDataEquals(relationshipA, relationshipB) &&
    (relationshipA.options?.onDelete !== relationshipB.options?.onDelete ||
      relationshipA.options?.onUpdate !== relationshipB.options?.onUpdate)
  );
}

export function prepareRelationshipForLiquibase(entity, relationship) {
  relationship.shouldWriteRelationship =
    relationship.relationshipType === 'many-to-one' || (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true);

  if (relationship.shouldWriteJoinTable) {
    const joinTableName = relationship.joinTable.name;
    const prodDatabaseType = entity.prodDatabaseType;
    _.defaults(relationship.joinTable, {
      constraintName: getFKConstraintName(joinTableName, entity.entityTableName, { prodDatabaseType }).value,
      otherConstraintName: getFKConstraintName(joinTableName, relationship.columnName, { prodDatabaseType }).value,
    });
  }

  relationship.columnDataType = relationship.otherEntity.columnType;
  return relationship;
}
