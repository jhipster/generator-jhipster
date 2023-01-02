/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFolderIfItDoesNotExist, doesFileExist, doesDirectoryExist } from '../../../jdl/utils/file-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('FileUtils', () => {
  describe('doesFileExist', () => {
    context('when checking a file path', () => {
      context('with a nil file path', () => {
        it('should return false', () => {
          // @ts-expect-error
          expect(doesFileExist()).to.be.false;
        });
      });
      context('with an invalid file path', () => {
        it('should return false', () => {
          expect(doesFileExist('someInvalidPath')).to.be.false;
        });
      });
      context('with a valid file path', () => {
        it('should return true', () => {
          expect(doesFileExist(path.join(__dirname, '..', 'test-files', 'MyEntity.json'))).to.be.true;
        });
      });
    });
  });
  describe('doesDirectoryExist', () => {
    context('when checking a directory path', () => {
      context('with a nil directory path', () => {
        it('return false', () => {
          // @ts-expect-error
          expect(doesDirectoryExist()).to.be.false;
        });
      });
      context('with an invalid directory path', () => {
        it('should return false', () => {
          expect(doesDirectoryExist(path.join(__dirname, 'invalid-folder'))).to.be.false;
        });
      });
      context('with a valid directory path', () => {
        it('should return true', () => {
          expect(doesDirectoryExist(__dirname)).to.be.true;
        });
      });
    });
  });
  describe('createFolderIfItDoesNotExist', () => {
    context('when not passing a directory', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          createFolderIfItDoesNotExist();
        }).to.throw(/^A directory must be passed to be created\.$/);
      });
    });
    context('when passing a directory that does not yet exist', () => {
      before(() => {
        createFolderIfItDoesNotExist('./here');
      });

      after(() => {
        fs.rmSync('./here', { recursive: true });
      });

      it('should create it', () => {
        expect(fs.statSync('./here').isDirectory()).to.be.true;
      });
    });
    context('when passing a file that exists', () => {
      it('should fail', () => {
        expect(() => {
          createFolderIfItDoesNotExist(path.join(__dirname, '..', '..', '..', 'package.json'));
        }).to.throw(/^The directory to create '.*?package\.json' is a file\.$/);
      });
    });
    context('when passing a directory that exists', () => {
      before(() => {
        createFolderIfItDoesNotExist('./test');
      });

      it('should do nothing', () => {
        expect(fs.statSync('./test').isDirectory()).to.be.true;
      });
    });
    context('when passing a path that does not contain more than one directory', () => {
      before(() => {
        createFolderIfItDoesNotExist(path.join('toto', 'titi', 'tutu'));
      });

      after(() => {
        fs.rmSync(path.join('toto', 'titi', 'tutu'), { recursive: true });
        fs.rmSync(path.join('toto', 'titi'), { recursive: true });
        fs.rmSync('toto', { recursive: true });
      });

      it('should create the folder structure recursively', () => {
        expect(fs.statSync('toto').isDirectory()).to.be.true;
        expect(fs.statSync(path.join('toto', 'titi')).isDirectory()).to.be.true;
        expect(fs.statSync(path.join('toto', 'titi', 'tutu')).isDirectory()).to.be.true;
      });
    });
  });
});
