import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../lib/jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../lib/jdl/jdl-importer.js';

describe(`generators - server - jdl - syncUserWithIdp`, () => {
  [true, false].forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { syncUserWithIdp ${optionValue} } }`, undefined);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config.syncUserWithIdp).toBe(optionValue);
      });
    });
  });
});
