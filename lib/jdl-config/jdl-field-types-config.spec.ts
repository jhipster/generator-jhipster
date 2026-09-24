import { describe, expect, it } from 'esmocha';

import { fieldTypesValues } from '../jhipster/field-types.ts';

import { getDefaultJDLFieldTypesConfig } from './jdl-field-types-config.ts';

describe('jdl field types definitions', () => {
  it('should declare every field type of the generators', () => {
    expect(Object.keys(getDefaultJDLFieldTypesConfig().types).sort()).toEqual([...new Set(Object.values(fieldTypesValues))].sort());
  });
});
