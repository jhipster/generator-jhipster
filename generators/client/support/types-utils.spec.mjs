import { jestExpect as expect } from 'mocha-expect-snapshot';

import { fieldTypes } from '../../../jdl/jhipster/index.mjs';

import { getTypescriptType } from './types-utils.mjs';

const { CommonDBTypes } = fieldTypes;

describe('generator - client - support - type-utils', () => {
  describe('getTypescriptType', () => {
    describe('when called with sql DB name', () => {
      it('return SQL', () => {
        expect(Object.fromEntries(Object.values(CommonDBTypes).map(dbType => [dbType, getTypescriptType(dbType)]))).toMatchInlineSnapshot(`
{
  "AnyBlob": "string",
  "BigDecimal": "number",
  "Blob": "string",
  "Boolean": "boolean",
  "Double": "number",
  "Duration": "string",
  "Enum": "Enum",
  "Float": "number",
  "ImageBlob": "string",
  "Instant": "dayjs.Dayjs",
  "Integer": "number",
  "LocalDate": "dayjs.Dayjs",
  "Long": "number",
  "String": "string",
  "TextBlob": "string",
  "UUID": "string",
  "ZonedDateTime": "dayjs.Dayjs",
}
`);
      });
    });
  });
});
