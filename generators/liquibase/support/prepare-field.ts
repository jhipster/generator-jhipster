/* eslint-disable no-template-curly-in-string */
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

import type { ValueOf } from 'type-fest';
import { databaseTypes, fieldTypes } from '../../../lib/jhipster/index.js';
import { fieldTypesValues } from '../../../lib/jhipster/field-types.ts';
import { mutateData } from '../../../lib/utils/index.js';
import type { Application as LiquibaseApplication, Entity as LiquibaseEntity, Field as LiquibaseField } from '../types.d.ts';

const { MYSQL, MARIADB } = databaseTypes;
const { CommonDBTypes, RelationalOnlyDBTypes, BlobTypes } = fieldTypes;

const { ZONED_DATE_TIME, INSTANT } = CommonDBTypes;
const { BYTES } = RelationalOnlyDBTypes;
const { TEXT } = BlobTypes;

const liquibaseFieldTypeByFieldType = {
  [fieldTypesValues.INTEGER]: 'integer',
  [fieldTypesValues.LONG]: 'bigint',
  [fieldTypesValues.FLOAT]: '${floatType}',
  [fieldTypesValues.DOUBLE]: 'double',
  [fieldTypesValues.BIG_DECIMAL]: 'decimal(21,2)',
  [fieldTypesValues.LOCAL_DATE]: 'date',
  [fieldTypesValues.ZONED_DATE_TIME]: '${datetimeType}',
  [fieldTypesValues.INSTANT]: '${datetimeType}',
  [fieldTypesValues.DURATION]: 'bigint',
  [fieldTypesValues.TIME]: '${timeType}',
  [fieldTypesValues.UUID]: '${uuidType}',
  [fieldTypesValues.BYTES]: '${blobType}',
  [fieldTypesValues.STRING]: 'varchar',
  [fieldTypesValues.BOOLEAN]: 'boolean',
  [fieldTypesValues.ENUM]: 'string',
  [fieldTypesValues.BYTE_BUFFER]: '${blobType}',
  [fieldTypesValues.BLOB]: '${blobType}',
  [fieldTypesValues.ANY_BLOB]: '${blobType}',
  [fieldTypesValues.IMAGE_BLOB]: '${blobType}',
  [fieldTypesValues.TEXT_BLOB]: '${clobType}',
} as const satisfies Record<ValueOf<typeof fieldTypesValues>, string>;

export type LiquibaseColumnType = ValueOf<typeof liquibaseFieldTypeByFieldType>;

function parseLiquibaseColumnType(field: LiquibaseField): LiquibaseColumnType {
  const liquibaseColumnType = liquibaseFieldTypeByFieldType[field.fieldType as keyof typeof liquibaseFieldTypeByFieldType];
  if (liquibaseColumnType === 'varchar' || field.fieldIsEnum) {
    return `varchar(${field.fieldValidateRulesMaxlength || 255})` as 'varchar';
  }

  if (liquibaseColumnType === '${blobType}' && field.fieldTypeBlobContent === TEXT) {
    return liquibaseFieldTypeByFieldType[fieldTypesValues.TEXT_BLOB];
  }

  return liquibaseColumnType;
}

export const liquibaseLoadColumnTypeByFieldType = {
  integer: 'numeric',
  bigint: 'numeric',
  double: 'numeric',
  'decimal(21,2)': 'numeric',
  '${floatType}': 'numeric',
  date: 'date',
  '${datetimeType}': 'date',
  '${timeType}': 'time',
  boolean: 'boolean',
  '${blobType}': 'blob',
  '${clobType}': 'clob',
  varchar: 'string',
  string: 'string',
  '${uuidType}': '${uuidType}',
} as const satisfies Record<LiquibaseColumnType, string>;

export type LiquibaseLoadColumnType = ValueOf<typeof liquibaseLoadColumnTypeByFieldType>;

function parseLiquibaseLoadColumnType(application: LiquibaseApplication<LiquibaseEntity>, field: LiquibaseField): LiquibaseLoadColumnType {
  const columnType = field.columnType!;

  if (field.fieldIsEnum) {
    return liquibaseLoadColumnTypeByFieldType.string;
  }

  const { prodDatabaseType } = application;
  if (columnType === '${uuidType}' && (prodDatabaseType === MYSQL || prodDatabaseType === MARIADB)) {
    return liquibaseLoadColumnTypeByFieldType.string;
  }

  return liquibaseLoadColumnTypeByFieldType[columnType] ?? liquibaseLoadColumnTypeByFieldType.string;
}

export default function prepareField(application: LiquibaseApplication<LiquibaseEntity>, field: LiquibaseField): LiquibaseField {
  mutateData(field, {
    __override__: false,
    columnType: data => parseLiquibaseColumnType(data),
    loadColumnType: data => parseLiquibaseLoadColumnType(application, data),
    liquibaseDefaultValueAttributeValue: ({ defaultValue, defaultValueComputed }) => defaultValueComputed ?? defaultValue?.toString(),
    liquibaseDefaultValueAttributeName: ({ loadColumnType, defaultValueComputed, liquibaseDefaultValueAttributeValue }) => {
      if (liquibaseDefaultValueAttributeValue === undefined) return undefined;
      if (defaultValueComputed) return 'defaultValueComputed';
      if (loadColumnType === 'numeric') return 'defaultValueNumeric';
      if (field.fieldTypeBoolean) return 'defaultValueBoolean';
      return 'defaultValue';
    },
    shouldDropDefaultValue: data =>
      !data.liquibaseDefaultValueAttributeValue && (data.fieldType === ZONED_DATE_TIME || data.fieldType === INSTANT),
    shouldCreateContentType: data => data.fieldType === BYTES && data.fieldTypeBlobContent !== TEXT,
    columnRequired: data => data.nullable === false || (data.fieldValidate === true && data.fieldValidateRules?.includes('required')),
    nullable: data => !data.columnRequired,
    liquibaseGenerateFakeData: true,
  });

  return field;
}
