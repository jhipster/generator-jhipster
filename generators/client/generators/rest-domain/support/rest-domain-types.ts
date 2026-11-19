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
import { fieldTypes } from '../../../../../lib/jhipster/index.ts';
import type { MutateDataParam } from '../../../../../lib/utils/object.ts';
import type { RelationshipWithEntity } from '../../../../base-application/types.ts';
import type { DatabaseProperty } from '../../../../liquibase/types.d.ts';
import getTypescriptKeyType from '../../../support/types-utils.ts';
import type { Entity as ClientEntity, Field as ClientField, Relationship as ClientRelationship } from '../../../types.d.ts';

const {
  BIG_DECIMAL,
  BOOLEAN,
  DOUBLE,
  DURATION,
  FLOAT,
  INSTANT,
  INTEGER,
  LOCAL_DATE,
  LOCAL_TIME,
  LONG,
  STRING,
  TEXT_BLOB,
  UUID,
  ZONED_DATE_TIME,
} = fieldTypes.CommonDBTypes;
const { BYTES, BYTE_BUFFER } = fieldTypes.RelationalOnlyDBTypes;

/** The type of the JSON value of each field type but the dates. */
const restDomainTypeByFieldType: Record<string, string> = {
  [STRING]: 'string',
  [UUID]: 'string',
  [TEXT_BLOB]: 'string',
  // The bytes are sent in base64.
  [BYTES]: 'string',
  [BYTE_BUFFER]: 'string',
  [BOOLEAN]: 'boolean',
  [INTEGER]: 'number',
  [LONG]: 'number',
  [FLOAT]: 'number',
  [DOUBLE]: 'number',
  [BIG_DECIMAL]: 'number',
};

/** The name of the type of the strings the server sends for each date type, after the restDomainPrefix. */
const restDomainDateTypeByFieldType: Record<string, string> = {
  [LOCAL_DATE]: 'LocalDate',
  [INSTANT]: 'Instant',
  [ZONED_DATE_TIME]: 'ZonedDateTime',
  [DURATION]: 'Duration',
  [LOCAL_TIME]: 'LocalTime',
};

const asArray = (type: string) => (type.includes(' ') ? `(${type})[]` : `${type}[]`);

export const mutateRestDomainField = ({ restDomainPrefix }: { restDomainPrefix: string }) =>
  ({
    __override__: false,
    // The primary key is always sent, the other fields are null when the database has no value.
    restDomainNullable: field => !field.id && Boolean((field as DatabaseProperty).nullable),
    restDomainType: field => {
      let type: string;
      if (field.fieldIsEnum) {
        type = field.clientConstantsAsValues ? 'string' : `keyof typeof ${field.fieldType}`;
      } else {
        const dateType = restDomainDateTypeByFieldType[field.fieldType];
        type = dateType ? `${restDomainPrefix}${dateType}` : (restDomainTypeByFieldType[field.fieldType] ?? 'any');
      }
      if (field.collection) {
        type = asArray(type);
      }
      return field.restDomainNullable ? `${type} | null` : type;
    },
  }) as const satisfies MutateDataParam<ClientField>;

/**
 * The properties a new entity sends otherwise: a primary key the server generates is null, a field it generates may be null.
 */
export const getRestDomainNewProperties = (entity: ClientEntity): { name: string; type: string }[] => [
  ...(entity.primaryKey?.autoGenerate ? [{ name: entity.primaryKey.name, type: 'null' }] : []),
  ...entity.fields
    .filter(field => field.autoGenerate && !field.id && !field.restDomainNullable)
    .map(field => ({ name: field.fieldName, type: `${field.restDomainType} | null` })),
];

export const mutateRestDomainRelationship = {
  __override__: false,
  restDomainType: relationship => {
    const { otherEntity } = relationship;
    let type: string;
    if (relationship.relationshipSerializePrimaryKeyOnly) {
      // The server sends the primary keys of the other entity, like the authorities of the user.
      type = getTypescriptKeyType(otherEntity.primaryKey!);
    } else if (otherEntity.embedded || !otherEntity.primaryKey) {
      type = otherEntity.restDomainTypeName!;
    } else {
      // The other entity is sent by its primary key and the field it is displayed by.
      const keys = [...new Set([otherEntity.primaryKey.name, relationship.otherEntityField])];
      type = `Pick<${otherEntity.restDomainTypeName}, ${keys.map(key => `'${key}'`).join(' | ')}>`;
    }
    if (relationship.collection) {
      // A collection the server does not load is sent as null.
      return `${type}[] | null`;
    }
    return relationship.relationshipRequired ? type : `${type} | null`;
  },
} as const satisfies MutateDataParam<RelationshipWithEntity<ClientRelationship, ClientEntity>>;
