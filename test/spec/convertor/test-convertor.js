'use strict';

var expect = require('chai').expect,
    fs = require('fs'),
    fail = expect.fail,
    convertToJson = require('../../../lib/convertor/jdl_convertor').convertToJson,
    parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::convert', function () {
  /*describe('when passing invalid parameters', function () {
    describe('such as nil', function () {
      it('throws an error', function () {
        try {
          parse(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
    describe('such as an empty array', function () {
      it('throws an error', function () {
        try {
          parse('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
  });*/
  describe('when passing valid arguments', function () {
    describe('when converting JDL to entity json for SQL type', function () {
      it('converts it', function () {
        var input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
        var content = convertToJson(input, 'sql');
        console.error('------------------');
        console.error(input);
        console.error('------------------');
        expect(content).not.to.be.null;
      });
    });
  });
});
