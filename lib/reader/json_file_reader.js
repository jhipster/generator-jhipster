'use strict';

const fs = require('fs'),
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  readEntityJSON: readEntityJSON
};

function readEntityJSON(filePath) {
  if (isNilOrEmpty(filePath)) {
    throw new buildException(exceptions.NullPointer, 'The passed file path must not be nil.');
  }
  try {
    if (!fs.statSync(filePath).isFile()) {
      throw new buildException(exceptions.FileNotFound, `The passed file '${filePath}' is a folder.`);
    }
  } catch (error) {
    if (error.name === 'FileNotFoundException') {
      throw error;
    }
    throw new buildException(exceptions.FileNotFound, `The passed file '${filePath}' couldn't be found.`);
  }
  return JSON.parse(fs.readFileSync(filePath));
}
