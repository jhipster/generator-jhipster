/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { after, before, describe, expect, it } from 'esmocha';
import fs from 'node:fs';
import path from 'node:path';

import { getPackageRoot } from '../../../index.ts';
import { getTestFile } from '../__test-support__/index.ts';

import { createFolderIfItDoesNotExist, doesDirectoryExist, doesFileExist } from './file-utils.ts';

describe('jdl - FileUtils', () => {
  describe('doesFileExist', () => {
    describe('when checking a file path', () => {
      describe('with a nil file path', () => {
        it('should return false', () => {
          // @ts-expect-error
          expect(doesFileExist()).toBe(false);
        });
      });
      describe('with an invalid file path', () => {
        it('should return false', () => {
          expect(doesFileExist('someInvalidPath')).toBe(false);
        });
      });
      describe('with a valid file path', () => {
        it('should return true', () => {
          expect(doesFileExist(getTestFile('MyEntity.json'))).toBe(true);
        });
      });
    });
  });
  describe('doesDirectoryExist', () => {
    describe('when checking a directory path', () => {
      describe('with a nil directory path', () => {
        it('return false', () => {
          // @ts-expect-error
          expect(doesDirectoryExist()).toBe(false);
        });
      });
      describe('with an invalid directory path', () => {
        it('should return false', () => {
          expect(doesDirectoryExist(path.join(import.meta.dirname, 'invalid-folder'))).toBe(false);
        });
      });
      describe('with a valid directory path', () => {
        it('should return true', () => {
          expect(doesDirectoryExist(import.meta.dirname)).toBe(true);
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
        }).toThrow(/^A directory must be passed to be created\.$/);
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
        expect(fs.statSync('./here').isDirectory()).toBe(true);
      });
    });
    describe('when passing a file that exists', () => {
      it('should fail', () => {
        expect(() => {
          createFolderIfItDoesNotExist(path.join(getPackageRoot(), 'package.json'));
        }).toThrow(/^The directory to create '.*?package\.json' is a file\.$/);
      });
    });
    describe('when passing a directory that exists', () => {
      before(() => {
        createFolderIfItDoesNotExist('./test');
      });

      it('should do nothing', () => {
        expect(fs.statSync('./test').isDirectory()).toBe(true);
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
        expect(fs.statSync('toto').isDirectory()).toBe(true);
        expect(fs.statSync(path.join('toto', 'titi')).isDirectory()).toBe(true);
        expect(fs.statSync(path.join('toto', 'titi', 'tutu')).isDirectory()).toBe(true);
      });
    });
  });
});
