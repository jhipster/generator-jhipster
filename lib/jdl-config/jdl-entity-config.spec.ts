import { describe, expect, it } from 'esmocha';

import { binaryOptions, relationshipOptions, unaryOptions } from '../jdl/core/built-in-options/index.ts';

import { getDefaultJDLEntityConfig } from './jdl-entity-config.ts';
import { getDefaultJDLRelationshipConfig } from './jdl-relationship-config.ts';

// The lexer and the parser take the option statements from the definitions, the code refers to the options through the
// constants of the core tables: the two must agree.
describe('jdl entity definitions', () => {
  it('should declare the unary options of the core', () => {
    const declared = Object.entries(getDefaultJDLEntityConfig().configs)
      .filter(([_name, config]) => config.jdl.type === 'unary')
      .map(([name]) => name);
    expect(declared.sort()).toEqual(
      Object.values(unaryOptions)
        .filter(value => typeof value === 'string')
        .sort(),
    );
  });

  it('should declare the binary options of the core, with their values and defaults', () => {
    const declared = Object.entries(getDefaultJDLEntityConfig().configs).filter(([_name, config]) => config.jdl.type === 'binary');
    expect(declared.map(([name]) => name).sort()).toEqual(Object.values(binaryOptions.Options).sort());
    for (const [name, definition] of declared) {
      const values = (binaryOptions.Values as Record<string, Record<string, string>>)[name];
      expect({ name, values: values ? Object.values(values).sort() : undefined }).toEqual({ name, values: definition.choices?.toSorted() });
      expect({ name, default: (binaryOptions.DefaultValues as Record<string, string>)[name] }).toEqual({
        name,
        default: definition.default,
      });
    }
  });

  it('should declare the relationship options of the core', () => {
    expect(Object.keys(getDefaultJDLRelationshipConfig().configs).sort()).toEqual([relationshipOptions.BUILT_IN_ENTITY].sort());
  });
});
