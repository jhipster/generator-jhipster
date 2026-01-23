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
import assert from 'node:assert';

import { snakeCase, upperFirst } from 'lodash-es';

import { databaseTypes, entityOptions, fieldTypes, reservedKeywords } from '../../../lib/jhipster/index.ts';
import { buildMutateDataForProperty, mutateData } from '../../../lib/utils/index.ts';
import type CoreGenerator from '../../base-core/generator.ts';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.ts';
import type { Field as LiquibaseField } from '../../liquibase/types.d.ts';
import type { Field as SpringDataRelationalField } from '../../spring-boot/generators/data-relational/types.d.ts';
import type { Field as SpringBootField } from '../../spring-boot/types.d.ts';
import type { Application as ServerApplication, Entity as ServerEntity, Field as ServerField } from '../types.d.ts';

import { getUXConstraintName } from './database.ts';
import { getJavaValueGeneratorForType } from './templates/field-values.ts';

const { isReservedTableName } = reservedKeywords;
const { CommonDBTypes } = fieldTypes;
const { MYSQL, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;

const { MAPSTRUCT } = MapperTypes;
const { INTEGER, LONG, UUID } = CommonDBTypes;

export const prepareMapstructField = (entity: ServerEntity, field: SpringBootField): SpringBootField => {
  if (field.mapstructExpression) {
    assert.equal(entity.dto, MAPSTRUCT, `@MapstructExpression requires an Entity with mapstruct dto [${entity.name}.${field.fieldName}].`);
    // Remove from Entity.java and liquibase.
    field.transient = true;
    // Disable update form.
    field.readonly = true;
  }
  return field;
};

export default function prepareField(
  application: ServerApplication,
  entityWithConfig: ServerEntity,
  field: ServerField & LiquibaseField & SpringBootField & SpringDataRelationalField,
  generator: CoreGenerator,
) {
  prepareMapstructField(entityWithConfig, field);

  if (field.documentation) {
    mutateData(field, {
      __override__: false,
      fieldJavadoc: formatDocAsJavaDoc(field.documentation, 4),
      fieldApiDescription: formatDocAsApiDescription(field.documentation),
      propertyApiDescription: ({ fieldApiDescription }) => fieldApiDescription,
    });
  }

  const { reactive: entityReactive, prodDatabaseType: entityProdDatabaseType } = entityWithConfig as any;
  if (field.id && entityWithConfig.primaryKey) {
    field.autoGenerate ??= !entityWithConfig.primaryKey.composite && ([INTEGER, LONG, UUID] as string[]).includes(field.fieldType);

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
    } else if (entityReactive) {
      field.liquibaseAutoIncrement = field.fieldType === LONG;
      field.jpaGeneratedValue = false;
      field.autoGenerateByService = !field.liquibaseAutoIncrement;
      field.autoGenerateByRepository = !field.autoGenerateByService;
      field.requiresPersistableImplementation = !field.liquibaseAutoIncrement;
      field.readonly = true;
    } else {
      const defaultGenerationType = entityProdDatabaseType === MYSQL ? 'identity' : 'sequence';
      field.jpaGeneratedValue =
        field.jpaGeneratedValue || ([INTEGER, LONG] as string[]).includes(field.fieldType) ? defaultGenerationType : true;
      field.jpaGeneratedValueSequence = field.jpaGeneratedValue === 'sequence';
      field.jpaGeneratedValueIdentity = field.jpaGeneratedValue === 'identity';
      field.autoGenerateByService = false;
      field.autoGenerateByRepository = true;
      field.requiresPersistableImplementation = false;
      field.readonly = true;
      if (field.jpaGeneratedValueIdentity) {
        field.liquibaseAutoIncrement = true;
      } else if (field.jpaGeneratedValueSequence) {
        field.jpaSequenceGeneratorName = field.sequenceGeneratorName ?? 'sequenceGenerator';
        field.liquibaseSequenceGeneratorName = snakeCase(field.jpaSequenceGeneratorName);
        field.liquibaseCustomSequenceGenerator = field.liquibaseSequenceGeneratorName !== 'sequence_generator';
      }
    }
  }

  if (field.fieldNameAsDatabaseColumn === undefined) {
    const fieldNameUnderscored = snakeCase(field.fieldName);
    if (isReservedTableName(fieldNameUnderscored, entityProdDatabaseType ?? entityWithConfig.databaseType)) {
      if (!application.jhiTablePrefix) {
        generator.log.warn(
          `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`,
        );
        field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
      } else {
        field.fieldNameAsDatabaseColumn = `${application.jhiTablePrefix}_${fieldNameUnderscored}`;
      }
    } else {
      field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
    }
  }

  field.columnName = field.fieldNameAsDatabaseColumn;
  if (field.unique) {
    field.uniqueConstraintName = getUXConstraintName(entityWithConfig.entityTableName, field.columnName, {
      prodDatabaseType: entityProdDatabaseType,
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
      ? field.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, String.raw`\"`)
      : field.fieldValidateRulesPattern;
  }

  if (field.blobContentTypeText) {
    field.javaFieldType = 'String';
  } else {
    field.javaFieldType = field.fieldType;
  }

  mutateData(field, buildMutateDataForProperty('javaFieldType', ['String', 'Integer', 'Long', 'UUID']));

  if (field.fieldTypeInteger || field.fieldTypeLong || field.fieldTypeString || field.fieldTypeUUID) {
    if (field.fieldTypeInteger) {
      field.javaValueSample1 = '1';
      field.javaValueSample2 = '2';
    } else if (field.fieldTypeLong) {
      field.javaValueSample1 = '1L';
      field.javaValueSample2 = '2L';
    } else if (field.fieldTypeString) {
      field.javaValueSample1 = `"${field.fieldName}1"`;
      field.javaValueSample2 = `"${field.fieldName}2"`;
    } else if (field.fieldTypeUUID) {
      field.javaValueSample1 = 'UUID.fromString("23d8dc04-a48b-45d9-a01d-4b728f0ad4aa")';
      field.javaValueSample2 = 'UUID.fromString("ad79f240-3727-46c3-b89f-2cf6ebd74367")';
    }
    field.javaValueGenerator = getJavaValueGeneratorForType(field.javaFieldType);
  }

  field.fieldSupportsSortBy = !field.transient;
}
