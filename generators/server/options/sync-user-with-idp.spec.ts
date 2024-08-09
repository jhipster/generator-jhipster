import { before, describe, expect, it } from 'esmocha';
import { ImportState, createImporterFromContent } from '../../../jdl/jdl-importer.js';
import { SYNC_USER_WITH_IDP as optionName } from './sync-user-with-idp.js';

describe(`generators - server - jdl - ${optionName}`, () => {
  [true, false].forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${optionName} ${optionValue} } }`);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toBe(optionValue);
      });
    });
  });
});
