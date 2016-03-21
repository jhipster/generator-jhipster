'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    readFile = require('../../lib/reader/jdl_reader').read,
    readFiles = require('../../lib/reader/jdl_reader').readFiles;

describe('#readContent', function () {
  describe('when passing invalid parameters', function () {
    describe('such as nil', function () {
      it('throws an error', function () {
        try {
          readFile(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
    describe('such as an empty array', function () {
      it('throws an error', function () {
        try {
          readFile('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
  });
});
describe('#readFiles', function() {
  describe('when passing invalid parameters', function () {
    describe('such as nil', function () {
      it('throws an error', function () {
        try {
          readFiles(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
    describe('such as an empty array', function () {
      it('throws an error', function () {
        try {
          readFiles([]);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException')
        }
      });
    });
    describe("such as files without the '.jh' or '.jdl' file extension", function () {
      it('throws an error', function () {
        try {
          readFiles(['../test_files/invalid_file.txt']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException')
        }
      });
    });
    describe('such as files that do not exist', function () {
      it('throws an error', function () {
        try {
          readFiles(['nofile.jh']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException')
        }
      });
    });
    describe('such as folders', function () {
      it('throws an error', function () {
        try {
          readFiles(['../test_files/folder.jdl']);
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
        var content = readFiles(['./test/test_files/valid_jdl.jdl']);
        expect(content).not.to.be.null;
      });
    });
    describe('when reading more than one JDL file', function() {
      it('reads them', function () {
        var content = readFiles(['./test/test_files/valid_jdl.jdl', './test/test_files/valid_jdl2.jdl']);
        expect(content).not.to.be.null;
      });
    });
  });
});
