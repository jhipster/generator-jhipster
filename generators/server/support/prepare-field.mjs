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
import assert from 'assert';
import _ from 'lodash';

import { databaseTypes, entityOptions, fieldTypes, reservedKeywords } from '../../../jdl/jhipster/index.mjs';
import { getUXConstraintName } from './database.mjs';
import { hibernateSnakeCase } from './string.mjs';

const TYPE_BYTES = fieldTypes.RelationalOnlyDBTypes.BYTES;
const TYPE_BYTE_BUFFER = fieldTypes.RelationalOnlyDBTypes.BYTE_BUFFER;

const { isReservedTableName } = reservedKeywords;
const { CommonDBTypes } = fieldTypes;
const { MYSQL, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;

const { MAPSTRUCT } = MapperTypes;
const { LONG, UUID } = CommonDBTypes;

const { snakeCase, upperFirst } = _;

export default function prepareField(entityWithConfig, field, generator) {
  if (field.mapstructExpression) {
    assert.equal(
      entityWithConfig.dto,
      MAPSTRUCT,
      `@MapstructExpression requires an Entity with mapstruct dto [${entityWithConfig.name}.${field.fieldName}].`
    );
    // Remove from Entity.java and liquibase.
    field.transient = true;
    // Disable update form.
    field.readonly = true;
  }

  if (field.id && entityWithConfig.primaryKey) {
    if (field.autoGenerate === undefined) {
      field.autoGenerate = !entityWithConfig.primaryKey.composite && [LONG, UUID].includes(field.fieldType);
    }

    if (!field.autoGenerate) {
      field.liquibaseAutoIncrement = false;
      field.jpaGeneratedValue = false;
      field.autoGenerateByService = false;
      field.autoGenerateByRepository = false;
      field.requiresPersistableImplementation = true;
    } else if (entityWithConfig.databaseType !== SQL) {
      field.liquibaseAutoIncrement = false;
      field.jpaGeneratedValue = false;
      field.autoGenerateByService = field.fieldType === UUID;
      field.autoGenerateByRepository = !field.autoGenerateByService;
      field.requiresPersistableImplementation = false;
      field.readonly = true;
    } else if (entityWithConfig.reactive) {
      field.liquibaseAutoIncrement = field.fieldType === LONG;
      field.jpaGeneratedValue = false;
      field.autoGenerateByService = !field.liquibaseAutoIncrement;
      field.autoGenerateByRepository = !field.autoGenerateByService;
      field.requiresPersistableImplementation = !field.liquibaseAutoIncrement;
      field.readonly = true;
    } else {
      const defaultGenerationType = entityWithConfig.prodDatabaseType === MYSQL ? 'identity' : 'sequence';
      field.jpaGeneratedValue = field.jpaGeneratedValue || field.fieldType === LONG ? defaultGenerationType : true;
      field.autoGenerateByService = false;
      field.autoGenerateByRepository = true;
      field.requiresPersistableImplementation = false;
      field.readonly = true;
      if (field.jpaGeneratedValue === 'identity') {
        field.liquibaseAutoIncrement = true;
      }
    }
  }

  if (field.fieldNameAsDatabaseColumn === undefined) {
    const fieldNameUnderscored = snakeCase(field.fieldName);
    const jhiFieldNamePrefix = hibernateSnakeCase(entityWithConfig.jhiPrefix);

    if (isReservedTableName(fieldNameUnderscored, entityWithConfig.prodDatabaseType ?? entityWithConfig.databaseType)) {
      if (!jhiFieldNamePrefix) {
        generator.log.warn(
          `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`
        );
        field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
      } else {
        field.fieldNameAsDatabaseColumn = `${jhiFieldNamePrefix}_${fieldNameUnderscored}`;
      }
    } else {
      field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
    }
  }

  field.columnName = field.fieldNameAsDatabaseColumn;
  if (field.unique) {
    field.uniqueConstraintName = getUXConstraintName(entityWithConfig.entityTableName, field.columnName, {
      prodDatabaseType: entityWithConfig.prodDatabaseType,
    }).value;
  }

  if (field.fieldInJavaBeanMethod === undefined) {
    // Handle the specific case when the second letter is capitalized
    // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
    if (field.fieldName.length > 1) {
      const firstLetter = field.fieldName.charAt(0);
      const secondLetter = field.fieldName.charAt(1);
      if (firstLetter === firstLetter.toLowerCase() && secondLetter === secondLetter.toUpperCase()) {
        field.fieldInJavaBeanMethod = firstLetter.toLowerCase() + field.fieldName.slice(1);
      } else {
        field.fieldInJavaBeanMethod = upperFirst(field.fieldName);
      }
    } else {
      field.fieldInJavaBeanMethod = upperFirst(field.fieldName);
    }
  }

  if (field.fieldValidateRulesPatternJava === undefined) {
    field.fieldValidateRulesPatternJava = field.fieldValidateRulesPattern
      ? field.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      : field.fieldValidateRulesPattern;
  }

  if (field.blobContentTypeText) {
    field.javaFieldType = 'String';
  } else {
    field.javaFieldType = field.fieldType;
  }

  field.filterableField = ![TYPE_BYTES, TYPE_BYTE_BUFFER].includes(field.fieldType);
}
