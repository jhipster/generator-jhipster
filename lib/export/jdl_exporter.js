'use strict';

const fs = require('fs'),
  buildException = require('../exceptions/exception_factory').buildException,
  exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJDL: exportToJDL
};

function exportToJDL(jdl, path) {
  if (!jdl) {
    throw new buildException(
      exceptions.NullPointer,
      'A JDLObject has to be passed to be exported.');
  }
  if (!path) {
    path = "./jhipster-jdl.jh";
  }
  fs.writeFileSync(path, jdl.toString());
}
