

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const fs = require('fs');

const fail = expect.fail;
const parse = require('../../../lib/reader/jdl_reader').parse;
const parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::parse', () => {
  describe('when passing invalid parameters', () => {
    describe('such as nil', () => {
      it('throws an error', () => {
        try {
          parse(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('such as an empty array', () => {
      it('throws an error', () => {
        try {
          parse('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when reading JDL content', () => {
      const input = fs.readFileSync('./test/test_files/valid_jdl.jdl', 'utf-8').toString();
      const content = parse(input);
      it('reads it', () => {
        expect(content).not.to.be.null;
      });
    });
  });
});
describe('::parseFromFiles', () => {
  describe('when passing invalid parameters', () => {
    describe('such as nil', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('such as an empty array', () => {
      it('throws an error', () => {
        try {
          parseFromFiles([]);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('such as files without the \'.jh\' or \'.jdl\' file extension', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(['../../test_files/invalid_file.txt']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException');
        }
      });
    });
    describe('such as files that do not exist', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(['nofile.jh']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException');
        }
      });
    });
    describe('such as folders', () => {
      it('throws an error', () => {
        try {
          parseFromFiles(['../../test_files/folder.jdl']);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongFileException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when reading a single JDL file', () => {
      const content = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
      it('reads it', () => {
        expect(content).not.to.be.null;
      });
    });
    describe('when reading more than one JDL file', () => {
      const content = parseFromFiles(['./test/test_files/valid_jdl.jdl', './test/test_files/valid_jdl2.jdl']);
      it('reads them', () => {
        expect(content).not.to.be.null;
      });
    });
    describe('when reading a complex JDL file', () => {
      const content = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
      it('reads them', () => {
        expect(content).not.to.be.null;
      });
    });
    describe('when having multiple internal JDL comments', () => {
      it('ignores them and does not fail', () => {
        try {
          parseFromFiles(['./test/test_files/multiple_jdl_comments.jdl']);
        } catch (error) {
          fail(error, null, error);
        }
      });
    });
  });
});
