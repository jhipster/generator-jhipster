import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildToolTypes, cacheTypes } from '../../lib/jhipster/index.ts';
import { defaultHelpers as helpers, fromMatrix, result } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const { EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = cacheTypes;
const { MAVEN, GRADLE } = buildToolTypes;

const samples = fromMatrix({
  cacheProvider: [EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS],
  buildTool: [MAVEN, GRADLE],
});

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  Object.entries(samples).forEach(([name, sample]) => {
    describe(name, () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig(sample).withMockedSource();
      });

      it('should match files snapshot', () => {
        expect(result.getStateSnapshot()).toMatchSnapshot();
      });

      it('should match source calls', () => {
        expect(result.sourceCallsArg).toMatchSnapshot();
      });
    });
  });
});
