import { expect } from 'esmocha';
import { createImporterFromContent, ImportState } from '../../../jdl/jdl-importer.js';
import { DATABASE_MIGRATION as optionName } from './index.mjs';
import optionDefinition from './database-migration.mjs';

describe(`generators - server - jdl - ${optionName}`, () => {
  optionDefinition.knownChoices.forEach(optionValue => {
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
