/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const ApplicationTypes = require('../core/jhipster/application_types');
const { toFilePath, readEntityJSON } = require('../readers/json_file_reader');
const FileUtils = require('../utils/file_utils');
const areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual;

let configuration = {};

module.exports = {
  exportEntities,
  exportEntitiesInApplications
};

/**
 * Exports the passed entities to JSON in the applications.
 * @param passedConfiguration the object having the keys:
 *        - entities: the entities to exporters,
 *        - forceNoFiltering: whether to filter out unchanged entities,
 *        - applications: the application iterable containing some or all the entities
 * @return the exported entities per application name.
 */
function exportEntitiesInApplications(passedConfiguration) {
  if (!passedConfiguration || !passedConfiguration.entities) {
    throw new Error('Entities have to be passed to be exported.');
  }
  let exportedEntities = [];
  Object.keys(passedConfiguration.applications).forEach(applicationName => {
    const application = passedConfiguration.applications[applicationName];
    const entitiesToExport = getEntitiesToExport(application.entityNames, passedConfiguration.entities);
    exportedEntities = exportedEntities.concat(
      exportEntities({
        entities: entitiesToExport,
        forceNoFiltering: passedConfiguration.forceNoFiltering,
        application: {
          forSeveralApplications: Object.keys(passedConfiguration.applications).length !== 1,
          name: application.config.baseName,
          type: application.config.applicationType
        }
      })
    );
  });
  return exportedEntities;
}

function getEntitiesToExport(entityToExportNames, entities) {
  const entitiesToExport = {};
  entityToExportNames.forEach(entityName => {
    entitiesToExport[entityName] = entities[entityName];
  });
  return entitiesToExport;
}

/**
 * Exports the passed entities to JSON.
 * @param passedConfiguration the object having the keys:
 *        - entities: the entity objects to exporters (key: entity name, value: the entity),
 *        - forceNoFiltering: whether to filter out unchanged entities,
 *        - application:
 *          - forSeveralApplications: whether more than one application have to be generated,
 *          - name: application base name,
 *          - type: application type
 * @returns The exported entities.
 */
function exportEntities(passedConfiguration) {
  init(passedConfiguration);
  createJHipsterJSONFolder(
    passedConfiguration.application.forSeveralApplications ? configuration.application.name : ''
  );
  if (!configuration.forceNoFiltering) {
    filterOutUnchangedEntities();
  }
  if (shouldFilterOutEntitiesBasedOnMicroservice()) {
    filterOutEntitiesByMicroservice();
  }
  writeEntities(passedConfiguration.application.forSeveralApplications ? configuration.application.name : '');
  return Object.values(configuration.entities);
}

function init(passedConfiguration) {
  if (!passedConfiguration || !passedConfiguration.entities) {
    throw new Error('Entities have to be passed to be exported.');
  }
  configuration = passedConfiguration;
}

/**
 * Creates the JHipster entity folder, if possible.
 * @param subFolder the folder (to create) in which the JHipster entity folder will be.
 */
function createJHipsterJSONFolder(subFolder) {
  FileUtils.createDirectory(path.join(subFolder, '.jhipster'));
}

/**
 * Writes entities in a sub folder.
 * @param subFolder the folder (to create) in which the JHipster entity folder will be.
 */
function writeEntities(subFolder) {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const filePath = path.join(subFolder, toFilePath(entityNames[i]));
    const entity = updateEntityToGenerateWithExistingOne(filePath, configuration.entities[entityNames[i]]);
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 4));
  }
}

function updateEntityToGenerateWithExistingOne(filePath, entity) {
  if (FileUtils.doesFileExist(filePath)) {
    const fileOnDisk = readEntityJSON(filePath);
    if (fileOnDisk && fileOnDisk.changelogDate) {
      entity.changelogDate = fileOnDisk.changelogDate;
      return { ...fileOnDisk, ...entity, changelogDate: fileOnDisk.changelogDate };
    }
  }
  return entity;
}

function filterOutUnchangedEntities() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const entityName = entityNames[i];
    const filePath = toFilePath(entityName);
    if (
      FileUtils.doesFileExist(filePath) &&
      areJHipsterEntitiesEqual(readEntityJSON(filePath), configuration.entities[entityName])
    ) {
      delete configuration.entities[entityName];
    }
  }
}

function shouldFilterOutEntitiesBasedOnMicroservice() {
  return (
    configuration.application.type &&
    configuration.application.type === ApplicationTypes.MICROSERVICE &&
    configuration.application.name
  );
}

function filterOutEntitiesByMicroservice() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    const entity = configuration.entities[entityNames[i]];
    if (
      entity.microserviceName &&
      entity.microserviceName.toLowerCase() !== configuration.application.name.toLowerCase()
    ) {
      delete configuration.entities[entityNames[i]];
    }
  }
}
