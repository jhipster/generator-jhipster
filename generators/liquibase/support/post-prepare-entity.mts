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
import { CommonClientServerApplication } from '../../base-application/types.mjs';
import { fieldTypes } from '../../../jdl/jhipster/index.mjs';
import { LiquibaseEntity } from '../generator.mjs';

const { CommonDBTypes } = fieldTypes;
const { LONG: TYPE_LONG } = CommonDBTypes;

export default function postPrepareEntity({
  application,
  entity,
}: {
  application: CommonClientServerApplication;
  entity: LiquibaseEntity;
}) {
  const { relationships, builtIn, name, primaryKey } = entity;
  if (builtIn && name === 'User') {
    const userIdType = primaryKey.type;
    const idField = primaryKey.fields[0];
    const idFieldName = idField.fieldName ?? 'id';
    const liquibaseFakeData = application.generateUserManagement
      ? [
          { [idFieldName]: userIdType === TYPE_LONG ? 1 : idField.generateFakeData() },
          { [idFieldName]: userIdType === TYPE_LONG ? 2 : idField.generateFakeData() },
        ]
      : [];
    entity.liquibaseFakeData = liquibaseFakeData;
    entity.fakeDataCount = liquibaseFakeData.length;
  }

  entity.anyRelationshipIsOwnerSide = relationships.some(relationship => relationship.ownerSide);
}
