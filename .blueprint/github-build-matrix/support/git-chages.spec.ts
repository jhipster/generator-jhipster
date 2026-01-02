import { expect } from 'esmocha';

import { lookupGenerators } from '../../../lib/utils/index.ts';

import { detectChanges } from './git-changes.ts';

describe('git-changes', () => {
  for (const generator of [
    ...lookupGenerators().filter(ns => !ns.includes('/generators/') || ns.includes('/spring-boot/generators/')),
    '.github/actions/sonar/any-file.txt',
  ]) {
    describe(generator, () => {
      it(`should match changes snapshot`, async () => {
        expect(detectChanges([generator])).toMatchSnapshot();
      });
    });
  }
});
