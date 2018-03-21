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

const fs = require('fs');
const path = require('path');
const Set = require('../utils/objects/set');
const ApplicationTypes = require('../core/jhipster/application_types');
const readEntityJSON = require('../reader/json_file_reader').readEntityJSON;
const toFilePath = require('../reader/json_file_reader').toFilePath;
const FileUtils = require('../utils/file_utils');
const areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

let configuration = {};

module.exports = {
  exportEntities,
  exportEntitiesInApplications
};

/**
 * Exports the passed entities to JSON in the applications.
 * @param passedConfiguration the object having the keys:
 *        - entities: the entities to export,
 *        - forceNoFiltering: whether to filter out unchanged entities,
 *        - applications: the application iterable containing some or all the entities
 */
function exportEntitiesInApplications(passedConfiguration) {
  if (!passedConfiguration || !passedConfiguration.entities) {
    throw new BuildException(
      exceptions.NullPointer,
      'Entities have to be passed to be exported.');
  }
  const exportedEntities = new Set();
  Object.keys(passedConfiguration.applications).forEach((applicationName) => {
    const application = passedConfiguration.applications[applicationName];
    const entitiesToExport = getEntitiesToExport(application.entities, passedConfiguration.entities);
    exportedEntities.addArrayElements(exportEntities({
      entities: entitiesToExport,
      forceNoFiltering: passedConfiguration.forceNoFiltering,
      application: {
        name: application.config.baseName,
        type: application.config.applicationType,
        path: path.join(application.config.path || '', application.config.baseName)
      }
    }));
  });
  return exportedEntities;
}

function getEntitiesToExport(entityToExportNames, entities) {
  const entitiesToExport = {};
  entityToExportNames.forEach((entityName) => {
    entitiesToExport[entityName] = entities[entityName];
  });
  return entitiesToExport;
}

/**
 * Exports the passed entities to JSON.
 * @param passedConfiguration the object having the keys:
 *        - entities: the entity objects to export (key: entity name, value: the entity),
 *        - forceNoFiltering: whether to filter out unchanged entities,
 *        - application:
 *          - name: application base name,
 *          - type: application type,
 *          - path: application path
 * @returns {*} The exported entities' names.
 */
function exportEntities(passedConfiguration) {
  init(passedConfiguration);
  createJHipsterJSONFolder();
  if (!configuration.forceNoFiltering) {
    filterOutUnchangedEntities();
  }
  if (shouldFilterOutEntitiesBasedOnMicroservice()) {
    filterOutEntitiesByMicroservice();
  }
  writeEntities();
  return Object.keys(configuration.entities);
}

function init(passedConfiguration) {
  if (!passedConfiguration || !passedConfiguration.entities) {
    throw new BuildException(
      exceptions.NullPointer,
      'Entities have to be passed to be exported.');
  }
  configuration = passedConfiguration;
}

/**
 * Creates the JHipster entity folder, if possible.
 */
function createJHipsterJSONFolder() {
  FileUtils.createDirectory(path.join(configuration.application.path || '', '.jhipster'));
}

function writeEntities() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const filePath = path.join(
      configuration.application && configuration.application.path
        ? configuration.application.path
        : ''
      , toFilePath(entityNames[i]));
    const entity = updateChangelogDate(filePath, configuration.entities[entityNames[i]]);
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 4));
  }
}

function updateChangelogDate(filePath, entity) {
  if (FileUtils.doesFileExist(filePath)) {
    const fileOnDisk = readEntityJSON(filePath);
    if (fileOnDisk && fileOnDisk.changelogDate) {
      entity.changelogDate = fileOnDisk.changelogDate;
    }
  }
  return entity;
}

function filterOutUnchangedEntities() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const entityName = entityNames[i];
    const filePath = toFilePath(entityName);
    if (FileUtils.doesFileExist(filePath)
        && areJHipsterEntitiesEqual(readEntityJSON(filePath), configuration.entities[entityName])) {
      delete configuration.entities[entityName];
    }
  }
}

function shouldFilterOutEntitiesBasedOnMicroservice() {
  return configuration.application.type && configuration.application.type === ApplicationTypes.MICROSERVICE
    && configuration.application.name;
}

function filterOutEntitiesByMicroservice() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const entity = configuration.entities[entityNames[i]];
    if (entity.microserviceName
        && entity.microserviceName.toLowerCase() !== configuration.application.name.toLowerCase()) {
      delete configuration.entities[entityNames[i]];
    }
  }
}
