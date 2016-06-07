'use strict';

const JDLReader = require('../lib/reader/jdl_reader');

module.exports = {
  parse: JDLReader.read,
  parseFromFiles: JDLReader.readFiles,
  isJDLFile: JDLReader.checkFileIsJDLFile
};
