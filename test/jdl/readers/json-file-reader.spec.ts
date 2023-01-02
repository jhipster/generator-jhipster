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

/* eslint-disable no-new, no-unused-expressions */
import { expect } from 'chai';
import path from 'path';

import * as JSONFileReader from '../../../jdl/readers/json-file-reader.js';

describe('JSONFileReader', () => {
  describe('toFilePath', () => {
    context('when converting an entity name to a path', () => {
      context('with a nil entity name', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
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
