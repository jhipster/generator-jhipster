/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import fs from 'fs';
import { it, describe, expect as jestExpect, beforeEach } from 'esmocha';
import { expect } from 'chai';
import { readFile, readFiles } from '../readers/file-reader.js';
import { basicHelpers as helpers } from '../../testing/index.js';

describe('jdl - FileReader', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  describe('readFile', () => {
    describe('when passing a nil path', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          readFile(null);
        }).to.throw(/^The passed file must not be nil to be read\.$/);
      });
    });
    describe('when passing a directory', () => {
      it('should fail', () => {
        expect(() => {
          readFile('.');
        }).to.throw(/^The passed file '.' must exist and must not be a directory to be read\.$/);
      });
    });
    describe('when passing a valid text file', () => {
      let content: string;

      beforeEach(() => {
        fs.writeFileSync('./myFile.txt', 'Hello World');
        content = readFile('./myFile.txt');
      });

      it('should read it', () => {
        expect(content).to.equal('Hello World');
      });
    });
  });
  describe('readFiles', () => {
    describe('when passing a nil iterable', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          readFiles(null);
        }).to.throw(/^The passed files must not be nil\.$/);
      });
    });
    describe('when passing a directory among the files', () => {
      it('should fail', () => {
        expect(() => {
          readFiles(['.']);
        }).to.throw(/^The passed file '.' must exist and must not be a directory to be read\.$/);
      });
    });
    describe('when passing valid text files', () => {
      let content: string[];

      beforeEach(() => {
        fs.writeFileSync('./myFile1.txt', 'Hello...');
        fs.writeFileSync('./myFile2.txt', ' World!');
        content = readFiles(['./myFile1.txt', './myFile2.txt']);
      });

      it('should read them', () => {
        jestExpect(content).toMatchInlineSnapshot(`
[
  "Hello...",
  " World!",
]
`);
      });
    });
  });
});
