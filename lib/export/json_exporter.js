'use strict';

const fs = require('fs'),
    readEntityJSON = require('../reader/json_file_reader').readEntityJSON,
    toFilePath = require('../reader/json_file_reader').toFilePath,
    areJHipsterEntitiesEqual = require('../utils/object_utils').areEntitiesEqual,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJSON: exportToJSON
};

function exportToJSON(entities) {
  if (!entities) {
    throw new buildException(
        exceptions.NullPointer,
        'Entities have to be passed to be exported.');
  }
  if (!fs.statSync('./.jhipster').isFile()) {
    fs.mkdirSync('.jhipster');
  }
  let filteredEntities = filterOutUnchangedEntities(entities);
  for (let i = 0, entityNames = Object.keys(filteredEntities); i < entityNames.length; i++) {
    let file = toFilePath(entityNames[i]);
    fs.writeFileSync(file, JSON.stringify(filteredEntities[entityNames[i]], null, '  '));
  }
}

function filterOutUnchangedEntities(entities) {
  var filtered = {};
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    if (!areJHipsterEntitiesEqual(readEntityJSON(toFilePath(entityNames[i])), entities[entityNames[i]])) {
      filtered[entityNames[i]].push(entities[entityNames[i]]);
    }
  }
  return filtered;
}
