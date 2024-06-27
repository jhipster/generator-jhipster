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

/* eslint-disable no-new, no-unused-expressions */
import { renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, after } from 'esmocha';
import { expect } from 'chai';

import parseFromDir from '../readers/json-reader.js';
import { unaryOptions } from '../jhipster/index.js';

const { SKIP_CLIENT, SKIP_SERVER } = unaryOptions;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('jdl - JSONReader', () => {
  describe('parseFromDir', () => {
    describe('when passing invalid parameters', () => {
      describe('such as nil', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            parseFromDir(null);
          }).to.throw(/^The app directory must be passed to read JSON files\.$/);
        });
      });
      describe('such as a file', () => {
        it('should fail', () => {
          expect(() => {
            parseFromDir('../../__test-files__/invalid_file.txt');
          }).to.throw(
            new RegExp(
              "The passed directory '../../__test-files__/invalid_file.txt' must exist and must be a directory to read JSON files.",
            ),
          );
        });
      });
      describe('such as a dir that does not exist', () => {
        it('should fail', () => {
          expect(() => {
            parseFromDir('nodir');
          }).to.throw(new RegExp("The passed directory 'nodir' must exist and must be a directory to read JSON files."));
        });
      });
    });
    describe('when passing valid arguments', () => {
      describe('when reading a jhipster app dir', () => {
        let content;

        before(() => {
          renameSync(
            join(__dirname, '..', '__test-files__', 'jhipster_app', '.jhipster', 'InvalidBlobType.json'),
            join(__dirname, '..', '__test-files__', 'jhipster_app', '.jhipster', 'InvalidBlobType.txt'),
          );
          content = parseFromDir(join(__dirname, '..', '__test-files__', 'jhipster_app'));
        });
        after(() => {
          renameSync(
            join(__dirname, '..', '__test-files__', 'jhipster_app', '.jhipster', 'InvalidBlobType.txt'),
            join(__dirname, '..', '__test-files__', 'jhipster_app', '.jhipster', 'InvalidBlobType.json'),
          );
        });

        it('should read it', () => {
          expect(content.entities.Country).not.to.be.undefined;
          expect(content.entities.Department).not.to.be.undefined;
          expect(content.entities.Employee).not.to.be.undefined;
          expect(content.entities.Job).not.to.be.undefined;
          expect(content.entities.JobHistory).not.to.be.undefined;
          expect(content.entities.Region).not.to.be.undefined;
          expect(content.entities.Task).not.to.be.undefined;
          expect(content.entities.NoEntity).to.be.undefined;
          expect(content.entities.BadEntity).to.be.undefined;
          expect(content.getOptions().filter(o => o.name === SKIP_CLIENT).length).eq(1);
          expect(content.getOptions().filter(o => o.name === SKIP_SERVER).length).eq(1);
        });
      });
    });
  });
});
