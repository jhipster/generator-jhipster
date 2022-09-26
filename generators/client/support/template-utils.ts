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
import assert from 'node:assert';

import type { FieldType } from '../../../lib/jhipster/field-types.ts';
import { clientFrameworkTypes, fieldTypes } from '../../../lib/jhipster/index.ts';
import { normalizePathEnd } from '../../../lib/utils/path.ts';
import type {
  Field as BaseApplicationField,
  PrimaryKey,
  Relationship as BaseApplicationRelationship,
  RelationshipWithEntity,
} from '../../base-application/types.ts';
import type { Entity as ClientEntity, Field as ClientField, Relationship as ClientRelationship } from '../types.ts';

import { getEntryIfTypeOrTypeAttribute } from './types-utils.ts';

const { STRING: TYPE_STRING, UUID: TYPE_UUID } = fieldTypes.CommonDBTypes;
const { ANGULAR, VUE } = clientFrameworkTypes;

/**
 * @private
 * Filter the relevant relationships fields on the model
 * @param {Array|Object} relationships - array of relationships
 * @returns {Array|Object} filtered relationships
 */
export const filterRelevantRelationships = <const R extends BaseApplicationRelationship>(relationships: R[]): R[] =>
  relationships.filter(rel => rel.persistableRelationship || rel.relationshipEagerLoad);

/**
 * @private
 * Generate Entity Client Imports
 *
 * @param {Array|Object} relationships - array of relationships
 * @param {string} dto - dto
 * @param {string} clientFramework the client framework, 'angular', 'vue' or 'react'.
 * @returns typeImports: Map
 */
export const generateEntityClientImports = (
  relationships: RelationshipWithEntity<ClientRelationship, ClientEntity>[],
  _dto?: string,
  clientFramework?: string,
): Map<string, string> => {
  const typeImports = new Map<string, string>();

  const relevantRelationships = filterRelevantRelationships(relationships);

  relevantRelationships.forEach(relationship => {
    const importType = `I${relationship.otherEntity.entityAngularName}`;
    let importPath: string;
    if (relationship.otherEntity?.builtInUser) {
      importPath = clientFramework === ANGULAR ? 'app/entities/user/user.model' : 'app/shared/model/user.model';
    } else {
      importPath =
        clientFramework === ANGULAR
          ? `app/entities/${normalizePathEnd(relationship.otherEntity.clientRootFolder)}${relationship.otherEntity.entityFileName}.model`
          : `app/shared/model/${normalizePathEnd(relationship.otherEntity.clientRootFolder)}${relationship.otherEntity.entityFileName}.model`;
    }
    typeImports.set(importType, importPath);
  });
  return typeImports;
};

/**
 * @private
 * Generate Entity Client Enum Imports
 */
export const generateEntityClientEnumImports = (fields: BaseApplicationField[], clientFramework: string): Map<string, string> => {
  const typeImports = new Map();
  const uniqueEnums: Record<string, string> = {};
  for (const field of fields) {
    const { enumFileName, fieldType } = field;
    if (field.fieldIsEnum && (!uniqueEnums[fieldType] || (uniqueEnums[fieldType] && field.fieldValues?.length !== 0))) {
      const importType = `${fieldType}`;
      const basePath = clientFramework === VUE ? '@' : 'app';
      const modelPath = clientFramework === ANGULAR ? 'entities' : 'shared/model';
      const importPath = `${basePath}/${modelPath}/enumerations/${enumFileName}.model`;
      uniqueEnums[fieldType] = field.fieldType;
      typeImports.set(importType, importPath);
    }
  }
  return typeImports;
};

/**
 * @private
 * Generate a primary key, according to the type
 */

export const generateTestEntityId = (primaryKey: FieldType | PrimaryKey, index: 0 | 1 | 'random' = 0, wrapped = true): string | number => {
  if (typeof primaryKey === 'object') {
    return primaryKey.fields!.map(f => {
      if (index === 'random') {
        return f.generateFakeData!('ts');
      }
      return generateTestEntityId(f.fieldType as FieldType, index, wrapped);
    }).join(', ');
  }

  assert(index === 0 || index === 1, 'index must be 0 or 1');

  const primaryKeyType = getEntryIfTypeOrTypeAttribute(primaryKey);
  let value: string | number;
  if (primaryKeyType === TYPE_STRING) {
    value = index === 0 ? 'ABC' : 'CBA';
  } else if (primaryKeyType === TYPE_UUID) {
    value = index === 0 ? '9fec3727-3421-4967-b213-ba36557ca194' : '1361f429-3817-4123-8ee3-fdf8943310b2';
  } else {
    value = index === 0 ? 123 : 456;
  }
  if (wrapped && ([TYPE_UUID, TYPE_STRING] as string[]).includes(primaryKeyType)) {
    return `'${value}'`;
  }
  return value;
};

/**
 * Generate a test entity, according to the type.
 * Handles derived fields by building nested structures using path.
 */
export const generateTsTestEntityForFields = (fields: ClientField[], index?: 0 | 1): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const field of fields) {
    const { fieldWithContentType, contentTypeFieldName, fieldTypeTimed, fieldTypeLocalDate } = field;
    let fakeData: any = index !== undefined ? generateTestEntityId(field.fieldType as FieldType, index, true) : field.generateFakeData!('ts');

    if (fieldTypeTimed || fieldTypeLocalDate) {
      fakeData = `dayjs(${fakeData})`;
    }

    // Use path for nested structure (maintains proper nesting for composite keys),
    // otherwise use propertyName
    const path = field.path ?? [field.propertyName];

    // Build nested structure
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] ??= {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = fakeData;

    if (fieldWithContentType) {
      result[contentTypeFieldName!] = "'unknown'";
    }
  }

  return result;
};

/**
 * Generate flat route params for primary key fields (uses fieldName, not derivedPath).
 */
export const generateTsTestPrimaryKeyRouteParams = (fields: ClientField[], index: 0 | 1): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const field of fields) {
    result[field.fieldName] = generateTestEntityId(field.fieldType as FieldType, index, true);
  }
  return result;
};

/**
 * Recursively stringifies an object for TypeScript code.
 */
export const stringifyTsEntity = (data: Record<string, any>, options: { sep?: string } = {}): string => {
  const entries = Object.entries(data);
  const { sep = entries.length > 1 ? '\n  ' : '' } = options;

  const stringifyValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      // Nested object - stringify recursively without separator
      return stringifyTsEntity(value, { sep: '' });
    }
    return String(value);
  };

  return `{${sep}${entries.map(([key, value]) => `${key}: ${stringifyValue(value)}`).join(`,${sep}`)}${sep.trim()}}`;
};

/**
 * @private
 * @deprecated
 * Generate a test entity, according to the type
 */
export const generateTestEntity = (fields: BaseApplicationField[], index: 0 | 1 | 'random' = 'random') => {
  const entries = fields
    .map(field => {
      if (index === 'random') {
        const { fieldWithContentType, contentTypeFieldName } = field;
        const fakeData = field.generateFakeData!('json-serializable');
        if (fieldWithContentType) {
          return [
            [field.propertyName, fakeData],
            [contentTypeFieldName, 'unknown'],
          ];
        }
        return [[field.propertyName, fakeData]];
      }
      return [[field.propertyName, generateTestEntityId(field.fieldType as FieldType, index, false)]];
    })
    .flat();
  return Object.fromEntries(entries);
};
