/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

const { merge } = require('../utils/object-utils');
const { formatComment } = require('../utils/format-utils');
const { upperFirst } = require('../utils/string-utils');
const { getTableNameFromEntityName } = require('./entity-table-name-creator');
const binaryOptions = require('./binary-options');
const unaryOptions = require('./unary-options');

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
   *        - javadoc,
   *        - entityTableName, defaults to the snake-cased entity name,
   *        - dto, defaults to 'no',
   *        - pagination, defaults to 'no',
   *        - readOnly, defaults to false,
   *        - embedded, defaults to false,
   *        - service, defaults to 'no',
   *        - jpaMetamodelFiltering, defaults to false,
   *        - fluentMethods, defaults to true,
   *        - clientRootFolder
   */
  constructor(args) {
    if (!args || !args.entityName) {
      throw new Error('At least an entity name must be passed.');
    }
    const merged = merge(getDefaults(args.entityName), args);
    this.name = merged.name;
    this.fields = merged.fields;
    this.relationships = merged.relationships;
    this.javadoc = merged.javadoc;
    this.entityTableName = merged.entityTableName;
    this.dto = merged.dto;
    this.pagination = merged.pagination;
    this.service = merged.service;
    this.jpaMetamodelFiltering = merged.jpaMetamodelFiltering;
    this.fluentMethods = merged.fluentMethods;
    this.readOnly = merged.readOnly;
    this.embedded = merged.embedded;
    if (merged.clientRootFolder) {
      this.clientRootFolder = merged.clientRootFolder;
    }
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

  addFields(fields) {
    if (!fields || fields.length === 0) {
      return;
    }
    this.fields = this.fields.concat(fields);
  }

  addField(field) {
    if (field) {
      this.fields.push(field);
    }
  }

  addRelationships(relationships) {
    if (!relationships || relationships.length === 0) {
      return;
    }
    this.relationships = this.relationships.concat(relationships);
  }

  addRelationship(relationship) {
    if (relationship) {
      this.relationships.push(relationship);
    }
  }

  setOptions(options = {}) {
    Object.keys(options).forEach(optionName => {
      this[optionName] = options[optionName];
    });
  }
}

module.exports = JSONEntity;

function getDefaults(entityName) {
  return {
    name: upperFirst(entityName),
    fields: [],
    relationships: [],
    javadoc: formatComment(),
    entityTableName: getTableNameFromEntityName(entityName),
    [binaryOptions.Options.DTO]: binaryOptions.DefaultValues[binaryOptions.Options.DTO],
    [binaryOptions.Options.PAGINATION]: binaryOptions.DefaultValues[binaryOptions.Options.PAGINATION],
    [binaryOptions.Options.SERVICE]: binaryOptions.DefaultValues[binaryOptions.Options.SERVICE],
    fluentMethods: true,
    [unaryOptions.READ_ONLY]: false,
    [unaryOptions.EMBEDDED]: false,
    jpaMetamodelFiltering: false,
    applications: [],
  };
}
