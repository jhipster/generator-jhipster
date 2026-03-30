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

import { snakeCase } from 'lodash-es';

import { databaseTypes, entityOptions, fieldTypes, reservedKeywords } from '../../../lib/jhipster/index.ts';
import type CoreGenerator from '../../base-core/generator.ts';
import type { Field as LiquibaseField } from '../../liquibase/types.d.ts';
import type { Field as SpringDataRelationalField } from '../../spring-boot/generators/data-relational/types.d.ts';
import type { Field as SpringBootField } from '../../spring-boot/types.d.ts';
import type { Application as ServerApplication, Entity as ServerEntity, Field as ServerField } from '../types.d.ts';

import { getUXConstraintName } from './database.ts';

const { isReservedTableName } = reservedKeywords;
const { CommonDBTypes } = fieldTypes;
const { MYSQL, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;

const { MAPSTRUCT } = MapperTypes;
const { INTEGER, LONG, UUID } = CommonDBTypes;

/** @deprecated */
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

/** @deprecated
 * TODO move to mutations
 */
export default function prepareField(
  application: ServerApplication,
  entityWithConfig: ServerEntity,
  field: ServerField & LiquibaseField & SpringBootField & SpringDataRelationalField,
  generator: CoreGenerator,
) {
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
      if (application.jhiTablePrefix) {
        field.fieldNameAsDatabaseColumn = `${application.jhiTablePrefix}_${fieldNameUnderscored}`;
      } else {
        generator.log.warn(
          `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`,
        );
        field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
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

  field.fieldSupportsSortBy = !field.transient;
}
