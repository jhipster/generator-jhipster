'use strict';

const expect = require('chai').expect,
    fs = require('fs'),
    fail = expect.fail,
    parseFromDir = require('../../../lib/reader/json_reader').parseFromDir,
    UnaryOptions = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS;

describe('::parseFromDir', function() {
  describe('when passing invalid parameters', function () {
    describe('such as nil', function () {
      it('throws an error', function () {
        try {
          parseFromDir(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
    describe("such as a file", function () {
      it('throws an error', function () {
        try {
          parseFromDir('../../test_files/invalid_file.txt');
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongDirException')
        }
      });
    });
    describe('such as a dir that does not exist', function () {
      it('throws an error', function () {
        try {
          parseFromDir('nodir');
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongDirException')
        }
      });
    });
  });
  describe('when passing valid arguments', function () {
    describe('when reading a jhipster app dir', function () {
      it('reads it', function () {
        var content = parseFromDir('./test/test_files/jhipster_app');
        expect(content.entities.Country).not.to.be.undefined;
        expect(content.entities.Department).not.to.be.undefined;
        expect(content.entities.Employee).not.to.be.undefined;
        expect(content.entities.Job).not.to.be.undefined;
        expect(content.entities.JobHistory).not.to.be.undefined;
        expect(content.entities.Region).not.to.be.undefined;
        expect(content.entities.Task).not.to.be.undefined;
        expect(content.entities.NoEntity).to.be.undefined;
        expect(content.entities.BadEntity).to.be.undefined;
        expect(content.options.filter( o => o.name === UnaryOptions.SKIP_CLIENT).length).eq(1);
        expect(content.options.filter( o => o.name === UnaryOptions.SKIP_SERVER).length).eq(1);
      });
    });
  });
});
