/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { after, before, describe, it } from 'esmocha';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { expect } from 'chai';

import { getPackageRoot } from '../../../index.ts';
import { getTestFile } from '../__test-support__/index.ts';
import { createFolderIfItDoesNotExist, doesDirectoryExist, doesFileExist } from '../utils/file-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('jdl - FileUtils', () => {
  describe('doesFileExist', () => {
    describe('when checking a file path', () => {
      describe('with a nil file path', () => {
        it('should return false', () => {
          // @ts-expect-error
          expect(doesFileExist()).to.be.false;
        });
      });
      describe('with an invalid file path', () => {
        it('should return false', () => {
          expect(doesFileExist('someInvalidPath')).to.be.false;
        });
      });
      describe('with a valid file path', () => {
        it('should return true', () => {
          expect(doesFileExist(getTestFile('MyEntity.json'))).to.be.true;
        });
      });
    });
  });
  describe('doesDirectoryExist', () => {
    describe('when checking a directory path', () => {
      describe('with a nil directory path', () => {
        it('return false', () => {
          // @ts-expect-error
          expect(doesDirectoryExist()).to.be.false;
        });
      });
      describe('with an invalid directory path', () => {
        it('should return false', () => {
          expect(doesDirectoryExist(path.join(__dirname, 'invalid-folder'))).to.be.false;
        });
      });
      describe('with a valid directory path', () => {
        it('should return true', () => {
          expect(doesDirectoryExist(__dirname)).to.be.true;
        });
      });
    });
  });
  describe('createFolderIfItDoesNotExist', () => {
    describe('when not passing a directory', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          createFolderIfItDoesNotExist();
        }).to.throw(/^A directory must be passed to be created\.$/);
      });
    });
    describe('when passing a directory that does not yet exist', () => {
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
    describe('when passing a file that exists', () => {
      it('should fail', () => {
        expect(() => {
          createFolderIfItDoesNotExist(path.join(getPackageRoot(), 'package.json'));
        }).to.throw(/^The directory to create '.*?package\.json' is a file\.$/);
      });
    });
    describe('when passing a directory that exists', () => {
      before(() => {
        createFolderIfItDoesNotExist('./test');
      });

      it('should do nothing', () => {
        expect(fs.statSync('./test').isDirectory()).to.be.true;
      });
    });
    describe('when passing a path that does not contain more than one directory', () => {
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
