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

import type { SetFieldType, SetRequired } from 'type-fest';

import { type FieldBinaryType, type FieldBlobType, type FieldType, blobFieldTypesValues } from '../../../../lib/jhipster/field-types.ts';
import type { Field as BaseApplicationField } from '../../types.ts';

export const isBlobType = (fieldType: string): fieldType is FieldBlobType =>
  (Object.values(blobFieldTypesValues) as string[]).includes(fieldType);

export const getBlobContentType = (fieldType: FieldBlobType) => {
  switch (fieldType) {
    case 'AnyBlob': {
      return 'any';
    }
    case 'ImageBlob': {
      return 'image';
    }
    case 'TextBlob': {
      return 'text';
    }
    default: {
      return undefined;
    }
  }
};

export const isFieldBlobType = (field: BaseApplicationField): field is SetFieldType<BaseApplicationField, 'fieldType', FieldBlobType> =>
  isBlobType(field.fieldType);

export const isFieldBinaryType = (field: BaseApplicationField): field is SetFieldType<BaseApplicationField, 'fieldType', FieldBinaryType> =>
  isBlobType(field.fieldType) || field.fieldType === 'byte[]';

export const isFieldEnumType = (field: BaseApplicationField): field is SetRequired<BaseApplicationField, 'enumFileName' | 'enumValues'> =>
  Boolean(field.fieldValues);

export const isFieldNotEnumType = (field: BaseApplicationField): field is SetFieldType<BaseApplicationField, 'fieldType', FieldType> =>
  !field.fieldValues;

export function convertFieldBlobType<const F extends BaseApplicationField = BaseApplicationField>(field: F): F {
  // Convert fieldTypes to correct fieldTypes
  switch (field.fieldTypeBlobContent) {
    case 'image': {
      field.fieldType = 'ImageBlob';
      field.fieldTypeBlobContent = undefined;
      break;
    }
    case 'any': {
      field.fieldType = 'AnyBlob';
      field.fieldTypeBlobContent = undefined;
      break;
    }
    case 'text': {
      field.fieldType = 'TextBlob';
      field.fieldTypeBlobContent = undefined;
      break;
    }
    default: {
      // Unknown type is not supported.
      // Fallback to ByteBuffer for cassandra databases.
      field.fieldType = 'ByteBuffer';
      break;
    }
  }
  return field;
}
