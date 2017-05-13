'use strict';

const JDLApplication = require('../core/jdl_application'),
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
  for (let i = 0; i < applications.length; i++) {
    const errors = JDLApplication.checkValidity(applications[i]);
    if (errors.length !== 0) {
      throw new buildException(
        Exceptions.InvalidObject,
        `The application must be valid in order to be converted.\nErrors: ${errors.join(', ')}`);
    }
    // TODO do it
  }
}


