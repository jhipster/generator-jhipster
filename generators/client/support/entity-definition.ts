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

import { clientFrameworkTypes, fieldTypes, validations } from '../../../lib/jhipster/index.ts';
import type { PrimaryKey, RelationshipWithEntity } from '../../base-application/types.ts';
import type { Entity as ClientEntity, Field as ClientField, Relationship as ClientRelationship } from '../types.d.ts';

import { filterRelevantRelationships } from './template-utils.ts';
import getTypescriptKeyType from './types-utils.ts';

const dbTypes = fieldTypes;
const {
  Validations: { REQUIRED },
} = validations;

const {
  STRING: TYPE_STRING,
  INTEGER: TYPE_INTEGER,
  LONG: TYPE_LONG,
  BIG_DECIMAL: TYPE_BIG_DECIMAL,
  FLOAT: TYPE_FLOAT,
  DOUBLE: TYPE_DOUBLE,
  UUID: TYPE_UUID,
  BOOLEAN: TYPE_BOOLEAN,
  LOCAL_DATE: TYPE_LOCAL_DATE,
  ZONED_DATE_TIME: TYPE_ZONED_DATE_TIME,
  INSTANT: TYPE_INSTANT,
  DURATION: TYPE_DURATION,
  LOCAL_TIME: TYPE_TIME,
} = dbTypes.CommonDBTypes;

const TYPE_BYTES = dbTypes.RelationalOnlyDBTypes.BYTES;
const TYPE_BYTE_BUFFER = dbTypes.RelationalOnlyDBTypes.BYTE_BUFFER;
const { ANGULAR, VUE } = clientFrameworkTypes;

/**
 * @private
 * Generate Entity Client Field Declarations
 *
 * @param {string} primaryKey - primary key definition
 * @param {Array|Object} fields - array of fields
 * @param {Array|Object} relationships - array of relationships
 * @param {string} dto - dto
 * @param [customDateType]
 * @param {boolean} embedded - either the actual entity is embedded or not
 * @param { string} clientFramework
 * @returns variablesWithTypes: Array
 */
const generateEntityClientFields = (
  primaryKey: PrimaryKey,
  fields: ClientField[],
  relationships: RelationshipWithEntity<ClientRelationship, ClientEntity<ClientField>>[],
  _dto: any,
  customDateType = 'dayjs.Dayjs',
  embedded = false,
  clientFramework: string = ANGULAR,
): string[] => {
  const variablesWithTypes: string[] = [];
  if (!embedded && primaryKey) {
    const tsKeyType = getTypescriptKeyType(primaryKey);
    if (clientFramework === VUE) {
      variablesWithTypes.push(`id?: ${tsKeyType}`);
    }
  }
  fields.forEach(field => {
    const fieldType = field.fieldType;
    const fieldName = field.fieldName;
    const nullable = !field.id && (field as any).nullable;
    let tsType = 'any';
    if (field.fieldIsEnum) {
      tsType = `keyof typeof ${fieldType}`;
    } else if (fieldType === TYPE_BOOLEAN) {
      tsType = 'boolean';
    } else if (([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL] as string[]).includes(fieldType)) {
      tsType = 'number';
    } else if (([TYPE_STRING, TYPE_UUID, TYPE_DURATION, TYPE_BYTES, TYPE_BYTE_BUFFER, TYPE_TIME] as string[]).includes(fieldType)) {
      tsType = 'string';
      if (([TYPE_BYTES, TYPE_BYTE_BUFFER] as string[]).includes(fieldType) && field.fieldTypeBlobContent !== 'text') {
        variablesWithTypes.push(`${fieldName}ContentType?: ${nullable ? 'string | null' : 'string'}`);
      }
    } else if (([TYPE_LOCAL_DATE, TYPE_INSTANT, TYPE_ZONED_DATE_TIME] as string[]).includes(fieldType)) {
      tsType = customDateType;
    }
    if (nullable) {
      tsType += ' | null';
    }
    variablesWithTypes.push(`${fieldName}?: ${tsType}`);
  });

  const relevantRelationships = filterRelevantRelationships(relationships);

  relevantRelationships.forEach(relationship => {
    let fieldType: string;
    let fieldName: string;
    const nullable = !relationship.relationshipValidateRules?.includes(REQUIRED);
    const relationshipType = relationship.relationshipType;
    if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
      fieldType = `I${relationship.otherEntity.entityAngularName}[]`;
      fieldName = relationship.relationshipFieldNamePlural!;
    } else {
      fieldType = `I${relationship.otherEntity.entityAngularName}`;
      fieldName = relationship.relationshipFieldName!;
    }
    if (nullable) {
      fieldType += ' | null';
    }
    variablesWithTypes.push(`${fieldName}?: ${fieldType}`);
  });
  return variablesWithTypes;
};

export default generateEntityClientFields;
