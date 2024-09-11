import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../lib/jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../lib/jdl/jdl-importer.js';
import command from '../command.js';

describe('generators - server - jdl - messageBroker', () => {
  command.configs.messageBroker.choices!.forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { messageBroker ${optionValue} } }`);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config.messageBroker).toBe(optionValue);
      });
    });
  });
});
