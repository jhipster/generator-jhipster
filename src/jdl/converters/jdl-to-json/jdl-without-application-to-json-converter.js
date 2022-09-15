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

const BasicEntityConverter = require('./jdl-to-json-basic-entity-converter');
const FieldConverter = require('./jdl-to-json-field-converter');
const RelationshipConverter = require('./jdl-to-json-relationship-converter');
const OptionConverter = require('./jdl-to-json-option-converter');

const USER = 'user';
const AUTHORITY = 'authority';
const builtInEntities = new Set([USER, AUTHORITY]);

let entities;
let jdlObject;

module.exports = {
  convert,
};

/**
 * Converts a JDLObject to ready-to-be exported JSON entities.
 * @param {Object} args - the configuration object, keys:
 * @param {JDLObject} args.jdlObject - the JDLObject to convert to JSON
 * @param {String} args.applicationName - the application's name
 * @param {String} args.databaseType - the database type
 * @param {string} args.applicationType - the application's type
 * @param {Boolean} [args.unidirectionalRelationships] - Whether to generate unidirectional relationships
 * @returns {Map} entities that can be exported to JSON
 */
function convert(args = {}) {
  if (!args.jdlObject || !args.applicationName || !args.databaseType) {
    throw new Error("The JDL object, the application's name and its the database type are mandatory.");
  }
  init(args);
  const { unidirectionalRelationships } = args;
  setBasicEntityInformation();
  setOptions();
  setFields();
  setRelationships({ unidirectionalRelationships });
  setApplicationToEntities();
  return new Map([[args.applicationName, Object.values(entities)]]);
}

function init(args) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
}

function resetState() {
  jdlObject = null;
  entities = null;
}

function setBasicEntityInformation() {
  const convertedEntities = BasicEntityConverter.convert(jdlObject.getEntities());
  convertedEntities.forEach((jsonEntity, entityName) => {
    entities[entityName] = jsonEntity;
  });
}

function setOptions() {
  const convertedOptionContents = OptionConverter.convert(jdlObject);
  convertedOptionContents.forEach((optionContent, entityName) => {
    entities[entityName].setOptions(optionContent);
  });
}

function setFields() {
  const convertedFields = FieldConverter.convert(jdlObject);
  convertedFields.forEach((entityFields, entityName) => {
    if (builtInEntities.has(entityName.toLowerCase())) {
      return;
    }
    entities[entityName].addFields(entityFields);
  });
}

function setRelationships(conversionOptions) {
  const convertedRelationships = RelationshipConverter.convert(jdlObject.getRelationships(), jdlObject.getEntityNames(), conversionOptions);
  convertedRelationships.forEach((entityRelationships, entityName) => {
    if (builtInEntities.has(entityName.toLowerCase())) {
      return;
    }
    entities[entityName].addRelationships(entityRelationships);
  });
}

function setApplicationToEntities() {
  Object.keys(entities).forEach(entityName => {
    entities[entityName].applications = '*';
  });
}
