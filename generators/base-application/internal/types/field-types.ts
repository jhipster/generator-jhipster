import type { SetFieldType, SetRequired } from 'type-fest';
import type { Field as BaseApplicationField } from '../../types.js';
import { type FieldBinaryType, type FieldBlobType, type FieldType, blobFieldTypesValues } from '../../../../lib/jhipster/field-types.ts';

export const isBlobType = (fieldType: string): fieldType is FieldBlobType =>
  (Object.values(blobFieldTypesValues) as string[]).includes(fieldType);

export const getBlobContentType = (fieldType: FieldBlobType) => {
  if (fieldType === 'AnyBlob') {
    return 'any';
  } else if (fieldType === 'ImageBlob') {
    return 'image';
  } else if (fieldType === 'TextBlob') {
    return 'text';
  }
  return undefined;
};

export const isFieldBlobType = (field: BaseApplicationField): field is SetFieldType<BaseApplicationField, 'fieldType', FieldBlobType> =>
  isBlobType(field.fieldType);

export const isFieldBinaryType = (field: BaseApplicationField): field is SetFieldType<BaseApplicationField, 'fieldType', FieldBinaryType> =>
  isBlobType(field.fieldType) || field.fieldType === 'byte[]';

export const isFieldEnumType = (field: BaseApplicationField): field is SetRequired<BaseApplicationField, 'enumFileName' | 'enumValues'> =>
  Boolean(field.fieldValues);

export const isFieldNotEnumType = (field: BaseApplicationField): field is SetFieldType<BaseApplicationField, 'fieldType', FieldType> =>
  !field.fieldValues;

export const convertFieldBlobType = <const F extends BaseApplicationField = BaseApplicationField>(field: F): F => {
  // Convert fieldTypes to correct fieldTypes
  if (field.fieldTypeBlobContent === 'image') {
    field.fieldType = 'ImageBlob';
    field.fieldTypeBlobContent = undefined;
  } else if (field.fieldTypeBlobContent === 'any') {
    field.fieldType = 'AnyBlob';
    field.fieldTypeBlobContent = undefined;
  } else if (field.fieldTypeBlobContent === 'text') {
    field.fieldType = 'TextBlob';
    field.fieldTypeBlobContent = undefined;
  } else {
    // Unknown type is not supported.
    // Fallback to ByteBuffer for cassandra databases.
    field.fieldType = 'ByteBuffer';
  }
  return field;
};
