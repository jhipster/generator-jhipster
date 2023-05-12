import { expect } from 'esmocha';
import { createImporterFromContent, ImportState } from '../../../jdl/jdl-importer.js';
import { DATABASE_MIGRATION as optionName } from './index.mjs';
import optionDefinition from './database-migration.mjs';

describe(`generators - server - jdl - ${optionName}`, () => {
  optionDefinition.knownChoices.forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${optionName} ${optionValue} } }`, {
          skipFileGeneration: true,
        });
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toBe(optionValue);
      });
    });
  });
  describe('with invalid value', () => {
    it('should set expected value', () => {
      const importer = createImporterFromContent(`application { config { ${optionName} foo } }`, { skipFileGeneration: true });
      expect(() => importer.import()).toThrow(`Unknown value 'foo' for option '${optionName}'.`);
    });
  });
});
