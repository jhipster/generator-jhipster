import { describe, expect, it } from 'esmocha';

import { fieldTypesValues } from '../jhipster/field-types.ts';

import { getDefaultJDLFieldTypesConfig } from './jdl-field-types-config.ts';

describe('jdl field types definitions', () => {
  it('should declare every field type of the generators, and the deprecated ones they migrate', () => {
    const { types } = getDefaultJDLFieldTypesConfig();
    expect(Object.keys(types).sort()).toEqual([...new Set([...Object.values(fieldTypesValues), 'Date', 'DateTime'])].sort());
    expect(Object.keys(types).filter(type => types[type].deprecated)).toEqual(['Date', 'DateTime']);
  });
});
