'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    read = require('../../lib/reader/jdl_reader').read;

describe('#read', function () {
  describe('when passing invalid parameters', function () {
    describe('such as nil', function () {
      it('throws an error', function () {
        try {
          read(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
    describe('such as an empty array', function () {
      it('throws an error', function () {
        try {
          read([]);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
    describe("such as files without the '.jh' or '.jdl' file extension", function () {
      it('throws an error', function () {
        try {
          read(['../test_files/invalid_file.txt']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException')
        }
      });
    });
    describe('such as files that do not exist', function () {
      it('throws an error', function () {
        try {
          read(['nofile.jh']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException')
        }
      });
    });
    describe('such as folders', function () {
      it('throws an error', function () {
        try {
          read(['../test_files/folder.jdl']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException')
        }
      });
    });
  });
  describe('when passing valid arguments', function () {
    describe('when reading a single JDL file', function () {
      it('reads it', function () {
        var content = read(['./test/test_files/valid_jdl.jdl']);
        expect(content).not.to.be.null;
      });
    });
  });
});
