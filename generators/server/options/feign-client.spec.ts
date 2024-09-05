import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../jdl/jdl-importer.js';
import definition from '../../app/jdl/index.js';
import { FEIGN_CLIENT as optionName } from './index.js';

describe(`generators - server - jdl - ${optionName}`, () => {
  [true, false].forEach(optionValue => {
    describe(`with ${optionValue} value`, () => {
      let state: ImportState;

      before(() => {
        const importer = createImporterFromContent(`application { config { ${optionName} ${optionValue} } }`, undefined, definition);
        state = importer.import();
      });

      it('should set expected value', () => {
        expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toBe(optionValue);
      });
    });
  });
});
