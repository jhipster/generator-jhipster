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
const readEntityJSON = require('../reader/json_file_reader').readEntityJSON;
const toFilePath = require('../reader/json_file_reader').toFilePath;
const doesfileExist = require('../reader/json_file_reader').doesfileExist;
const areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJSON,
  createJHipsterJSONFolder,
  filterOutUnchangedEntities
};

function exportToJSON(entities, forceNoFiltering) {
  if (!entities) {
    throw new BuildException(
      exceptions.NullPointer,
      'Entities have to be passed to be exported.');
  }
  createJHipsterJSONFolder();
  if (!forceNoFiltering) {
    entities = filterOutUnchangedEntities(entities);
  }
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    const filePath = toFilePath(entityNames[i]);
    const entity = updateChangelogDate(filePath, entities[entityNames[i]]);
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 4));
  }
  return entities;
}

function createJHipsterJSONFolder() {
  try {
    if (!fs.statSync('./.jhipster').isDirectory()) {
      fs.mkdirSync('.jhipster');
    }
  } catch (error) {
    fs.mkdirSync('.jhipster');
  }
}

function updateChangelogDate(filePath, entity) {
  if (doesfileExist(filePath)) {
    const fileOnDisk = readEntityJSON(filePath);
    if (fileOnDisk && fileOnDisk.changelogDate) {
      entity.changelogDate = fileOnDisk.changelogDate;
    }
  }
  return entity;
}

function filterOutUnchangedEntities(entities) {
  const filtered = {};
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    const entityName = entityNames[i];
    const filePath = toFilePath(entityName);
    if (!(doesfileExist(filePath) && areJHipsterEntitiesEqual(readEntityJSON(filePath), entities[entityName]))) {
      filtered[entityName] = (entities[entityName]);
    }
  }
  return filtered;
}
