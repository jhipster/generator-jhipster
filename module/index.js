'use strict';

var JDLParser = require('../lib/reader/jdl_reader');

module.exports = (function () {
  return {
    parse: JDLParser.read
  };
})();
