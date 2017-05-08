'use strict';

const JDLApplication = require('../core/jdl_application'),
  buildException = require('../exceptions/exception_factory').buildException,
  Exceptions = require('../exceptions/exception_factory').exceptions;

function convertToJHipsterFile(jdlApplication) {
  const errors = JDLApplication.checkValidity(jdlApplication);
  if (errors.length !== 0) {
    throw new buildException(
      Exceptions.InvalidObject,
      `The application must be valid in order to be converted.\nErrors: ${errors.join(', ')}`);
  }
  // TODO do it
}

module.exports = {
  convertToJHipsterFile: convertToJHipsterFile
};
