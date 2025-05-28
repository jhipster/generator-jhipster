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
import { fieldTypes } from '../../../lib/jhipster/index.js';
import type { LiquibaseEntity } from '../types.js';
import { asPostPreparingEachEntityTask } from '../../base-application/support/task-type-inference.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../../lib/types/application/entity.js';
import type { ApplicationType } from '../../../lib/types/application/application.js';

const { CommonDBTypes } = fieldTypes;
const { LONG: TYPE_LONG, INTEGER: TYPE_INTEGER } = CommonDBTypes;

export default asPostPreparingEachEntityTask<
  DeprecatedField,
  DeprecatedPrimarykey<DeprecatedField>,
  DeprecatedRelationship<any>,
  DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  ApplicationType,
  any
>(function postPrepareEntity({ application, entity }) {
  const { relationships, builtIn, name, primaryKey } = entity;
  if (builtIn && name === 'User' && primaryKey) {
    const userIdType = primaryKey.type;
    const idField = primaryKey.fields[0];
    const idFieldName = idField.fieldName ?? 'id';
    const liquibaseFakeData = application.generateUserManagement
      ? [
          { [idFieldName]: [TYPE_INTEGER, TYPE_LONG].includes(userIdType) ? 1 : idField.generateFakeData!() },
          { [idFieldName]: [TYPE_INTEGER, TYPE_LONG].includes(userIdType) ? 2 : idField.generateFakeData!() },
        ]
      : [];
    (entity as LiquibaseEntity).liquibaseFakeData = liquibaseFakeData;
    (entity as LiquibaseEntity).fakeDataCount = liquibaseFakeData.length;
  }

  (entity as LiquibaseEntity).anyRelationshipIsOwnerSide = relationships.some(relationship => relationship.ownerSide);
});
