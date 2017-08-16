

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const parseFromDir = require('../../../lib/reader/json_reader').parseFromDir;
const UnaryOptions = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS;

describe('::parseFromDir', () => {
  describe('when passing invalid parameters', () => {
    describe('such as nil', () => {
      it('throws an error', () => {
        try {
          parseFromDir(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('such as a file', () => {
      it('throws an error', () => {
        try {
          parseFromDir('../../test_files/invalid_file.txt');
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongDirException');
        }
      });
    });
    describe('such as a dir that does not exist', () => {
      it('throws an error', () => {
        try {
          parseFromDir('nodir');
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongDirException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when reading a jhipster app dir', () => {
      const content = parseFromDir('./test/test_files/jhipster_app');
      it('reads it', () => {
        expect(content.entities.Country).not.to.be.undefined;
        expect(content.entities.Department).not.to.be.undefined;
        expect(content.entities.Employee).not.to.be.undefined;
        expect(content.entities.Job).not.to.be.undefined;
        expect(content.entities.JobHistory).not.to.be.undefined;
        expect(content.entities.Region).not.to.be.undefined;
        expect(content.entities.Task).not.to.be.undefined;
        expect(content.entities.NoEntity).to.be.undefined;
        expect(content.entities.BadEntity).to.be.undefined;
        expect(content.getOptions().filter(o => o.name === UnaryOptions.SKIP_CLIENT).length).eq(1);
        expect(content.getOptions().filter(o => o.name === UnaryOptions.SKIP_SERVER).length).eq(1);
      });
    });
  });
});
