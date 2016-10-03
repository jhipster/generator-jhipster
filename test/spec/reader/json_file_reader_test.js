'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    toFilePath = require('../../../lib/reader/json_file_reader').toFilePath,
    doesfileExist = require('../../../lib/reader/json_file_reader').doesfileExist,
    readEntityJSON = require('../../../lib/reader/json_file_reader').readEntityJSON;

describe('JSONFileReader', function () {
  describe('::readEntityJSON', function () {
    describe('when passing an invalid argument', function () {
      describe('because it is nil', function () {
        it('fails', function () {
          try {
            readEntityJSON();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because it is empty', function () {
        it('fails', function () {
          try {
            readEntityJSON('');
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because the file does not exist', function () {
        it('fails', function () {
          try {
            readEntityJSON('test/test_files/WrongFile.json');
            fail();
          } catch (error) {
            expect(error.name).to.eq('FileNotFoundException');
          }
        });
      });
      describe('because the file is a folder', function () {
        it('fails', function () {
          try {
            readEntityJSON('test/test_files/');
            fail();
          } catch (error) {
            expect(error.name).to.eq('FileNotFoundException');
          }
        });
      });
    });
    describe('when passing a valid entity name', function () {
      it('reads the file', function () {
        var content = readEntityJSON('test/test_files/MyEntity.json');
        expect(content).to.deep.eq({
              "relationships": [],
              "fields": [
                {
                  "fieldName": "myField",
                  "fieldType": "String"
                }
              ],
              "changelogDate": "20160705183933",
              "dto": "no",
              "service": "no",
              "entityTableName": "my_entity",
              "pagination": "no"
            }
        )
      });
    });
  });
  describe('::toFilePath', function () {
    describe('when converting an entity name to a path', function () {
      describe('with a nil entity name', function () {
        it('fails', function () {
          try {
            toFilePath();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('with an empty entity name', function () {
        it('fails', function () {
          try {
            toFilePath('');
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('with a valid entity name', function () {
        it('returns the path', function () {
          let name = 'MyEntity';
          expect(toFilePath(name)).to.eq(`.jhipster/${name}.json`)
        });
      });
      describe('with a valid entity name with the first letter lowercase', function () {
        it('returns the path, with the first letter upper-cased', function () {
          let expectedFirstLetter = 'M';
          let name = 'myEntity';
          expect(toFilePath(name)).to.eq(`.jhipster/${expectedFirstLetter}${name.slice(1, name.length)}.json`)
        });
      });
    });
  });
  describe('::doesfileExist', function () {
    describe('when checking a file path', function () {
      describe('with a nil file path', function () {
        it('return false', function () {
          expect(doesfileExist()).to.be.false;
        });
      });
      describe('with an invalid file path', function () {
        it('return false', function () {
          expect(doesfileExist('someInvalidPath')).to.be.false;
        });
      });
      describe('with a valid file path', function () {
        it('return true', function () {
          expect(doesfileExist(`./test/test_files/MyEntity.json`)).to.be.true;
        });
      });
    });
  });
});
