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

import { mutateData } from '../../../lib/utils/index.ts';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.ts';
import type { DatabaseEntity, DatabaseRelationship } from '../../liquibase/types.ts';
import type { Application as ServerApplication, Entity as ServerEntity, Relationship as ServerRelationship } from '../types.ts';

import { getJoinTableName } from './database.ts';
import { hibernateSnakeCase } from './string.ts';

export function prepareRelationshipForDatabase({
  application,
  entity,
  relationship,
}: {
  application: ServerApplication;
  entity: DatabaseEntity;
  relationship: DatabaseRelationship;
}) {
  // Database properties are used by liquibase and spring-boot there is no inheritance between them.
  mutateData(relationship, {
    // DB properties
    columnName: ({ relationshipName }) => hibernateSnakeCase(relationshipName),
    shouldWriteJoinTable: ({ ownerSide, relationshipManyToMany }) => application.databaseTypeSql && relationshipManyToMany && ownerSide,
    joinTable: ({ shouldWriteJoinTable, relationshipName }) =>
      shouldWriteJoinTable ?
        {
          name: getJoinTableName(entity.entityTableName, relationshipName, {
            prodDatabaseType: application.prodDatabaseType,
          }).value,
        }
      : undefined,
  });
}

export function prepareRelationship({
  application,
  entity,
  relationship,
}: {
  application: ServerApplication;
  entity: ServerEntity;
  relationship: ServerRelationship;
}) {
  if (relationship.documentation) {
    mutateData(relationship, {
      __override__: false,
      relationshipJavadoc: formatDocAsJavaDoc(relationship.documentation, 4),
      relationshipApiDescription: formatDocAsApiDescription(relationship.documentation),
      propertyApiDescription: ({ relationshipApiDescription }) => relationshipApiDescription,
    });
  }

  prepareRelationshipForDatabase({ application, entity, relationship });
}
