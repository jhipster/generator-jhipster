'use strict';

var JDLParser = require('../lib/reader/jdl_reader');

module.exports = (function () {
  var self = {};
  self.parse = JDLParser.read(process.argv.slice(2));
  return self;
})();
