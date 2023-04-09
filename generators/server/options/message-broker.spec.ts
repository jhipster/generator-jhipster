import { jestExpect as expect } from 'mocha-expect-snapshot';
import { createImporterFromContent, ImportState } from '../../../jdl/jdl-importer.js';
import { MESSAGE_BROKER } from './index.mjs';
import { MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_PULSAR, MESSAGE_BROKER_NO } from './message-broker.mjs';

describe('generators - server - jdl - messageBroker', () => {
  [MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_PULSAR, MESSAGE_BROKER_NO].forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${MESSAGE_BROKER} ${optionValue} } }`, {
          skipFileGeneration: true,
        });
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[MESSAGE_BROKER]).toBe(optionValue);
      });
    });
  });
  describe('with invalid value', () => {
    it('should set expected value', () => {
      const importer = createImporterFromContent(`application { config { ${MESSAGE_BROKER} foo } }`, { skipFileGeneration: true });
      expect(() => importer.import()).toThrow(/Unknown value 'foo' for option 'messageBroker'./);
    });
  });
});
