/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

/* eslint-disable no-unused-expressions */

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const FileUtils = require('../../../lib/utils/file_utils');

describe('FileUtils', () => {
  describe('::doesFileExist', () => {
    context('when checking a file path', () => {
      context('with a nil file path', () => {
        it('returns false', () => {
          expect(FileUtils.doesFileExist()).to.be.false;
        });
      });
      context('with an invalid file path', () => {
        it('returns false', () => {
          expect(FileUtils.doesFileExist('someInvalidPath')).to.be.false;
        });
      });
      context('with a valid file path', () => {
        it('returns true', () => {
          expect(FileUtils.doesFileExist('./test/test_files/MyEntity.json')).to.be.true;
        });
      });
    });
  });
  describe('::doesDirectoryExist', () => {
    context('when checking a directory path', () => {
      context('with a nil directory path', () => {
        it('return false', () => {
          expect(FileUtils.doesDirectoryExist()).to.be.false;
        });
      });
      context('with an invalid directory path', () => {
        it('returns false', () => {
          expect(FileUtils.doesDirectoryExist('./someInvalidPath')).to.be.false;
        });
      });
      context('with a valid directory path', () => {
        it('returns true', () => {
          expect(FileUtils.doesDirectoryExist('./test/test_files/')).to.be.true;
        });
      });
    });
  });
  describe('::createDirectory', () => {
    context('when not passing a directory', () => {
      it('fails', () => {
        expect(() => {
          FileUtils.createDirectory();
        }).to.throw('A directory must be passed to be created.');
      });
    });
    context('when passing a directory that does not yet exist', () => {
      before(() => {
        FileUtils.createDirectory('./here');
      });

      after(() => {
        fs.rmdirSync('./here');
      });

      it('creates it', () => {
        expect(fs.statSync('./here').isDirectory()).to.be.true;
      });
    });
    context('when passing a file that exists', () => {
      it('fails', () => {
        expect(() => {
          FileUtils.createDirectory('./package.json');
        }).to.throw("The directory to create './package.json' is a file.");
      });
    });
    context('when passing a directory that exists', () => {
      before(() => {
        FileUtils.createDirectory('./test');
      });

      it('does nothing', () => {
        expect(fs.statSync('./test').isDirectory()).to.be.true;
      });
    });
    context('when passing a path that does not contain more than one directory', () => {
      before(() => {
        FileUtils.createDirectory(path.join('toto', 'titi', 'tutu'));
      });

      after(() => {
        fs.rmdirSync(path.join('toto', 'titi', 'tutu'));
        fs.rmdirSync(path.join('toto', 'titi'));
        fs.rmdirSync('toto');
      });

      it('creates the folder structure recursively', () => {
        expect(fs.statSync('toto').isDirectory()).to.be.true;
        expect(fs.statSync(path.join('toto', 'titi')).isDirectory()).to.be.true;
        expect(fs.statSync(path.join('toto', 'titi', 'tutu')).isDirectory()).to.be.true;
      });
    });
  });
});
