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
import { reservedKeywords } from '../../../../../lib/jhipster/index.ts';
import { mutateData } from '../../../../../lib/utils/index.ts';
import { snakeCase } from '../../../../../lib/utils/string-utils.ts';
import type { DatabaseEntity, DatabaseField } from '../types.d.ts';

import { getUXConstraintName } from './naming.ts';

const { isReservedTableName } = reservedKeywords;

/**
 * The column of a field: its name in snake case, prefixed by the table prefix of JHipster when it is a reserved keyword
 * of the database, and the name of its unique constraint. A name the field already has is kept, the column follows it.
 */
export function prepareFieldColumnForDatabase({
  application,
  entity,
  field,
  log,
}: {
  application: { jhiTablePrefix?: string; databaseType?: string; prodDatabaseType?: string };
  entity: DatabaseEntity;
  field: DatabaseField;
  log: { warn: (message: string) => void };
}) {
  if (field.fieldNameAsDatabaseColumn === undefined) {
    const fieldNameUnderscored = snakeCase(field.fieldName);
    if (isReservedTableName(fieldNameUnderscored, application.prodDatabaseType ?? application.databaseType!)) {
      if (application.jhiTablePrefix) {
        field.fieldNameAsDatabaseColumn = `${application.jhiTablePrefix}_${fieldNameUnderscored}`;
      } else {
        log.warn(
          `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`,
        );
        field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
      }
    } else {
      field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
    }
  }

  field.columnName = field.fieldNameAsDatabaseColumn;
  if (field.unique) {
    field.uniqueConstraintName = getUXConstraintName(entity.entityTableName, field.columnName, {
      prodDatabaseType: application.prodDatabaseType,
    }).value;
  }
}

/**
 * Whether the column of a field may be null, and whether it is required. Every generator writing a backend reads them,
 * so they are prepared once here rather than by the generator of the changelog alone.
 */
export function prepareFieldForDatabase({ field }: { field: DatabaseField }) {
  mutateData(field, {
    __override__: false,
    // Set before nullable, which reads it.
    columnRequired: data => data.nullable === false || (data.fieldValidate && data.fieldValidateRules?.includes('required')),
    nullable: data => !data.columnRequired,
  });
}
