'use strict';

const fs = require('fs'),
  buildException = require('../exceptions/exception_factory').buildException,
  Exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJDL: exportToJDL
};

function exportToJDL(jdl, path) {
  if (!jdl) {
    throw new buildException(
      Exceptions.NullPointer,
      'A JDLObject has to be passed to be exported.');
  }
  path = path || './jhipster-jdl.jh';
  fs.writeFileSync(path, jdl.toString());
}
