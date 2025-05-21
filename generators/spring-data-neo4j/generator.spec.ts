import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import {
  buildSamplesFromMatrix,
  buildServerMatrix,
  entitiesSimple as entities,
  defaultHelpers as helpers,
  runResult,
} from '../../lib/testing/index.js';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import Generator from '../server/index.js';

import { databaseTypes } from '../../lib/jhipster/index.js';
import {
  filterBasicServerGenerators,
  shouldComposeWithLiquibase,
  shouldComposeWithSpringCloudStream,
} from '../server/__test-support/index.js';
import { GENERATOR_SERVER } from '../generator-list.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

const { NEO4J: databaseType } = databaseTypes;
const commonConfig = { databaseType, baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };

const testSamples = buildSamplesFromMatrix(buildServerMatrix(), { commonConfig });

describe(`generator - ${databaseType}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js')).GENERATOR_SPRING_DATA_NEO4J).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  it('samples matrix should match snapshot', () => {
    expect(testSamples).toMatchSnapshot();
  });

  Object.entries(testSamples).forEach(([name, sampleConfig]) => {
    const { authenticationType } = sampleConfig;

    describe(name, () => {
      if (
        sampleConfig.websocket &&
        (sampleConfig.reactive || sampleConfig.applicationType === 'microservice' || sampleConfig.applicationType === 'gateway')
      ) {
        it('should throw an error', async () => {
          await expect(helpers.runJHipster(GENERATOR_SERVER).withJHipsterConfig(sampleConfig)).rejects.toThrow();
        });

        return;
      }

      before(async () => {
        await helpers
          .runJHipster('server')
          // @ts-ignore
          .withJHipsterConfig(sampleConfig, entities)
          .withMockedSource({ except: ['addTestSpringFactory'] })
          .withMockedJHipsterGenerators({
            except: ['jhipster:spring-data-neo4j'],
            filter: filterBasicServerGenerators,
          });
      });

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('contains correct authenticationType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"authenticationType": "${authenticationType}"`));
      });
      it('contains correct databaseType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"databaseType": "${databaseType}"`));
      });
      shouldComposeWithSpringCloudStream(sampleConfig, () => runResult);
      shouldComposeWithLiquibase(false, () => runResult);
    });
  });
});
