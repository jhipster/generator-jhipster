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
import path from 'node:path';

import { clientFrameworkTypes, fieldTypes } from '../../../lib/jhipster/index.js';
import type { PrimaryKey } from '../../../lib/types/application/entity.js';
import type { FieldType } from '../../../lib/application/field-types.js';
import type { Field } from '../../../lib/types/application/field.js';
import { getEntryIfTypeOrTypeAttribute } from './types-utils.js';

const { STRING: TYPE_STRING, UUID: TYPE_UUID } = fieldTypes.CommonDBTypes;
const { ANGULAR, VUE } = clientFrameworkTypes;

/**
 * @private
 * Filter the relevant relationships fields on the model
 * @param {Array|Object} relationships - array of relationships
 * @returns {Array|Object} filtered relationships
 */
export const filterRelevantRelationships = relationships =>
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
export const generateEntityClientImports = (relationships, dto?, clientFramework?) => {
  const typeImports = new Map();

  const relevantRelationships = filterRelevantRelationships(relationships);

  relevantRelationships.forEach(relationship => {
    const otherEntityAngularName = relationship.otherEntityAngularName;
    const importType = `I${otherEntityAngularName}`;
    let importPath;
    if (relationship.otherEntity?.builtInUser) {
      importPath = clientFramework === ANGULAR ? 'app/entities/user/user.model' : 'app/shared/model/user.model';
    } else {
      importPath =
        clientFramework === ANGULAR
          ? `app/entities/${relationship.otherEntityClientRootFolder}${relationship.otherEntityFolderName}/${relationship.otherEntityFileName}.model`
          : `app/shared/model/${relationship.otherEntityClientRootFolder}${relationship.otherEntityFileName}.model`;
    }
    typeImports.set(importType, importPath);
  });
  return typeImports;
};

/**
 * @private
 * Generate Entity Client Enum Imports
 *
 * @param {Array|Object} fields - array of the entity fields
 * @param {string} clientFramework the client framework, 'angular' or 'react'.
 * @returns typeImports: Map
 */
export const generateEntityClientEnumImports = (fields: Field[], clientFramework: string) => {
  const typeImports = new Map();
  const uniqueEnums = {};
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
  if (index === 'random' && typeof primaryKey === 'object') {
    return primaryKey.fields[0]!.generateFakeData!('ts');
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
  if (wrapped && [TYPE_UUID, TYPE_STRING].includes(primaryKeyType)) {
    return `'${value}'`;
  }
  return value;
};

/**
 * Generate a test entity, according to the type
 */
export const generateTsTestEntityForFields = (fields: Field[]): Record<string, string | number | boolean> => {
  const entries = fields
    .map(field => {
      const { fieldWithContentType, contentTypeFieldName, fieldTypeTimed, fieldTypeLocalDate } = field;
      const fakeData = field.generateFakeData!('ts');
      if (fieldWithContentType) {
        return [
          [field.propertyName, fakeData],
          [contentTypeFieldName, "'unknown'"],
        ];
      }
      if (fieldTypeTimed || fieldTypeLocalDate) {
        return [[field.propertyName, `dayjs(${fakeData})`]];
      }
      return [[field.propertyName, fakeData]];
    })
    .flat();
  return Object.fromEntries(entries);
};

export const stringifyTsEntity = (data: Record<string, any>, options: { sep?: string } = {}): string => {
  const entries = Object.entries(data);
  const { sep = entries.length > 1 ? '\n  ' : '' } = options;
  return `{${sep}${entries.map(([key, value]) => `${key}: ${value}`).join(`,${sep}`)}${sep.trim()}}`;
};

/**
 * @private
 * @deprecated
 * Generate a test entity, according to the type
 *
 * @param references
 * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
 */
export const generateTestEntity = (references, index: 0 | 1 | 'random' = 'random') => {
  const entries = references
    .map(reference => {
      if (index === 'random') {
        const field = reference.field;
        const { fieldWithContentType, contentTypeFieldName } = field;
        const fakeData = field.generateFakeData('json-serializable');
        if (fieldWithContentType) {
          return [
            [reference.name, fakeData],
            [contentTypeFieldName, 'unknown'],
          ];
        }
        return [[reference.name, fakeData]];
      }
      return [[reference.name, generateTestEntityId(reference.type, index, false)]];
    })
    .flat();
  return Object.fromEntries(entries);
};

/**
 * @deprecated
 * Generate a test entity, according to the references
 *
 * @param references
 * @param additionalFields
 * @return {String} test sample
 */
export const generateTypescriptTestEntity = (references, additionalFields = {}) => {
  const entries = references
    .map(reference => {
      if (reference.field) {
        const field = reference.field;
        const { fieldIsEnum, fieldTypeTimed, fieldTypeLocalDate, fieldWithContentType, fieldName, contentTypeFieldName } = field;

        const fakeData = field.generateFakeData('ts');
        if (fieldWithContentType) {
          return [
            [fieldName, fakeData],
            [contentTypeFieldName, "'unknown'"],
          ];
        }
        if (fieldIsEnum) {
          return [[fieldName, fakeData]];
        }
        if (fieldTypeTimed || fieldTypeLocalDate) {
          return [[fieldName, `dayjs(${fakeData})`]];
        }
        return [[fieldName, fakeData]];
      }
      return [[reference.name, generateTestEntityId(reference.type, 'random', false)]];
    })
    .flat();
  return `{
  ${[...entries, ...Object.entries(additionalFields)].map(([key, value]) => `${key}: ${value}`).join(',\n  ')}
}`;
};

/**
 * @deprecated
 * Generate a test entity for the PK references (when the PK is a composite key)
 */
export const generateTestEntityPrimaryKey = (primaryKey, index: 0 | 1 | 'random') => {
  return JSON.stringify(
    generateTestEntity(
      primaryKey.fields.map(f => f.reference),
      index,
    ),
  );
};

/**
 * @private
 * Get a parent folder path addition for entity
 * @param {string} clientRootFolder
 */
export const getEntityParentPathAddition = (clientRootFolder: string) => {
  if (!clientRootFolder) {
    return '';
  }
  const relative = path.relative(`/app/entities/${clientRootFolder}/`, '/app/entities/');
  if (relative.includes('app')) {
    // Relative path outside angular base dir.
    throw new Error(`
    "clientRootFolder outside app base dir '${clientRootFolder}'"
`);
  }
  const entityFolderPathAddition = relative.replace(/[/|\\]?..[/|\\]entities/, '').replace('entities', '..');
  if (!entityFolderPathAddition) {
    return '';
  }
  return `${entityFolderPathAddition}/`;
};
