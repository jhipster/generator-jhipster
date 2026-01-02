import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.ts';

import Generator from './index.ts';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('composing', () => {
    describe('messageBroker option', () => {
      for (const messageBroker of ['no', 'kafka', 'pulsar'] as const) {
        describe(messageBroker, () => {
          before(async () => {
            await helpers
              .runJHipster(generator)
              .withJHipsterConfig({
                messageBroker,
              })
              .withSkipWritingPriorities()
              .withMockedSource({ except: ['addTestSpringFactory'] })
              .withMockedJHipsterGenerators();
          });

          it('should match composed generators snapshot', () => {
            expect(result.composedMockedGenerators).toMatchSnapshot();
          });
        });
      }
    });
  });
});
