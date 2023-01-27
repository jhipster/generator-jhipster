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
import { fieldTypes, databaseTypes } from '../../../../jdl/jhipster/index.mjs';

const dbTypes = fieldTypes;
const { STRING, UUID, LONG } = dbTypes.CommonDBTypes;
const { SQL } = databaseTypes;

/**
 * @private
 */
// eslint-disable-next-line import/prefer-default-export
export const getJavaValueGeneratorForType = (type) => {
  if (type === STRING) {
    return 'UUID.randomUUID().toString()';
  }
  if (type === UUID) {
    return 'UUID.randomUUID()';
  }
  if (type === LONG) {
    return 'count.incrementAndGet()';
  }
  throw new Error(`Java type ${type} does not have a random generator implemented`);
}

/**
 * @private
 * Returns the primary key value based on the primary key type, DB and default value
 *
 * @param {string} primaryKey - the primary key type
 * @param {string} databaseType - the database type
 * @param {string} defaultValue - default value
 * @returns {string} java primary key value
 */
export const getPrimaryKeyValue = (primaryKey, databaseType, defaultValue = 1) => {
  if (typeof primaryKey === 'object' && primaryKey.composite) {
    return `new ${primaryKey.type}(${primaryKey.references
      .map(ref => getPrimaryKeyValue(ref.type, databaseType, defaultValue))
      .join(', ')})`;
  }
  const primaryKeyType = typeof primaryKey === 'string' ? primaryKey : primaryKey.type;
  if (primaryKeyType === STRING) {
    if (databaseType === SQL && defaultValue === 0) {
      return getJavaValueGeneratorForType(primaryKeyType);
    }
    return `"id${defaultValue}"`;
  }
  if (primaryKeyType === UUID) {
    return getJavaValueGeneratorForType(primaryKeyType);
  }
  return `${defaultValue}L`;
}
