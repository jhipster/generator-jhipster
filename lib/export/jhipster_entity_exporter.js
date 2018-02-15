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
const ApplicationTypes = require('../core/jhipster/application_types');
const readEntityJSON = require('../reader/json_file_reader').readEntityJSON;
const toFilePath = require('../reader/json_file_reader').toFilePath;
const FileUtils = require('../utils/file_utils');
const areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const DeprecationUtils = require('../utils/deprecation_utils');

let configuration = {};

module.exports = {
  exportToJSON,
  exportEntities,
  createJHipsterJSONFolder,
  filterOutUnchangedEntities
};

/**
 * Exports the passed entities to JSON.
 * @param entities the entities to export.
 * @param forceNoFiltering whether to filter out unchanged entities.
 * @param applicationName
 * @param applicationType
 * @returns The exported entities.
 * @deprecated Use ::exportEntities instead.
 */
function exportToJSON(entities, forceNoFiltering, applicationName, applicationType) {
  DeprecationUtils.displayMethodDeprecationMessage({
    deprecatedMethod: 'JHipsterEntityExporter::exportToJSON',
    preferredMethod: 'JHipsterEntityExporter::exportEntities'
  });
  return exportEntities({
    entities,
    forceNoFiltering,
    applicationName,
    applicationType
  });
}

/**
 * Exports the passed entities to JSON.
 * @param passedConfiguration the object having the keys:
 *        - entities: the entities to export,
 *        - forceNoFiltering: whether to filter out unchanged entities
 *        - applicationName: the application name,
 *        - applicationType: the application type
 * @returns {*} The exported entities.
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
  return configuration.entities;
}

function init(passedConfiguration) {
  if (!passedConfiguration.entities) {
    throw new BuildException(
      exceptions.NullPointer,
      'Entities have to be passed to be exported.');
  }
  configuration = passedConfiguration;
}

function shouldFilterOutEntitiesBasedOnMicroservice() {
  return configuration.applicationType && configuration.applicationType === ApplicationTypes.MICROSERVICE
    && configuration.applicationName;
}

/**
 * Creates the JHipster entity folder, if possible.
 */
function createJHipsterJSONFolder() {
  FileUtils.createDirectory('.jhipster');
}

function writeEntities() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const filePath = toFilePath(entityNames[i]);
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

function filterOutEntitiesByMicroservice() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const entity = configuration.entities[entityNames[i]];
    if (entity.microserviceName
        && entity.microserviceName.toLowerCase() !== configuration.applicationName.toLowerCase()) {
      delete configuration.entities[entityNames[i]];
    }
  }
}
