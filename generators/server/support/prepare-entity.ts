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

import { databaseTypes, searchEngineTypes } from '../../../lib/jhipster/index.ts';
import { mutateData } from '../../../lib/utils/object.ts';
import type { RelationshipWithEntity } from '../../base-application/types.ts';
import type { DatabaseField, DatabaseRelationship } from '../../liquibase/types.ts';
import type {
  Entity as SpringBootEntity,
  Field as SpringBootField,
  Relationship as SpringBootRelationship,
} from '../../spring-boot/types.d.ts';

const { NO: NO_SEARCH_ENGINE, ELASTICSEARCH } = searchEngineTypes;
const { COUCHBASE } = databaseTypes;

export function loadRequiredConfigDerivedProperties(entity: any) {
  entity.searchEngineCouchbase = entity.searchEngine === COUCHBASE;
  entity.searchEngineElasticsearch = entity.searchEngine === ELASTICSEARCH;
  entity.searchEngineAny = entity.searchEngine && entity.searchEngine !== NO_SEARCH_ENGINE;
  entity.searchEngineNo = !entity.searchEngineAny;
}

export function preparePostEntityServerDerivedProperties(
  entity: SpringBootEntity<SpringBootField, RelationshipWithEntity<SpringBootRelationship, SpringBootEntity>>,
) {
  mutateData(entity, {
    uniqueEnums: ({ fields }) => {
      return [...new Set(fields.filter(field => field.fieldIsEnum))];
    },
  });

  if (entity.primaryKey?.derived) {
    entity.isUsingMapsId = true;
    entity.mapsIdAssoc = entity.relationships.find(rel => rel.id);
  } else {
    entity.isUsingMapsId = false;
    entity.mapsIdAssoc = undefined;
  }
  entity.reactiveOtherEntities = new Set(entity.reactiveEagerRelations.map(rel => rel.otherEntity));
  entity.reactiveUniqueEntityTypes = new Set(entity.reactiveEagerRelations.map(rel => rel.otherEntity.entityNameCapitalized));
  entity.reactiveUniqueEntityTypes.add(entity.entityClass);
  if (entity.databaseType === 'sql') {
    for (const relationship of entity.relationships) {
      if (!relationship.otherEntity.embedded) {
        (relationship as DatabaseRelationship).joinColumnNames = relationship.otherEntity.primaryKey!.fields.map(
          otherField => `${(relationship as DatabaseRelationship).columnNamePrefix}${(otherField as DatabaseField).columnName}`,
        );
      }
    }
  }
}
