'use strict';

var expect = require('chai').expect,
    fs = require('fs'),
    fail = expect.fail,
    EntityParser = require('../../../lib/parser/entity_parser'),
    parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::convert', function () {
  describe('when passing invalid parameters', function () {
    describe('such as undefined', function () {
      it('throws an error', function () {
        try {
          EntityParser.parse();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException')
        }
      });
    });
    describe('such as an no databaseType', function () {
      it('throws an error', function () {
        try {
          EntityParser.parse({});
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
        var content = EntityParser.parse(input, 'sql');
        expect(content).not.to.be.null;
        expect(content.length).to.eq(8);
        expect(content[0].name).to.eq('Department');
        expect(content[0].body.fields.length).to.eq(2);
      });
    });
    describe('when converting JDL to entity json for MongoDB type', function () {
      it('converts it', function () {
        // TODO
      });
    });
    describe('when converting JDL to entity json for Cassandra type', function () {
      it('converts it', function () {
        // TODO
      });
    });
  });
});
