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

import { snakeCase } from 'lodash-es';
import validations from '../jdl/core/built-in-options/validations.js';

const {
  Validations: { REQUIRED, UNIQUE, MAX, MAXBYTES, MAXLENGTH, MIN, MINBYTES, MINLENGTH, PATTERN },
} = validations;

export const CommonDBTypes = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Double',
  UUID: 'UUID',
  ENUM: 'Enum',
  BOOLEAN: 'Boolean',
  LOCAL_DATE: 'LocalDate',
  ZONED_DATE_TIME: 'ZonedDateTime',
  BLOB: 'Blob',
  ANY_BLOB: 'AnyBlob',
  IMAGE_BLOB: 'ImageBlob',
  TEXT_BLOB: 'TextBlob',
  INSTANT: 'Instant',
  DURATION: 'Duration',
  BYTES: 'byte[]', // Supported by mongodb at CI samples
  BYTE_BUFFER: 'ByteBuffer', // Supported by cassandra at CI samples
  LOCAL_TIME: 'LocalTime',
} as const;

export const RelationalOnlyDBTypes = {
  BYTES: 'byte[]',
  BYTE_BUFFER: 'ByteBuffer',
} as const;

export const BlobTypes = {
  IMAGE: 'image',
  ANY: 'any',
  TEXT: 'text',
} as const;

const CommonDBValidations = {
  String: new Set([REQUIRED, UNIQUE, MINLENGTH, MAXLENGTH, PATTERN]),
  Integer: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Long: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  BigDecimal: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Float: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Double: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Enum: new Set([REQUIRED, UNIQUE]),
  Boolean: new Set([REQUIRED, UNIQUE]),
  LocalDate: new Set([REQUIRED, UNIQUE]),
  ZonedDateTime: new Set([REQUIRED, UNIQUE]),
  Blob: new Set([REQUIRED, UNIQUE, MINBYTES, MAXBYTES]),
  AnyBlob: new Set([REQUIRED, UNIQUE, MINBYTES, MAXBYTES]),
  ImageBlob: new Set([REQUIRED, UNIQUE, MINBYTES, MAXBYTES]),
  TextBlob: new Set([REQUIRED, UNIQUE]),
  UUID: new Set([REQUIRED, UNIQUE]),
  Instant: new Set([REQUIRED, UNIQUE]),
  Duration: new Set([REQUIRED, UNIQUE]),
  LocalTime: new Set([REQUIRED, UNIQUE]),
};

export default {
  CommonDBTypes,
  RelationalOnlyDBTypes,
  isCommonDBType,
  hasValidation,
  BlobTypes,
};

export function isCommonDBType(type: string): boolean {
  if (!type) {
    throw new Error('The passed type must not be nil.');
  }

  return snakeCase(type).toUpperCase() in CommonDBTypes;
}

export function hasValidation(type: string, validation: string, isAnEnum?: boolean): boolean {
  if (!type || !validation) {
    throw new Error('The passed type and value must not be nil.');
  }
  if (isAnEnum) {
    type = 'Enum';
  }
  return isCommonDBType(type) && (CommonDBValidations as Record<string, Set<string>>)[type].has(validation);
}

export const blobFieldTypesValues = {
  BLOB: 'Blob',
  ANY_BLOB: 'AnyBlob',
  IMAGE_BLOB: 'ImageBlob',
  TEXT_BLOB: 'TextBlob',
} as const;

export const fieldTypesValues = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Double',
  UUID: 'UUID',
  ENUM: 'Enum',
  BOOLEAN: 'Boolean',
  LOCAL_DATE: 'LocalDate',
  ZONED_DATE_TIME: 'ZonedDateTime',
  INSTANT: 'Instant',
  DURATION: 'Duration',
  TIME: 'LocalTime',
  BYTES: 'byte[]', // Supported by mongodb at CI samples
  BYTE_BUFFER: 'ByteBuffer',
  ...blobFieldTypesValues,
} as const;

export type FieldType = (typeof fieldTypesValues)[keyof typeof fieldTypesValues];

export type FieldBlobType = (typeof blobFieldTypesValues)[keyof typeof blobFieldTypesValues];

export type FieldBinaryType = (typeof blobFieldTypesValues)[keyof typeof blobFieldTypesValues] | 'byte[]';
