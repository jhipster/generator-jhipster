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

import { databaseTypes, searchEngineTypes } from '../../../lib/jhipster/index.js';

import { hibernateSnakeCase } from './string.js';
import { getDatabaseTypeData } from './database.js';

const { NO: NO_SEARCH_ENGINE, ELASTICSEARCH } = searchEngineTypes;
const { POSTGRESQL, MYSQL, MARIADB, COUCHBASE, SQL, NEO4J } = databaseTypes;

export function loadRequiredConfigDerivedProperties(entity: any) {
  entity.jhiTablePrefix = hibernateSnakeCase(entity.jhiPrefix);
  entity.searchEngineCouchbase = entity.searchEngine === COUCHBASE;
  entity.searchEngineElasticsearch = entity.searchEngine === ELASTICSEARCH;
  entity.searchEngineAny = entity.searchEngine && entity.searchEngine !== NO_SEARCH_ENGINE;
  entity.searchEngineNo = !entity.searchEngineAny;
}

export function preparePostEntityServerDerivedProperties(entity: any) {
  const { databaseType, reactive } = entity;
  entity.officialDatabaseType = getDatabaseTypeData(databaseType).name;
  let springDataDatabase;
  if (entity.databaseType !== SQL) {
    springDataDatabase = entity.officialDatabaseType;
    if (reactive) {
      springDataDatabase += ' reactive';
    }
  } else {
    springDataDatabase = reactive ? 'R2DBC' : 'JPA';
  }
  entity.springDataDescription = `Spring Data ${springDataDatabase}`;

  // Blueprints may disable cypress relationships by setting to false.
  entity.cypressBootstrapEntities = true;

  // Reactive with some r2dbc databases doesn't allow insertion without data.
  entity.workaroundEntityCannotBeEmpty = entity.reactive && [POSTGRESQL, MYSQL, MARIADB].includes(entity.prodDatabaseType);
  // Reactive with MariaDB doesn't allow null value at Instant fields.
  entity.workaroundInstantReactiveMariaDB = entity.reactive && entity.prodDatabaseType === MARIADB;

  entity.relationships
    .filter(relationship => relationship.ignoreOtherSideProperty === undefined)
    .forEach(relationship => {
      relationship.ignoreOtherSideProperty =
        entity.databaseType !== NEO4J &&
        !entity.embedded &&
        !relationship.otherEntity.embedded &&
        relationship.otherEntity.relationships.length > 0;
    });
  entity.relationshipsContainOtherSideIgnore = entity.relationships.some(relationship => relationship.ignoreOtherSideProperty);

  entity.importApiModelProperty =
    entity.relationships.some(relationship => relationship.documentation) || entity.fields.some(field => field.documentation);

  entity.uniqueEnums = {};

  entity.fields.forEach(field => {
    if (
      field.fieldIsEnum &&
      (!entity.uniqueEnums[field.fieldType] || (entity.uniqueEnums[field.fieldType] && field.fieldValues.length !== 0))
    ) {
      entity.uniqueEnums[field.fieldType] = field.fieldType;
    }
  });
  if (entity.primaryKey?.derived) {
    entity.isUsingMapsId = true;
    entity.mapsIdAssoc = entity.relationships.find(rel => rel.id);
  } else {
    entity.isUsingMapsId = false;
    entity.mapsIdAssoc = null;
  }
  entity.reactiveOtherEntities = new Set(entity.reactiveEagerRelations.map(rel => rel.otherEntity));
  entity.reactiveUniqueEntityTypes = new Set(entity.reactiveEagerRelations.map(rel => rel.otherEntityNameCapitalized));
  entity.reactiveUniqueEntityTypes.add(entity.entityClass);
  if (entity.databaseType === 'sql') {
    for (const relationship of entity.relationships) {
      if (!relationship.otherEntity.embedded) {
        relationship.joinColumnNames = relationship.otherEntity.primaryKey.fields.map(
          otherField => `${relationship.columnNamePrefix}${otherField.columnName}`,
        );
      }
    }
  }
}
