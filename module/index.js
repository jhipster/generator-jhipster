'use strict';

const JDLReader = require('../lib/reader/jdl_reader');

module.exports = {
  parse: JDLReader.parse,
  parseFromFiles: JDLReader.parseFromFiles,
  convertToEntityJson: JDLReader.convertToEntityJson
};
