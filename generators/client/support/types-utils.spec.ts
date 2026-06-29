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

import { describe, expect, it } from 'esmocha';

import { fieldTypes } from '../../../lib/jhipster/index.ts';

import { getTypescriptType } from './types-utils.ts';

const { CommonDBTypes } = fieldTypes;

describe('generator - client - support - type-utils', () => {
  describe('getTypescriptType', () => {
    describe('when called with sql DB name', () => {
      it('return SQL', () => {
        expect(
          Object.fromEntries(
            Object.values(CommonDBTypes)
              .filter(dbType => dbType !== 'Enum')
              .map(dbType => [dbType, getTypescriptType(dbType)]),
          ),
        ).toMatchInlineSnapshot(`
{
  "AnyBlob": "string",
  "BigDecimal": "number",
  "Blob": "string",
  "Boolean": "boolean",
  "ByteBuffer": "string",
  "Double": "number",
  "Duration": "string",
  "Float": "number",
  "ImageBlob": "string",
  "Instant": "dayjs.Dayjs",
  "Integer": "number",
  "LocalDate": "dayjs.Dayjs",
  "LocalTime": "string",
  "Long": "number",
  "String": "string",
  "TextBlob": "string",
  "UUID": "string",
  "ZonedDateTime": "dayjs.Dayjs",
  "byte[]": "string",
}
`);
      });
    });
  });
});
