import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../lib/jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../lib/jdl/jdl-importer.js';
import command from '../command.js';

for (const optionName of ['databaseMigration']) {
  describe(`generators - server - jdl - ${optionName}`, () => {
    const choices: any[] = command.configs[optionName].choices;
    choices.forEach(optionValue => {
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
}
