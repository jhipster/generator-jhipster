/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const path = require('path');

const JSONFileReader = require('../../../lib/readers/json_file_reader');

describe('JSONFileReader', () => {
  describe('readEntityJSON', () => {
    context('when passing an invalid argument', () => {
      context('because it is nil', () => {
        it('should fail', () => {
          expect(() => {
            JSONFileReader.readEntityJSON();
          }).to.throw(/^The passed file path must not be nil to read the JSON entity\.$/);
        });
      });
      context('because it is empty', () => {
        it('should fail', () => {
          expect(() => {
            JSONFileReader.readEntityJSON('');
          }).to.throw(/^The passed file path must not be nil to read the JSON entity\.$/);
        });
      });
      context('because the file does not exist', () => {
        it('should fail', () => {
          expect(() => {
            JSONFileReader.readEntityJSON('test/test_files/WrongFile.json');
          }).to.throw(
            new RegExp(
              "The passed file 'test/test_files/WrongFile.json' must exist and must not be a directory to be read."
            )
          );
        });
      });
      context('because the file is a folder', () => {
        it('should fail', () => {
          expect(() => {
            JSONFileReader.readEntityJSON('test/test_files/');
          }).to.throw(
            new RegExp("The passed file 'test/test_files/' must exist and must not be a directory to be read.")
          );
        });
      });
    });
    context('when passing a valid entity name', () => {
      let content;

      before(() => {
        content = JSONFileReader.readEntityJSON('test/test_files/MyEntity.json');
      });

      it('should read the file', () => {
        expect(content).to.deep.eq({
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
        });
      });
    });
  });
  describe('toFilePath', () => {
    context('when converting an entity name to a path', () => {
      context('with a nil entity name', () => {
        it('should fail', () => {
          expect(() => {
            JSONFileReader.toFilePath();
          }).to.throw(/^The passed entity name must not be nil to be converted to file path\.$/);
        });
      });
      context('with an empty entity name', () => {
        it('should fail', () => {
          expect(() => {
            JSONFileReader.toFilePath('');
          }).to.throw(/^The passed entity name must not be nil to be converted to file path\.$/);
        });
      });
      context('with a valid entity name', () => {
        it('should return the path', () => {
          expect(JSONFileReader.toFilePath('MyEntity')).to.equal(`.jhipster${path.sep}${'MyEntity'}.json`);
        });
      });
      context('with a valid entity name with the first letter lowercase', () => {
        it('should return the path, with the first letter upper-cased', () => {
          expect(JSONFileReader.toFilePath('myEntity')).to.equal(`.jhipster${path.sep}MyEntity.json`);
        });
      });
    });
  });
});
