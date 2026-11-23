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
import { fieldTypes } from '../../../lib/jhipster/index.ts';
import type { Field } from '../../../lib/jhipster/types/field.ts';

import { getBlobContentType, isBlobType } from './types/field-types.ts';

const {
  BlobTypes: { TEXT },
  RelationalOnlyDBTypes: { BYTES, BYTE_BUFFER },
} = fieldTypes;

/** The field of a blob that keeps the content type of the file it holds, which the entity has next to the blob. */
export type ContentTypeField = Field & {
  /** The name of the blob field whose content type it keeps. */
  contentTypeOf: string;
  /** The clients show it with its blob, not as a field of its own. */
  hidden: true;
  /** Stored in no column, like its blob. */
  transient?: true;
  fakerTemplate: string;
};

/** Whether a field is stored in no column, as its options not loaded yet declare it too: the ones of an entity file. */
const isTransient = (field: Field & { transient?: boolean }): boolean => Boolean(field.transient ?? field.options?.transient);

/** Whether the clients skip a field, as its options not loaded yet declare it too. */
const isSkipClient = (field: Field & { skipClient?: boolean }): boolean => Boolean(field.skipClient ?? field.options?.skipClient);

export const isContentTypeField = (field: Field): field is ContentTypeField => 'contentTypeOf' in field;

/** A blob of a file, as the entity files declare it (`ImageBlob`, `AnyBlob`, `Blob`) or as the bootstrap converts it. */
const hasContentType = (field: Field): boolean => {
  if (isBlobType(field.fieldType)) {
    return (field.fieldTypeBlobContent ?? getBlobContentType(field.fieldType)) !== TEXT;
  }
  return (field.fieldType === BYTES || field.fieldType === BYTE_BUFFER) && field.fieldTypeBlobContent !== TEXT;
};

/**
 * The fields of an entity with the content type field of each blob of a file right after the blob, as the entity files
 * declare them, the content type fields being never written to them: the database columns, the domain classes and the
 * DTOs take the content type field like any String field. The clients have it as a hidden field, which the blob shows.
 */
export const withContentTypeFields = <F extends Field>(fields: F[]): (F | ContentTypeField)[] =>
  fields
    .filter(field => !isContentTypeField(field))
    .flatMap(field => {
      if (!hasContentType(field)) return [field];
      const contentTypeField: ContentTypeField = {
        fieldName: `${field.fieldName}ContentType`,
        fieldType: 'String',
        contentTypeOf: field.fieldName,
        hidden: true,
        ...(isTransient(field) ? { transient: true } : {}),
        // The clients have it with its blob.
        ...(isSkipClient(field) ? { skipClient: true } : {}),
        // The content type of the image the fake data has.
        fakerTemplate: 'image/png',
      };
      return [field, contentTypeField];
    });

/**
 * The content type field is required when its blob is, as the blob is once prepared: the required validation of a blob
 * is dropped where its type has no validation, like the ByteBuffer of Cassandra.
 */
export const requireContentTypeFieldWithBlob = (field: Field, fields: Field[]): void => {
  if (!isContentTypeField(field)) return;
  const blob = fields.find(other => other.fieldName === field.contentTypeOf);
  if (blob?.fieldValidationRequired) {
    field.fieldValidateRules = ['required'];
  }
};
