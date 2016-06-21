'use strict';

var expect = require('chai').expect,
    fs = require('fs'),
    fail = expect.fail,
    convertToJson = require('../../../lib/convertor/jdl_convertor').convertToJson,
    parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::convert', function () {
  describe('when passing invalid parameters', function () {
    describe('such as undefined', function () {
      it('throws an error', function () {
        try {
          convertToJson();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException')
        }
      });
    });
    describe('such as an no databaseType', function () {
      it('throws an error', function () {
        try {
          convertToJson({});
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException')
        }
      });
    });
  });
  describe('when passing valid arguments', function () {
    describe('when converting JDL to entity json for SQL type', function () {
      it('converts it', function () {
        var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
        var content = convertToJson(input, 'sql');
        expect(content).not.to.be.null;
      });
    });
  });
});
