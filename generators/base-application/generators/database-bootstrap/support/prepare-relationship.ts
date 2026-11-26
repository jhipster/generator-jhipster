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
import type { DatabaseEntity, DatabaseField, DatabaseJoinColumn, DatabaseRelationship } from '../types.d.ts';

import databaseData from './database-data.ts';
import { calculateDbNameWithLimit, getJoinTableName } from './naming.ts';
import { hibernateSnakeCase } from './string.ts';

/** A column of a join table: the column of a field of a primary key, prefixed by the side it stands for. */
const joinColumn = (prefix: string, field: DatabaseField): DatabaseJoinColumn => ({
  name: `${prefix}_${field.columnName}`,
  referencedColumnName: field.columnName!,
  field,
});

/**
 * The properties a relationship takes from the database: the column it is stored in and, for a relational database, the
 * join table a many-to-many needs. Every generator writing a backend reads them, so they are prepared once here rather
 * than by each of them.
 */
export function prepareRelationshipForDatabase({
  application,
  entity,
  relationship,
  log,
}: {
  application: { databaseTypeSql?: boolean; prodDatabaseType?: string };
  entity: DatabaseEntity;
  relationship: DatabaseRelationship;
  log?: { warn(message: string): void };
}) {
  mutateData(relationship, {
    columnName: () => relationshipColumnName({ application, entity, relationship, log }),
    shouldWriteJoinTable: ({ ownerSide, relationshipManyToMany }) =>
      Boolean(application.databaseTypeSql && relationshipManyToMany && ownerSide),
    joinTable: ({ shouldWriteJoinTable, relationshipName }) =>
      shouldWriteJoinTable ?
        {
          name: getJoinTableName(entity.entityTableName, relationshipName, {
            prodDatabaseType: application.prodDatabaseType,
          }).value,
          // Getters, read when the files are written: the column of a field is prepared by the generator of the backend, and
          // a primary key derived from a relationship takes its fields from the other entity.
          get joinColumns() {
            return entity.primaryKey!.fields.map(field => joinColumn(entity.entityTableName, field));
          },
          get inverseJoinColumns() {
            const { otherEntity } = relationship as DatabaseRelationship & { otherEntity: DatabaseEntity };
            return otherEntity.primaryKey!.fields.map(field => joinColumn(relationship.columnName!, field));
          },
        }
      : undefined,
    // Set before columnRequired, which reads it.
    nullable: ({ relationshipValidate, relationshipRequired }) => !(relationshipValidate && relationshipRequired),
  });
  mutateData(relationship, {
    __override__: false,
    columnRequired: data => data.nullable === false || data.relationshipRequired,
    columnNameTruncated: ({ columnName, relationshipName }) => columnName !== hibernateSnakeCase(relationshipName),
  });
}

/**
 * The column of a relationship, its name in snake case, prefixing the columns of the primary key of the other entity. A
 * back reference named after its entity (see `addOtherRelationship`) adds a new column, cut to the limit of the database
 * with a hash the way the constraints are. A column named by the user is kept as it is, an existing application may rely
 * on the name a database cut silently, with a warning.
 */
function relationshipColumnName({
  application,
  entity,
  relationship,
  log,
}: {
  application: { databaseTypeSql?: boolean; prodDatabaseType?: string };
  entity: DatabaseEntity;
  relationship: DatabaseRelationship;
  log?: { warn(message: string): void };
}): string {
  const columnName = hibernateSnakeCase(relationship.relationshipName);
  const { name, columnNameMaxLength } = (application.databaseTypeSql && databaseData[application.prodDatabaseType!]) || {};
  const { otherEntity } = relationship as DatabaseRelationship & { otherEntity?: DatabaseEntity };
  const primaryKeyColumns = otherEntity?.primaryKey?.fields?.map(field => field.columnName).filter(Boolean) as string[] | undefined;
  // Only the side owning a foreign key or a join table writes the column, and a relationship of the id uses the one of the primary key.
  if (!columnNameMaxLength || !relationship.ownerSide || relationship.id || !primaryKeyColumns?.length) {
    return columnName;
  }
  const longestSuffix = Math.max(...primaryKeyColumns.map(primaryKeyColumn => primaryKeyColumn.length + 1));
  if (columnName.length + longestSuffix <= columnNameMaxLength) {
    return columnName;
  }
  const tooLong = primaryKeyColumns.map(primaryKeyColumn => `${columnName}_${primaryKeyColumn}`).join('", "');
  if (relationship.backReferenceNameDerived) {
    const cutColumnName = calculateDbNameWithLimit(
      relationship.otherEntityName,
      relationship.otherEntityRelationshipName!,
      columnNameMaxLength - longestSuffix,
      { separator: '_as_' },
    );
    log?.warn(
      `The generated column name "${tooLong}" is too long for ${name} (which has a ${columnNameMaxLength} character limit). It will be truncated to "${primaryKeyColumns.map(primaryKeyColumn => `${cutColumnName}_${primaryKeyColumn}`).join('", "')}"!`,
    );
    return cutColumnName;
  }
  log?.warn(
    `The column name "${tooLong}" of ${entity.name}.${relationship.relationshipName} is too long for ${name} (which has a ${columnNameMaxLength} character limit). Use a shorter relationship name.`,
  );
  return columnName;
}
