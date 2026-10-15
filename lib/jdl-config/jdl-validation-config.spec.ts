import { describe, expect, it } from 'esmocha';

import { Validations, validationTypes } from '../jdl/core/built-in-options/index.ts';

import { buildJDLValidationConfig, getDefaultJDLValidationConfig } from './jdl-validation-config.ts';

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

  it('should keep the validations with a value of the commands, as the parser takes them', () => {
    expect(
      buildJDLValidationConfig({
        validations: {
          minlength: { description: 'Minimum length of a string', jdl: { value: 'integer' } },
          custom: { jdl: { value: 'regex' } },
          withoutValue: { description: 'A keyword' },
        },
      }),
    ).toEqual({
      configs: {
        minlength: { description: 'Minimum length of a string', jdl: { value: 'integer' } },
        custom: { jdl: { value: 'regex' } },
      },
    });
  });
});
