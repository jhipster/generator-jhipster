import { jestExpect as expect } from 'mocha-expect-snapshot';
import lodash from 'lodash';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';

import { testBlueprintSupport } from '../../test/support/tests.mjs';
import Generator from './index.mjs';
import { defaultHelpers as helpers, result } from '../../test/support/helpers.mjs';

import { GENERATOR_SPRING_WEBSOCKET } from '../generator-list.mjs';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.mjs'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true, env: { cwd: 'foo', sharedOptions: { sharedData: {} } } }, { unique: 'bar' });
    expect(instance.features.unique).toBe('bar');
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_SPRING_WEBSOCKET).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });
});
