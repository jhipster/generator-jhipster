'use strict';

const fs = require('fs'),
    readEntityJSON = require('../reader/json_file_reader').readEntityJSON,
    toFilePath = require('../reader/json_file_reader').toFilePath,
    areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJSON: exportToJSON,
  createJHipsterJSONFolder: createJHipsterJSONFolder
};

function exportToJSON(entities) {
  if (!entities) {
    throw new buildException(
        exceptions.NullPointer,
        'Entities have to be passed to be exported.');
  }
  createJHipsterJSONFolder();
  let filteredEntities = filterOutUnchangedEntities(entities);
  for (let i = 0, entityNames = Object.keys(filteredEntities); i < entityNames.length; i++) {
    let file = toFilePath(entityNames[i]);
    fs.writeFileSync(file, JSON.stringify(filteredEntities[entityNames[i]], null, '  '));
  }
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

function filterOutUnchangedEntities(entities) {
  var filtered = {};
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    let filePath = toFilePath(entityNames[i]);
    if (!(fs.existsSync(filePath) && areJHipsterEntitiesEqual(readEntityJSON(filePath), entities[entityNames[i]]))) {
      filtered[entityNames[i]] = (entities[entityNames[i]]);
    }
  }
  return filtered;
}
