/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const { renameSync } = require('fs');
const { join } = require('path');
const { expect } = require('chai');

const JSONReader = require('../../../lib/readers/json_reader');
const { SKIP_CLIENT, SKIP_SERVER } = require('../../../lib/core/jhipster/unary_options');

describe('JSONReader', () => {
  describe('::parseFromDir', () => {
    context('when passing invalid parameters', () => {
      context('such as nil', () => {
        it('throws an error', () => {
          expect(() => {
            JSONReader.parseFromDir(null);
          }).to.throw('The app directory must be passed to read JSON files.');
        });
      });
      context('such as a file', () => {
        it('throws an error', () => {
          expect(() => {
            JSONReader.parseFromDir('../../test_files/invalid_file.txt');
          }).to.throw(
            "The passed directory '../../test_files/invalid_file.txt' must exist and must be a directory to read JSON files."
          );
        });
      });
      context('such as a dir that does not exist', () => {
        it('throws an error', () => {
          expect(() => {
            JSONReader.parseFromDir('nodir');
          }).to.throw("The passed directory 'nodir' must exist and must be a directory to read JSON files.");
        });
      });
    });
    context('when passing valid arguments', () => {
      context('when reading a jhipster app dir', () => {
        let content;

        before(() => {
          renameSync(
            join('test', 'test_files', 'jhipster_app', '.jhipster', 'InvalidBlobType.json'),
            join('test', 'test_files', 'jhipster_app', '.jhipster', 'InvalidBlobType.txt')
          );
          content = JSONReader.parseFromDir('./test/test_files/jhipster_app');
        });
        after(() => {
          renameSync(
            join('test', 'test_files', 'jhipster_app', '.jhipster', 'InvalidBlobType.txt'),
            join('test', 'test_files', 'jhipster_app', '.jhipster', 'InvalidBlobType.json')
          );
        });

        it('reads it', () => {
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
