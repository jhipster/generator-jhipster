import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../lib/jdl/jdl-importer.js';
import { createImporterFromContent } from '../../lib/jdl/jdl-importer.js';
import definition from '../app/jdl/index.js';

describe(`generators - server - jdl - incrementalChangelog`, () => {
  [true, false].forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { incrementalChangelog ${optionValue} } }`, undefined, definition);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config.incrementalChangelog).toBe(optionValue);
      });
    });
  });
});
