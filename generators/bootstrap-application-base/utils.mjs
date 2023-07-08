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
import _ from 'lodash';
import { authenticationTypes, databaseTypes, fieldTypes } from '../../jdl/jhipster/index.mjs';
import { loadRequiredConfigIntoEntity } from '../base-application/support/index.mjs';
import { hibernateSnakeCase } from '../server/support/string.mjs';

const { CASSANDRA } = databaseTypes;
const { OAUTH2 } = authenticationTypes;
const { CommonDBTypes } = fieldTypes;

const { STRING: TYPE_STRING } = CommonDBTypes;

// eslint-disable-next-line import/prefer-default-export
export function createUserEntity(customUserData = {}, application) {
  const userEntityDefinition = this.getEntityConfig('User')?.getAll();
  if (userEntityDefinition) {
    if (userEntityDefinition.relationships && userEntityDefinition.relationships.length > 0) {
      this.log.warn('Relationships on the User entity side will be disregarded');
    }
    if (userEntityDefinition.fields && userEntityDefinition.fields.some(field => field.fieldName !== 'id')) {
      this.log.warn('Fields on the User entity side (other than id) will be disregarded');
    }
  }

  // Create entity definition for built-in entity to make easier to deal with relationships.
  const user = {
    name: 'User',
    builtIn: true,
    entityTableName: `${hibernateSnakeCase(application.jhiPrefix)}_user`,
    relationships: [],
    fields: userEntityDefinition ? userEntityDefinition.fields || [] : [],
    dto: true,
    adminUserDto: `AdminUser${application.dtoSuffix ?? ''}`,
    builtInUser: true,
    ...customUserData,
  };

  loadRequiredConfigIntoEntity(user, application);
  // Fallback to defaults for test cases.
  loadRequiredConfigIntoEntity(user, this.jhipsterConfigWithDefaults);

  const oauth2 = user.authenticationType === OAUTH2;
  // If oauth2 or databaseType is cassandra, force type string, otherwise keep undefined for later processing.
  const userIdType = oauth2 || user.databaseType === CASSANDRA ? TYPE_STRING : undefined;
  const fieldValidateRulesMaxlength = userIdType === TYPE_STRING ? 100 : undefined;

  addOrExtendFields(user.fields, [
    {
      fieldName: 'id',
      fieldType: userIdType,
      fieldValidateRulesMaxlength,
      fieldTranslationKey: 'global.field.id',
      fieldNameHumanized: 'ID',
      id: true,
      builtIn: true,
    },
    {
      fieldName: 'login',
      fieldType: TYPE_STRING,
      builtIn: true,
    },
    {
      fieldName: 'firstName',
      fieldType: TYPE_STRING,
      builtIn: true,
    },
    {
      fieldName: 'lastName',
      fieldType: TYPE_STRING,
      builtIn: true,
    },
  ]);

  return user;
}

function addOrExtendFields(fields, fieldsToAdd) {
  fieldsToAdd = [].concat(fieldsToAdd);
  for (const fieldToAdd of fieldsToAdd) {
    const { fieldName: newFieldName, id } = fieldToAdd;
    let field = fields.find(field => field.fieldName === newFieldName);
    if (!field) {
      field = { ...fieldToAdd };
      if (id) {
        fields.unshift(field);
      } else {
        fields.push(field);
      }
    } else {
      _.defaults(field, fieldToAdd);
    }
  }
}
