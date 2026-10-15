import { describe, expect, it } from 'esmocha';

import { CommonDBValidations, fieldTypesValues } from '../jhipster/field-types.ts';

import { buildJDLFieldTypesConfig, getDefaultJDLFieldTypesConfig } from './jdl-field-types-config.ts';

describe('jdl field types definitions', () => {
  it('should declare every field type of the generators, and the deprecated ones they migrate', () => {
    const { types } = getDefaultJDLFieldTypesConfig();
    expect(Object.keys(types).sort()).toEqual([...new Set([...Object.values(fieldTypesValues), 'Date', 'DateTime'])].sort());
    expect(Object.keys(types).filter(type => types[type].deprecated)).toEqual(['Date', 'DateTime']);
  });

  it('should give the validations of each type the code knows', () => {
    const { types, enum: enumType } = getDefaultJDLFieldTypesConfig();
    const { Enum: enumValidations, ...known } = CommonDBValidations;
    for (const [type, validations] of Object.entries(known)) {
      expect({ type, validations: types[type]?.validations.toSorted() }).toEqual({ type, validations: [...validations].toSorted() });
    }
    expect(enumType.validations.toSorted()).toEqual([...enumValidations].toSorted());
  });

  it('should take the types of commands, the enum type being the one of an enum field', () => {
    expect(
      buildJDLFieldTypesConfig({
        types: {
          String: { description: 'Text', validations: ['required', 'minlength'] },
          Enum: { validations: ['required'] },
          Old: { validations: [], deprecated: 'use String' },
        },
      }),
    ).toEqual({
      types: { String: { validations: ['required', 'minlength'] }, Old: { validations: [], deprecated: 'use String' } },
      enum: { validations: ['required'] },
    });
  });
});
