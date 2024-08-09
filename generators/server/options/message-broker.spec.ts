import { before, describe, expect, it } from 'esmocha';
import { ImportState, createImporterFromContent } from '../../../jdl/jdl-importer.js';
import optionDefinition from './message-broker.js';
import { MESSAGE_BROKER } from './index.js';

describe('generators - server - jdl - messageBroker', () => {
  optionDefinition.knownChoices!.forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${MESSAGE_BROKER} ${optionValue} } }`);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[MESSAGE_BROKER]).toBe(optionValue);
      });
    });
  });
});
