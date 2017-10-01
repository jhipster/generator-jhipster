const fs = require('fs');
const readEntityJSON = require('../reader/json_file_reader').readEntityJSON;
const toFilePath = require('../reader/json_file_reader').toFilePath;
const doesFileExist = require('../reader/json_file_reader').doesFileExist;
const areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportEntities,
  createJHipsterEntityFolderFolder,
  filterOutUnchangedEntities
};

function exportEntities(entities, forceNoFiltering) {
  if (!entities) {
    throw new BuildException(
      exceptions.NullPointer,
      'Entities have to be passed to be exported.');
  }
  createJHipsterEntityFolderFolder();
  if (!forceNoFiltering) {
    entities = filterOutUnchangedEntities(entities);
  }
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    const filePath = toFilePath(entityNames[i]);
    const entity = updateChangelogDate(filePath, entities[entityNames[i]]);
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 2));
  }
  return entities;
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
    if (!(doesFileExist(filePath) && areJHipsterEntitiesEqual(readEntityJSON(filePath), entities[entityName]))) {
      filtered[entityName] = (entities[entityName]);
    }
  }
  return filtered;
}
