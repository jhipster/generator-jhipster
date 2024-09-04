import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../jdl/jdl-importer.js';
import definition from '../../app/jdl/index.js';
import optionDefinition from './database-migration.js';
import { DATABASE_MIGRATION as optionName } from './index.js';

describe(`generators - server - jdl - ${optionName}`, () => {
  optionDefinition.knownChoices!.forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${optionName} ${optionValue} } }`, definition);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toBe(optionValue);
      });
    });
  });
});
