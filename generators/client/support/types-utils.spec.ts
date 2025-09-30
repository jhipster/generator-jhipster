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
