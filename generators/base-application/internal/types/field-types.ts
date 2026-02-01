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
