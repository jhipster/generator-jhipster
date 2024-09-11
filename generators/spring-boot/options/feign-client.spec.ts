import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../lib/jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../lib/jdl/jdl-importer.js';

const optionName = 'feignClient';

describe(`generators - server - jdl - ${optionName}`, () => {
  [true, false].forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${optionName} ${optionValue} } }`, undefined);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toBe(optionValue);
      });
    });
  });
});
