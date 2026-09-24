import { describe, expect, it } from 'esmocha';

import { Validations, validationTypes } from '../jdl/core/built-in-options/index.ts';

import { getDefaultJDLValidationConfig } from './jdl-validation-config.ts';

// The parser takes the validations with a value from the definitions, the code refers to them through the constants of
// the core table: the two must agree.
describe('jdl validation definitions', () => {
  it('should declare the validations of the core that take a value', () => {
    const withValue = Object.values(validationTypes).filter(validation => Validations.needsValue(validation));
    expect(Object.keys(getDefaultJDLValidationConfig().configs).sort()).toEqual(withValue.sort());
  });

  it('should take a regular expression for the pattern validation only', () => {
    const regex = Object.entries(getDefaultJDLValidationConfig().configs)
      .filter(([_name, config]) => config.jdl.value === 'regex')
      .map(([name]) => name);
    expect(regex).toEqual([Validations.PATTERN]);
  });
});
