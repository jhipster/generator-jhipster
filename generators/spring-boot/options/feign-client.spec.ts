import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../lib/jdl/core/jdl-importer.js';
import { createImporterFromContent } from '../../../lib/jdl/core/jdl-importer.js';
import definition from '../../app/jdl/index.js';

const optionName = 'feignClient';

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
