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
import { mutateData } from '../../../../../lib/utils/index.ts';
import type { DatabaseEntity, DatabaseRelationship } from '../types.d.ts';

import { getJoinTableName } from './naming.ts';
import { hibernateSnakeCase } from './string.ts';

/**
 * The properties a relationship takes from the database: the column it is stored in and, for a relational database, the
 * join table a many-to-many needs. Every generator writing a backend reads them, so they are prepared once here rather
 * than by each of them.
 */
export function prepareRelationshipForDatabase({
  application,
  entity,
  relationship,
}: {
  application: { databaseTypeSql?: boolean; prodDatabaseType?: string };
  entity: DatabaseEntity;
  relationship: DatabaseRelationship;
}) {
  mutateData(relationship, {
    columnName: ({ relationshipName }) => hibernateSnakeCase(relationshipName),
    shouldWriteJoinTable: ({ ownerSide, relationshipManyToMany }) =>
      Boolean(application.databaseTypeSql && relationshipManyToMany && ownerSide),
    joinTable: ({ shouldWriteJoinTable, relationshipName }) =>
      shouldWriteJoinTable ?
        {
          name: getJoinTableName(entity.entityTableName, relationshipName, {
            prodDatabaseType: application.prodDatabaseType,
          }).value,
        }
      : undefined,
    // Set before columnRequired, which reads it.
    nullable: ({ relationshipValidate, relationshipRequired }) => !(relationshipValidate && relationshipRequired),
  });
  mutateData(relationship, {
    __override__: false,
    columnRequired: data => data.nullable === false || data.relationshipRequired,
  });
}
