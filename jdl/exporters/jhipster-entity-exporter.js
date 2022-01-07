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

const fs = require('fs');
const path = require('path');
const ApplicationTypes = require('../jhipster/application-types');
const { toFilePath, readJSONFile } = require('../readers/json-file-reader');
const FileUtils = require('../utils/file-utils');
const areJHipsterEntitiesEqual = require('../utils/object-utils').areEntitiesEqual;

let configuration = {};

module.exports = {
  exportEntities,
};

/**
 * Exports the passed entities to JSON.
 * @param {Object} passedConfiguration - the object having the keys:
 * @param {Array<JSONEntity>} passedConfiguration.entities - the entity objects to export.
 * @param {Boolean} passedConfiguration.forceNoFiltering - whether to filter out unchanged entities.
 * @param {Boolean} passedConfiguration.skipFileGeneration - whether to skip file write to disk.
 * @param {Object} passedConfiguration.application - the application where the entities should be exported.
 * @param {Boolean} passedConfiguration.application.forSeveralApplications - whether to create the .jhipster folder
 *          inside a specific application's folder.
 * @param {String} passedConfiguration.application.name - the application's name, where the entities should be exported.
 * @param {String} passedConfiguration.application.type - the application's type.
 * @returns {Array<JSONEntity>} the exported entities.
 */
function exportEntities(passedConfiguration) {
  init(passedConfiguration);
  if (configuration.entities.length === 0) {
    return configuration.entities;
  }
  const subFolder = passedConfiguration.application.forSeveralApplications ? configuration.application.name : '';
  configuration.entities = updateEntities(subFolder);
  if (!configuration.forceNoFiltering) {
    configuration.entities = filterOutUnchangedEntities(subFolder);
  }
  if (shouldFilterOutEntitiesBasedOnMicroservice()) {
    configuration.entities = filterOutEntitiesByMicroservice();
  }
  if (!passedConfiguration.skipFileGeneration) {
    createJHipsterJSONFolder(subFolder);
    writeEntities(subFolder);
  }
  return configuration.entities;
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
  FileUtils.createFolderIfItDoesNotExist(path.join(subFolder, '.jhipster'));
}

/**
 * Writes entities in a sub folder.
 * @param subFolder the folder (to create) in which the JHipster entity folder will be.
 */
function updateEntities(subFolder) {
  return configuration.entities.map(entity => {
    const filePath = path.join(subFolder, toFilePath(entity.name));
    return updateEntityToGenerateWithExistingOne(filePath, entity);
  });
}

/**
 * Writes entities in a sub folder.
 * @param subFolder the folder (to create) in which the JHipster entity folder will be.
 */
function writeEntities(subFolder) {
  configuration.entities.forEach(entity => {
    const filePath = path.join(subFolder, toFilePath(entity.name));
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 2).concat('\n'));
  });
}

function updateEntityToGenerateWithExistingOne(filePath, entity) {
  if (FileUtils.doesFileExist(filePath)) {
    const fileOnDisk = readJSONFile(filePath);
    if (fileOnDisk && fileOnDisk.changelogDate) {
      entity.changelogDate = fileOnDisk.changelogDate;
      return { ...fileOnDisk, ...entity };
    }
  }
  return entity;
}

function filterOutUnchangedEntities(subFolder) {
  return configuration.entities.filter(entity => {
    const filePath = path.join(subFolder, toFilePath(entity.name));
    return !(FileUtils.doesFileExist(filePath) && areJHipsterEntitiesEqual(readJSONFile(filePath), entity));
  });
}

function shouldFilterOutEntitiesBasedOnMicroservice() {
  return (
    configuration.application.type && configuration.application.type === ApplicationTypes.MICROSERVICE && configuration.application.name
  );
}

function filterOutEntitiesByMicroservice() {
  return configuration.entities.filter(entity => {
    return !(entity.microserviceName && entity.microserviceName.toLowerCase() !== configuration.application.name.toLowerCase());
  });
}
