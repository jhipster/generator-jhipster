/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const { merge } = require('../../utils/object_utils');
const { dateFormatForLiquibase, formatComment } = require('../../utils/format_utils');
const { upperFirst } = require('../../utils/string_utils');

/**
 * The JSONEntity class represents a read-to-be exported to JSON entity.
 */
class JSONEntity {
  /**
   * Creates a new JSONEntity instance.
   * @param args the entity configuration, keys:
   *        - entityName, the entity name (mandatory)
   *        - fields, a field iterable
   *        - relationships, a relationship iterable
   *        - changelogDate,
   *        - javadoc,
   *        - entityTableName, defaults to the snake-cased entity name,
   *        - dto, defaults to 'no',
   *        - pagination, defaults to 'no',
   *        - service, defaults to 'no',
   *        - jpaMetamodelFiltering, defaults to false,
   *        - fluentMethods, defaults to true,
   *        - clientRootFolder
   */
  constructor(args) {
    if (!args || !args.entityName) {
      throw new Error('At least an entity name must be passed.');
    }
    const merged = merge(defaults(args.entityName), args);
    this.name = merged.name;
    this.fields = merged.fields;
    this.relationships = merged.relationships;
    this.changelogDate = merged.changelogDate;
    this.javadoc = merged.javadoc;
    this.entityTableName = merged.entityTableName;
    this.dto = merged.dto;
    this.pagination = merged.pagination;
    this.service = merged.service;
    this.jpaMetamodelFiltering = merged.jpaMetamodelFiltering;
    this.fluentMethods = merged.fluentMethods;
    this.clientRootFolder = merged.clientRootFolder;
    if (merged.microserviceName) {
      this.microserviceName = merged.microserviceName;
    }
    if (merged.angularJSSuffix) {
      this.angularJSSuffix = merged.angularJSSuffix;
    }
    if (merged.skipServer) {
      this.skipServer = merged.skipServer;
    }
    if (merged.skipClient) {
      this.skipClient = merged.skipClient;
    }
    this.applications = [];
  }

  addField(field) {
    if (field) {
      this.fields.push(field);
    }
  }

  addRelationship(relationship) {
    if (relationship) {
      this.relationships.push(relationship);
    }
  }
}

module.exports = JSONEntity;

function defaults(entityName) {
  return {
    name: upperFirst(entityName),
    fields: [],
    relationships: [],
    changelogDate: dateFormatForLiquibase(),
    javadoc: formatComment(),
    entityTableName: _.snakeCase(entityName),
    dto: 'no',
    pagination: 'no',
    service: 'no',
    fluentMethods: true,
    jpaMetamodelFiltering: false,
    clientRootFolder: '',
    applications: []
  };
}
