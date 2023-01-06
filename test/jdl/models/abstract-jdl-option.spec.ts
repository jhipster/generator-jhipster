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
import { jestExpect as expect } from 'mocha-expect-snapshot';
import JDLBinaryOption from '../../../jdl/models/jdl-binary-option.js';
import { binaryOptions } from '../../../jdl/jhipster/index.mjs';

describe('jdl - AbstractJDLOption', () => {
  describe('resolveEntityNames', () => {
    context('when not passing entity names', () => {
      it('should fail', () => {
        expect(() => {
          new JDLBinaryOption({
            name: binaryOptions.Options.SERVICE,
            value: binaryOptions.Values.service.SERVICE_CLASS,
            // @ts-expect-error
          }).resolveEntityNames();
        }).toThrow(/^Entity names have to be passed to resolve the option's entities\.$/);
      });
    });
    context('when passing entity names', () => {
      let result;

      before(() => {
        const option = new JDLBinaryOption({
          name: binaryOptions.Options.SERVICE,
          value: binaryOptions.Values.service.SERVICE_CLASS,
          excludedNames: ['C'],
        });
        result = option.resolveEntityNames(['A', 'B', 'C']);
      });

      it("should resolve the option's entity names", () => {
        expect(result).toMatchInlineSnapshot(`
Set {
  "A",
  "B",
}
`);
      });
    });
  });
});
