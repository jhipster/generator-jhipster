import { before, describe, expect, it } from 'esmocha';
import { ImportState, createImporterFromContent } from '../../../jdl/jdl-importer.js';
import optionDefinition from './database-migration.js';
import { DATABASE_MIGRATION as optionName } from './index.js';

describe(`generators - server - jdl - ${optionName}`, () => {
  optionDefinition.knownChoices!.forEach(optionValue => {
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
