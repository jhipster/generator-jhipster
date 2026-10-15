import { describe, expect, it } from 'esmocha';

import { buildJDLRelationshipConfig, getDefaultJDLRelationshipConfig } from './jdl-relationship-config.ts';

describe('jdl relationship definitions', () => {
  it('should add no option of the generators to the ones of the language', () => {
    expect(getDefaultJDLRelationshipConfig()).toEqual({ configs: {} });
  });

  it('should name the option statements of the relationship options by their keyword', () => {
    expect(
      buildJDLRelationshipConfig({
        jpaDerivedIdentifier: { description: 'Derive the identifier', jdl: { type: 'unary' } },
        otherSide: { choices: ['left', 'right'], jdl: { type: 'binary', keyword: 'side' } },
        notInJdl: { description: 'Not written in a jdl' },
      }),
    ).toEqual({
      configs: {
        jpaDerivedIdentifier: { description: 'Derive the identifier', jdl: { type: 'unary' } },
        side: { choices: ['left', 'right'], jdl: { type: 'binary' } },
      },
    });
  });
});
