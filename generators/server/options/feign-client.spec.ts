import { expect } from 'esmocha';
import { createImporterFromContent, ImportState } from '../../../jdl/jdl-importer.js';
import { FEIGN_CLIENT as optionName } from './index.mjs';

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
