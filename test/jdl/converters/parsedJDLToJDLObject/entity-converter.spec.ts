/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import { jestExpect as expect } from 'mocha-expect-snapshot';
import { convertEntities } from '../../../../jdl/converters/parsed-jdl-to-jdl-object/entity-converter.js';

describe('EntityConverter', () => {
  describe('convertEntities', () => {
    context('when not passing entities', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertEntities()).toThrow(/^Entities have to be passed so as to be converted\.$/);
      });
    });
    context('when passing entities', () => {
      let convertedEntities;

      before(() => {
        convertedEntities = convertEntities(
          [
            {
              name: 'A',
              javadoc: '/** No comment */',
            },
            {
              name: 'B',
              tableName: 'b_table',
            },
          ],
          () => []
        );
      });

      it('should convert them', () => {
        expect(convertedEntities).toMatchInlineSnapshot(`
Array [
  JDLEntity {
    "comment": "/** No comment */",
    "fields": Object {},
    "name": "A",
    "tableName": "A",
  },
  JDLEntity {
    "comment": undefined,
    "fields": Object {},
    "name": "B",
    "tableName": "b_table",
  },
]
`);
      });
    });
  });
});
