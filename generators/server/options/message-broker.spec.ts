import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../jdl/jdl-importer.js';
import definition from '../../app/jdl/index.js';
import optionDefinition from './message-broker.js';
import { MESSAGE_BROKER } from './index.js';

describe('generators - server - jdl - messageBroker', () => {
  optionDefinition.knownChoices!.forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${MESSAGE_BROKER} ${optionValue} } }`, undefined, definition);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[MESSAGE_BROKER]).toBe(optionValue);
      });
    });
  });
});
