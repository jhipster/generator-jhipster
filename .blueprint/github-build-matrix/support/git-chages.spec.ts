import { expect } from 'esmocha';

import { lookupGenerators } from '../../../lib/utils/index.ts';

import { detectChanges } from './git-changes.ts';

describe('git-changes', () => {
  for (const generator of lookupGenerators({ firstLevelOnly: true })) {
    describe(generator, () => {
      it(`should match changes snapshot`, async () => {
        expect(detectChanges([generator])).toMatchSnapshot();
      });
    });
  }
});
