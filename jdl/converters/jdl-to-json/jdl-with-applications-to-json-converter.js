/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
let entitiesPerApplication;

module.exports = {
  convert,
};

/**
 * Converts a JDLObject to ready-to-be exported JSON entities.
 * @param {Object} args - the configuration object, keys:
 * @param {JDLObject} args.jdlObject - the JDLObject to convert to JSON
 * @param {Boolean} [args.unidirectionalRelationships] - Whether to generate unidirectional relationships
 * @returns {Map} entities that can be exported to JSON
 */
function convert(args = {}) {
  if (!args.jdlObject) {
    throw new Error('The JDL object is mandatory.');
  }
  init(args);
  setEntitiesPerApplication();
  if (entitiesPerApplication.size === 0) {
    const applicationNames = jdlObject.getApplications().map(jdlApplication => jdlApplication.getConfigurationOptionValue('baseName'));
    return new Map(applicationNames.map(applicationName => [applicationName, []]));
  }
  const { unidirectionalRelationships } = args;
  setBasicEntityInformation();
  setFields();
  setRelationships({ unidirectionalRelationships });
  setApplicationToEntities();
  const entitiesForEachApplication = getEntitiesForEachApplicationMap();
  setOptions(entitiesForEachApplication);
  formatEntitiesForEachApplication(entitiesForEachApplication);
  addApplicationsWithoutEntities(entitiesForEachApplication);
  return entitiesForEachApplication;
}

function init(args) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
  entitiesPerApplication = new Map();
}

function resetState() {
  jdlObject = null;
  entities = null;
}

function setEntitiesPerApplication() {
  jdlObject.forEachApplication(jdlApplication => {
    const entityNames = jdlApplication.getEntityNames();
    if (entityNames.length === 0) {
      return;
    }
    const baseName = jdlApplication.getConfigurationOptionValue('baseName');
    entitiesPerApplication.set(baseName, entityNames);
  });
}

function setBasicEntityInformation() {
  const convertedEntities = BasicEntityConverter.convert(jdlObject.getEntities());
  convertedEntities.forEach((jsonEntity, entityName) => {
    entities[entityName] = jsonEntity;
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
  jdlObject.forEachApplication(jdlApplication => {
    const baseName = jdlApplication.getConfigurationOptionValue('baseName');
    jdlApplication.forEachEntityName(entityName => {
      if (!entities[entityName]) {
        return;
      }
      entities[entityName].applications.push(baseName);
    });
  });
}

function setOptions(entitiesForEachApplication) {
  const convertedOptionContents = OptionConverter.convert(jdlObject);
  convertedOptionContents.forEach((optionContent, entityName) => {
    entities[entityName].setOptions(optionContent);
  });
  jdlObject.forEachApplication(jdlApplication => {
    const convertedOptionContentsForApplication = OptionConverter.convert(jdlApplication);
    const applicationName = jdlApplication.getConfigurationOptionValue('baseName');
    const applicationEntities = entitiesForEachApplication.get(applicationName);
    convertedOptionContentsForApplication.forEach((optionContent, entityName) => {
      if (!applicationEntities[entityName]) {
        return;
      }
      applicationEntities[entityName].setOptions(optionContent);
    });
  });
}

function getEntitiesForEachApplicationMap() {
  const entitiesForEachApplication = new Map();
  entitiesPerApplication.forEach((entityNames, applicationName) => {
    const entitiesInObject = entityNames
      .filter(entityName => !!entities[entityName])
      .map(entityName => entities[entityName])
      .reduce((accumulator, currentEntity) => {
        return {
          ...accumulator,
          [currentEntity.name]: currentEntity,
        };
      }, {});

    entitiesForEachApplication.set(applicationName, entitiesInObject);
  });
  return entitiesForEachApplication;
}

function formatEntitiesForEachApplication(entitiesForEachApplication) {
  entitiesForEachApplication.forEach((applicationEntities, applicationName) => {
    entitiesForEachApplication.set(applicationName, Object.values(applicationEntities));
  });
}

function addApplicationsWithoutEntities(entitiesForEachApplication) {
  jdlObject.forEachApplication(jdlApplication => {
    if (jdlApplication.getEntityNames().length === 0) {
      entitiesForEachApplication.set(jdlApplication.getConfigurationOptionValue('baseName'), []);
    }
  });
}
