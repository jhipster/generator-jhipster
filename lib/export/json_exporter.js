'use strict';

const fs = require('fs'),
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
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    let file = `.jhipster/${entityNames[i]}.json`;
    fs.writeFileSync(file, JSON.stringify(entities[entityNames[i]], null, '  '));
  }
}
