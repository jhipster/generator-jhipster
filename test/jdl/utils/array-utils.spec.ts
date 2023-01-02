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

import { expect } from 'chai';
import deduplicate from '../../../jdl/utils/array-utils.js';

describe('ArrayUtils', () => {
  describe('deduplicate', () => {
    context('when not passing an array', () => {
      it('should return an empty array', () => {
        // @ts-expect-error
        expect(deduplicate()).to.deep.equal([]);
      });
    });
    context('when passing an array', () => {
      context('without duplicates', () => {
        it('should not change it', () => {
          expect(deduplicate([1, 2, 3, 4])).to.deep.equal([1, 2, 3, 4]);
        });
      });
      context('with duplicates', () => {
        it('should remove the duplicates from it', () => {
          expect(deduplicate([1, 2, 2, 1, 3])).to.deep.equal([1, 2, 3]);
        });
      });
    });
  });
});
