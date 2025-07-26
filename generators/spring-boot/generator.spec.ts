import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { checkEnforcements, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/index.js';

import { filterBasicServerGenerators } from '../server/__test-support/index.js';
import { asPostWritingTask } from '../base-application/support/task-type-inference.js';
import { PRIORITY_NAMES } from '../base-application/priorities.js';
import Generator from './generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  checkEnforcements({}, generator);

  describe('addTestSpringFactory', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig()
        .withMockedJHipsterGenerators()
        .withSkipWritingPriorities()
        .withTask(
          'postWriting',
          asPostWritingTask(function ({ source }) {
            source.addTestSpringFactory!({ key: 'key', value: 'first.value' });
            source.addTestSpringFactory!({ key: 'key', value: 'second.value' });
            // Existring value should not be added again
            source.addTestSpringFactory!({ key: 'key', value: 'second.value' });
          }),
        );
    });

    it('should add a test spring factory', () => {
      expect(runResult.getSnapshot('**/spring.factories')).toMatchSnapshot();
    });
  });
  describe('with jwt', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ authenticationType: 'jwt' })
        .withMockedSource({ except: ['addTestSpringFactory'] })
        .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with oauth2', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withJHipsterConfig({ authenticationType: 'oauth2' })
        .withMockedSource({ except: ['addTestSpringFactory'] })
        .withMockedJHipsterGenerators({ filter: filterBasicServerGenerators });
    });

    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('source api', () => {
    describe('editJavaFile with springBeans', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig({ skipClient: true })
          .withTask(
            'postWriting',
            asPostWritingTask(function ({ source }) {
              source.addApplicationPropertiesClass!({
                propertyType: 'SomeNestedProperties',
                classStructure: { enabled: ['Boolean', 'true'], tag: 'String' },
              });
            }),
          );
      });

      it('should match file content snapshot', () => {
        expect(runResult.getSnapshot('**/ApplicationProperties.java')).toMatchSnapshot();
      });
    });

    describe('addApplicationYamlDocument', () => {
      const content = `spring:\n  application:\n    name: myApp`;

      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig({ skipClient: true })
          .withTask(
            PRIORITY_NAMES.POST_WRITING,
            asPostWritingTask(function ({ source }) {
              source.addApplicationYamlDocument!(content);
            }),
          );
      });

      it('should inject content', () => {
        runResult.assertFileContent('src/main/resources/config/application.yml', `---\n${content}`);
      });
    });
  });
});
