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

import { before, describe, expect, it } from 'esmocha';
import { convertEnums } from './enum-converter.js';

describe('jdl - EnumConverter', () => {
  describe('convertEnums', () => {
    describe('when not passing enumerations', () => {
      it('should fail', () => {
        // @ts-expect-error empty parameter not authorized
        expect(() => convertEnums()).toThrow(/^Enumerations have to be passed so as to be converted.$/);
      });
    });
    describe('when passing enumerations', () => {
      let convertedEnums;

      before(() => {
        convertedEnums = convertEnums([
          {
            name: 'Country',
            values: [
              { key: 'FRANCE', value: 'FRANCE' },
              { key: 'ITALY', value: 'ITALY' },
            ],
            documentation: 'A comment',
          },
        ]);
      });

      it('should convert them', () => {
        expect(convertedEnums).toMatchInlineSnapshot(`
[
  JDLEnum {
    "comment": "A comment",
    "name": "Country",
    "values": Map {
      "FRANCE" => JDLEnumValue {
        "comment": undefined,
        "name": "FRANCE",
        "value": "FRANCE",
      },
      "ITALY" => JDLEnumValue {
        "comment": undefined,
        "name": "ITALY",
        "value": "ITALY",
      },
    },
  },
]
`);
      });
    });
  });
});
