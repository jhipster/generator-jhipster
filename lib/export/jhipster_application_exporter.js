'use strict';

const JDLApplication = require('../core/jdl_application'),
  fs = require('fs'),
  buildException = require('../exceptions/exception_factory').buildException,
  Exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportApplications: exportApplications
};

function exportApplications(applications) {
  if (!applications) {
    throw new buildException(
      Exceptions.NullPointer,
      'Applications have to be passed to be exported.');
  }
  for (let applicationName in applications) {
    let application = applications[applicationName];
    const errors = JDLApplication.checkValidity(application);
    if (errors.length !== 0) {
      throw new buildException(
        Exceptions.InvalidObject,
        `The application must be valid in order to be converted.\nErrors: ${errors.join(', ')}`);
    }
    fs.writeFileSync('./test.json', JSON.stringify(application, null, 4));
  }
}


