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

function exportToJSON(entities, forceNoFiltering) {
  if (!entities) {
    throw new buildException(
        exceptions.NullPointer,
        'Entities have to be passed to be exported.');
  }
  createJHipsterJSONFolder();
  if (!forceNoFiltering) {
    entities = filterOutUnchangedEntities(entities);
  }
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    let file = toFilePath(entityNames[i]);
    fs.writeFileSync(file, JSON.stringify(entities[entityNames[i]], null, 4));
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
    let fileExists = true;
    try {
      fileExists = fs.statSync(filePath).isFile();
    } catch (error) {
      fileExists = false;
    }
    if (!(fileExists && areJHipsterEntitiesEqual(readEntityJSON(filePath), entities[entityNames[i]]))) {
      filtered[entityNames[i]] = (entities[entityNames[i]]);
    }
  }
  return filtered;
}
