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
import { databaseTypes, fieldTypes } from '../../../../lib/jhipster/index.ts';
import type { PrimaryKey } from '../../../base-application/types.ts';

const dbTypes = fieldTypes;
const { STRING, UUID, LONG, INTEGER } = dbTypes.CommonDBTypes;
const { SQL } = databaseTypes;

/**
 * Returns the java value generator for the given primaryKey type
 */
export const getJavaValueGeneratorForType = (type: string) => {
  if (type === STRING) {
    return 'UUID.randomUUID().toString()';
  }
  if (type === UUID) {
    return 'UUID.randomUUID()';
  }
  if (type === INTEGER) {
    return 'intCount.incrementAndGet()';
  }
  if (type === LONG) {
    return 'longCount.incrementAndGet()';
  }
  throw new Error(`Java type ${type} does not have a random generator implemented`);
}

/**
 * @private
 * Returns the primary key value based on the primary key type, DB and default value
 *
 * @param {string} primaryKey - the primary key type
 * @param {string} databaseType - the database type
 * @param {number} defaultValue - default value
 * @returns {string} java primary key value
 */
export const getPrimaryKeyValue = (primaryKey: PrimaryKey | string, databaseType: string, defaultValue = 1): string => {
  if (typeof primaryKey === 'object' && primaryKey.composite) {
    return `new ${primaryKey.type}(${primaryKey.fields
      .map(ref => getPrimaryKeyValue(ref.fieldType, databaseType, defaultValue))
      .join(', ')})`;
  }
  const random = ![1,2].includes(defaultValue);
  const primaryKeyType = typeof primaryKey === 'string' ? primaryKey : primaryKey.type;
  if (primaryKeyType === STRING) {
    if (databaseType === SQL && random) {
      return getJavaValueGeneratorForType(primaryKeyType);
    }
    return `"id${defaultValue}"`;
  }
  if (primaryKeyType === UUID) {
    return getJavaValueGeneratorForType(primaryKeyType);
  }
  return `${defaultValue}L`;
}
