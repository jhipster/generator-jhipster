import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../lib/jdl/core/jdl-importer.js';
import { createImporterFromContent } from '../../../lib/jdl/core/jdl-importer.js';
import definition from '../../app/jdl/index.js';
import { SYNC_USER_WITH_IDP as optionName } from './sync-user-with-idp.js';

describe(`generators - server - jdl - ${optionName}`, () => {
  [true, false].forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${optionName} ${optionValue} } }`, undefined, definition);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toBe(optionValue);
      });
    });
  });
});
