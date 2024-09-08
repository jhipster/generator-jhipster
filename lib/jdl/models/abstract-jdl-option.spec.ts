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

import { before, describe, expect, it } from 'esmocha';
import JDLBinaryOption from '../models/jdl-binary-option.js';
import { binaryOptions } from '../built-in-options/index.js';

describe('jdl - AbstractJDLOption', () => {
  describe('resolveEntityNames', () => {
    describe('when not passing entity names', () => {
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
    describe('when passing entity names', () => {
      let result;

      before(() => {
        const option = new JDLBinaryOption({
          name: binaryOptions.Options.SERVICE,
          value: binaryOptions.Values.service.SERVICE_CLASS,
          excludedNames: new Set(['C']),
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
