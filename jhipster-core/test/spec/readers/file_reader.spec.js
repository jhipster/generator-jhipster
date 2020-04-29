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

const fs = require('fs');
const { expect } = require('chai');
const FileReader = require('../../../lib/readers/file_reader');

describe('FileReader', () => {
  describe('readFile', () => {
    context('when passing a nil path', () => {
      it('should fail', () => {
        expect(() => {
          FileReader.readFile(null);
        }).to.throw(/^The passed file must not be nil to be read\.$/);
      });
    });
    context('when passing a directory', () => {
      it('should fail', () => {
        expect(() => {
          FileReader.readFile('.');
        }).to.throw(/^The passed file '.' must exist and must not be a directory to be read\.$/);
      });
    });
    context('when passing a valid text file', () => {
      let content;

      before(() => {
        fs.writeFileSync('./myFile.txt', 'Hello World');
        content = FileReader.readFile('./myFile.txt');
      });

      after(() => {
        fs.unlinkSync('./myFile.txt');
      });

      it('should read it', () => {
        expect(content).to.equal('Hello World');
      });
    });
  });
  describe('readFiles', () => {
    context('when passing a nil iterable', () => {
      it('should fail', () => {
        expect(() => {
          FileReader.readFiles(null);
        }).to.throw(/^The passed files must not be nil\.$/);
      });
    });
    context('when passing a directory among the files', () => {
      it('should fail', () => {
        expect(() => {
          FileReader.readFiles(['.']);
        }).to.throw(/^The passed file '.' must exist and must not be a directory to be read\.$/);
      });
    });
    context('when passing valid text files', () => {
      let content;

      before(() => {
        fs.writeFileSync('./myFile1.txt', 'Hello...');
        fs.writeFileSync('./myFile2.txt', ' World!');
        content = FileReader.readFiles(['./myFile1.txt', './myFile2.txt']);
      });

      after(() => {
        fs.unlinkSync('./myFile1.txt');
        fs.unlinkSync('./myFile2.txt');
      });

      it('should read them', () => {
        expect(content).to.deep.equal(['Hello...', ' World!']);
      });
    });
  });
});
