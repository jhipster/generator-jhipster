
/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const toFilePath = require('../../../lib/reader/json_file_reader').toFilePath;
const doesfileExist = require('../../../lib/reader/json_file_reader').doesfileExist;
const readEntityJSON = require('../../../lib/reader/json_file_reader').readEntityJSON;

describe('JSONFileReader', () => {
  describe('::readEntityJSON', () => {
    describe('when passing an invalid argument', () => {
      describe('because it is nil', () => {
        it('fails', () => {
          try {
            readEntityJSON();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because it is empty', () => {
        it('fails', () => {
          try {
            readEntityJSON('');
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because the file does not exist', () => {
        it('fails', () => {
          try {
            readEntityJSON('test/test_files/WrongFile.json');
            fail();
          } catch (error) {
            expect(error.name).to.eq('FileNotFoundException');
          }
        });
      });
      describe('because the file is a folder', () => {
        it('fails', () => {
          try {
            readEntityJSON('test/test_files/');
            fail();
          } catch (error) {
            expect(error.name).to.eq('FileNotFoundException');
          }
        });
      });
    });
    describe('when passing a valid entity name', () => {
      const content = readEntityJSON('test/test_files/MyEntity.json');
      it('reads the file', () => {
        expect(content).to.deep.eq(
          {
            relationships: [],
            fields: [
              {
                fieldName: 'myField',
                fieldType: 'String'
              }
            ],
            changelogDate: '20160705183933',
            dto: 'no',
            service: 'no',
            entityTableName: 'my_entity',
            pagination: 'no'
          }
        );
      });
    });
  });
  describe('::toFilePath', () => {
    describe('when converting an entity name to a path', () => {
      describe('with a nil entity name', () => {
        it('fails', () => {
          try {
            toFilePath();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('with an empty entity name', () => {
        it('fails', () => {
          try {
            toFilePath('');
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('with a valid entity name', () => {
        it('returns the path', () => {
          const name = 'MyEntity';
          expect(toFilePath(name)).to.eq(`.jhipster/${name}.json`);
        });
      });
      describe('with a valid entity name with the first letter lowercase', () => {
        it('returns the path, with the first letter upper-cased', () => {
          const expectedFirstLetter = 'M';
          const name = 'myEntity';
          expect(
            toFilePath(name)
          ).to.eq(`.jhipster/${expectedFirstLetter}${name.slice(1, name.length)}.json`);
        });
      });
    });
  });
  describe('::doesfileExist', () => {
    describe('when checking a file path', () => {
      describe('with a nil file path', () => {
        it('return false', () => {
          expect(doesfileExist()).to.be.false;
        });
      });
      describe('with an invalid file path', () => {
        it('return false', () => {
          expect(doesfileExist('someInvalidPath')).to.be.false;
        });
      });
      describe('with a valid file path', () => {
        it('return true', () => {
          expect(doesfileExist('./test/test_files/MyEntity.json')).to.be.true;
        });
      });
    });
  });
});
