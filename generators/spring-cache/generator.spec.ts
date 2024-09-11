import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { fromMatrix, defaultHelpers as helpers, result } from '../../lib/testing/index.js';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';

import { GENERATOR_SPRING_CACHE } from '../generator-list.js';
import { buildToolTypes, cacheTypes } from '../../lib/jhipster/index.js';
import Generator from './index.js';

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
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  Object.entries(samples).forEach(([name, sample]) => {
    describe(name, () => {
      before(async () => {
        await helpers.runJHipster(GENERATOR_SPRING_CACHE).withJHipsterConfig(sample).withMockedSource();
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
