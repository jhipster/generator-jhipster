/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import path from 'path';

import { fieldTypes } from '../../../jdl/jhipster/index.mjs';
import { clientFrameworkTypes } from '../../../jdl/jhipster/index.mjs';
import { getEntryIfTypeOrTypeAttribute } from './types-utils.mjs';

const { STRING: TYPE_STRING, UUID: TYPE_UUID } = fieldTypes.CommonDBTypes;
const { ANGULAR, VUE } = clientFrameworkTypes;

/**
 * @private
 * Generate Entity Client Imports
 *
 * @param {Array|Object} relationships - array of relationships
 * @param {string} dto - dto
 * @param {string} clientFramework the client framework, 'angular', 'vue' or 'react'.
 * @returns typeImports: Map
 */
export const generateEntityClientImports = (relationships, dto, clientFramework) => {
  const typeImports = new Map();
  relationships.forEach(relationship => {
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
export const generateEntityClientEnumImports = (fields, clientFramework) => {
  const typeImports = new Map();
  const uniqueEnums = {};
  fields.forEach(field => {
    const { enumFileName, fieldType } = field;
    if (field.fieldIsEnum && (!uniqueEnums[fieldType] || (uniqueEnums[fieldType] && field.fieldValues.length !== 0))) {
      const importType = `${fieldType}`;
      const basePath = clientFramework === VUE ? '@' : 'app';
      const modelPath = clientFramework === ANGULAR ? 'entities' : 'shared/model';
      const importPath = `${basePath}/${modelPath}/enumerations/${enumFileName}.model`;
      uniqueEnums[fieldType] = field.fieldType;
      typeImports.set(importType, importPath);
    }
  });
  return typeImports;
};

/**
 * @private
 * Generate a primary key, according to the type
 *
 * @param {any} primaryKey - primary key definition
 * @param {number} index - the index of the primary key, currently it's possible to generate 2 values, index = 0 - first key (default), otherwise second key
 * @param {boolean} [wrapped=true] - wrapped values for required types.
 */

export const generateTestEntityId = (primaryKey, index = 0, wrapped = true) => {
  primaryKey = getEntryIfTypeOrTypeAttribute(primaryKey);
  let value;
  if (primaryKey === TYPE_STRING) {
    value = index === 0 ? 'ABC' : 'CBA';
  } else if (primaryKey === TYPE_UUID) {
    value = index === 0 ? '9fec3727-3421-4967-b213-ba36557ca194' : '1361f429-3817-4123-8ee3-fdf8943310b2';
  } else {
    value = index === 0 ? 123 : 456;
  }
  if (wrapped && [TYPE_UUID, TYPE_STRING].includes(primaryKey)) {
    return `'${value}'`;
  }
  return value;
};

/**
 * @private
 * Generate a test entity, according to the type
 *
 * @param references
 * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
 */
export const generateTestEntity = (references, index = 'random') => {
  const random = index === 'random';
  const entries = references
    .map(reference => {
      if (random && reference.field) {
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
 * Generate a test entity for the PK references (when the PK is a composite key)
 *
 * @param {any} primaryKey - primary key definition.
 * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
 */
export const generateTestEntityPrimaryKey = (primaryKey, index) => {
  return JSON.stringify(
    generateTestEntity(
      primaryKey.fields.map(f => f.reference),
      index
    )
  );
};

/**
 * @private
 * Get a parent folder path addition for entity
 * @param {string} clientRootFolder
 */
export const getEntityParentPathAddition = clientRootFolder => {
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
