'use strict';

const fs = require('fs'),
  readEntityJSON = require('../reader/json_file_reader').readEntityJSON,
  toFilePath = require('../reader/json_file_reader').toFilePath,
  doesFileExist = require('../reader/json_file_reader').doesFileExist,
  areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual,
  buildException = require('../exceptions/exception_factory').buildException,
  Exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportEntities: exportEntities,
  createJHipsterEntityFolderFolder: createJHipsterEntityFolderFolder
};

function exportEntities(entities, forceNoFiltering) {
  if (!entities) {
    throw new buildException(
      Exceptions.NullPointer,
      'Entities have to be passed to be exported.');
  }
  createJHipsterEntityFolderFolder();
  if (!forceNoFiltering) {
    entities = filterOutUnchangedEntities(entities);
  }
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    let filePath = toFilePath(entityNames[i]);
    let entity = updateChangelogDate(filePath, entities[entityNames[i]]);
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 4));
  }
}

function createJHipsterEntityFolderFolder() {
  try {
    if (!fs.statSync('./.jhipster').isDirectory()) {
      fs.mkdirSync('.jhipster');
    }
  } catch (error) {
    fs.mkdirSync('.jhipster');
  }
}

function updateChangelogDate(filePath, entity) {
  if (doesFileExist(filePath)) {
    let fileOnDisk = readEntityJSON(filePath);
    if (fileOnDisk && fileOnDisk.changelogDate) {
      entity.changelogDate = fileOnDisk.changelogDate;
    }
  }
  return entity;
}

function filterOutUnchangedEntities(entities) {
  const filtered = {};
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    let entityName = entityNames[i];
    let filePath = toFilePath(entityName);
    if (!(doesFileExist(filePath) && areJHipsterEntitiesEqual(readEntityJSON(filePath), entities[entityName]))) {
      filtered[entityName] = (entities[entityName]);
    }
  }
  return filtered;
}
