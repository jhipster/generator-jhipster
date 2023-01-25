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
import { fieldTypes } from '../../../jdl/jhipster/index.mjs';
import { fieldIsEnum } from '../../base-application/support/index.mjs';

const {
  BOOLEAN: TYPE_BOOLEAN,
  ZONED_DATE_TIME: TYPE_ZONED_DATE_TIME,
  INSTANT: TYPE_INSTANT,
  LOCAL_DATE: TYPE_LOCAL_DATE,
  INTEGER: TYPE_INTEGER,
  LONG: TYPE_LONG,
  BIG_DECIMAL: TYPE_BIG_DECIMAL,
  FLOAT: TYPE_FLOAT,
  DOUBLE: TYPE_DOUBLE,
} = fieldTypes.CommonDBTypes;

/**
 * return the input if it's a type, otherwise returns the type attribute of the input
 * @param key
 * @returns {*}
 */
export const getEntryIfTypeOrTypeAttribute = key => {
  if (typeof key === 'object') {
    return key.type;
  }
  return key;
};
/**
 * @private
 * Find key type for Typescript
 *
 * @param {string | object} primaryKey - primary key definition
 * @returns {string} primary key type in Typescript
 */
const getTypescriptKeyType = primaryKey => {
  if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(getEntryIfTypeOrTypeAttribute(primaryKey))) {
    return 'number';
  }
  return 'string';
};

/**
 * @private
 * Find type for Typescript
 *
 * @param {string} fieldType - field type
 * @returns {string} field type in Typescript
 */
export const getTypescriptType = fieldType => {
  if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(fieldType)) {
    return 'number';
  }
  if ([TYPE_LOCAL_DATE, TYPE_ZONED_DATE_TIME, TYPE_INSTANT].includes(fieldType)) {
    return 'dayjs.Dayjs';
  }
  if ([TYPE_BOOLEAN].includes(fieldType)) {
    return 'boolean';
  }
  if (fieldIsEnum(fieldType)) {
    return fieldType;
  }
  return 'string';
};

export default getTypescriptKeyType;
