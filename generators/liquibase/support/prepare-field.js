/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import { databaseTypes, fieldTypes } from '../../../jdl/jhipster/index.js';
import { mutateData } from '../../base/support/index.js';

const { MYSQL, MARIADB } = databaseTypes;
const { CommonDBTypes, RelationalOnlyDBTypes, BlobTypes } = fieldTypes;

const { STRING, INTEGER, LONG, BIG_DECIMAL, FLOAT, DOUBLE, UUID, BOOLEAN, LOCAL_DATE, ZONED_DATE_TIME, INSTANT, DURATION } = CommonDBTypes;
const { BYTES } = RelationalOnlyDBTypes;
const { TEXT } = BlobTypes;

function parseLiquibaseColumnType(entity, field) {
  const fieldType = field.fieldType;
  if (fieldType === STRING || field.fieldIsEnum) {
    return `varchar(${field.fieldValidateRulesMaxlength || 255})`;
  }

  if (fieldType === INTEGER) {
    return 'integer';
  }

  if (fieldType === LONG) {
    return 'bigint';
  }

  if (fieldType === FLOAT) {
    // eslint-disable-next-line no-template-curly-in-string
    return '${floatType}';
  }

  if (fieldType === DOUBLE) {
    return 'double';
  }

  if (fieldType === BIG_DECIMAL) {
    return 'decimal(21,2)';
  }

  if (fieldType === LOCAL_DATE) {
    return 'date';
  }

  if (fieldType === INSTANT) {
    // eslint-disable-next-line no-template-curly-in-string
    return '${datetimeType}';
  }

  if (fieldType === ZONED_DATE_TIME) {
    // eslint-disable-next-line no-template-curly-in-string
    return '${datetimeType}';
  }

  if (fieldType === DURATION) {
    return 'bigint';
  }

  if (fieldType === UUID) {
    // eslint-disable-next-line no-template-curly-in-string
    return '${uuidType}';
  }

  if (fieldType === BYTES && field.fieldTypeBlobContent !== TEXT) {
    // eslint-disable-next-line no-template-curly-in-string
    return '${blobType}';
  }

  if (field.fieldTypeBlobContent === TEXT) {
    // eslint-disable-next-line no-template-curly-in-string
    return '${clobType}';
  }

  if (fieldType === BOOLEAN) {
    return 'boolean';
  }

  return undefined;
}

function parseLiquibaseLoadColumnType(entity, field) {
  const columnType = field.columnType;
  // eslint-disable-next-line no-template-curly-in-string
  if (['integer', 'bigint', 'double', 'decimal(21,2)', '${floatType}'].includes(columnType)) {
    return 'numeric';
  }

  if (field.fieldIsEnum) {
    return 'string';
  }

  // eslint-disable-next-line no-template-curly-in-string
  if (['date', '${datetimeType}'].includes(columnType)) {
    return 'date';
  }

  if (columnType === 'boolean') {
    return columnType;
  }

  // eslint-disable-next-line no-template-curly-in-string
  if (columnType === '${blobType}') {
    return 'blob';
  }

  // eslint-disable-next-line no-template-curly-in-string
  if (columnType === '${clobType}') {
    return 'clob';
  }

  const { prodDatabaseType } = entity;
  if (
    // eslint-disable-next-line no-template-curly-in-string
    columnType === '${uuidType}' &&
    prodDatabaseType !== MYSQL &&
    prodDatabaseType !== MARIADB
  ) {
    // eslint-disable-next-line no-template-curly-in-string
    return '${uuidType}';
  }

  return 'string';
}

export default function prepareField(entity, field) {
  mutateData(field, {
    __override__: false,
    columnType: data => parseLiquibaseColumnType(entity, data),
    liquibaseDefaultValueAttributeValue: ({ defaultValue, defaultValueComputed }) => defaultValueComputed ?? defaultValue?.toString(),
    liquibaseDefaultValueAttributeName: ({ defaultValueComputed, liquibaseDefaultValueAttributeValue }) => {
      if (liquibaseDefaultValueAttributeValue === undefined) return undefined;
      if (defaultValueComputed) return 'defaultValueComputed';
      if (field.fieldTypeNumeric) return 'defaultValueNumeric';
      if (field.fieldTypeDateTime) return 'defaultValueDate';
      if (field.fieldTypeBoolean) return 'defaultValueBoolean';
      return 'defaultValue';
    },
    shouldDropDefaultValue: data =>
      !data.liquibaseDefaultValueAttributeValue && (data.fieldType === ZONED_DATE_TIME || data.fieldType === INSTANT),
    shouldCreateContentType: data => data.fieldType === BYTES && data.fieldTypeBlobContent !== TEXT,
    columnRequired: data => data.nullable === false || (data.fieldValidate === true && data.fieldValidateRules.includes('required')),
    nullable: data => !data.columnRequired,
    loadColumnType: data => parseLiquibaseLoadColumnType(entity, data),
    liquibaseGenerateFakeData: true,
  });

  return field;
}
