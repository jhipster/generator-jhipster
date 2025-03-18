import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, describe, expect, it } from 'esmocha';
import { snakeCase } from 'lodash-es';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { defaultHelpers as helpers, result } from '../../lib/testing/index.js';
import { asPostWritingTask } from '../base-application/support/task-type-inference.js';
import Generator from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
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

  describe('source api', () => {
    describe('editJavaFile with springBeans', () => {
      before(async () => {
        const javaFile = 'src/main/java/com/exampla/Test.java';
        const fileContent = `package com.example;
public class Test {
    public Test() {}
}
`;

        await helpers
          .runJHipster(generator)
          .withFiles({ [javaFile]: fileContent })
          .withJHipsterConfig()
          .withTask(
            'postWriting',
            asPostWritingTask(function ({ source }) {
              source.editJavaFile!(javaFile, {
                springBeans: [{ beanClass: 'BeanClass', beanName: 'beanName', package: 'com.example' }],
              });
            }),
          );
      });

      it('should match file content snapshot', () => {
        expect(result.getSnapshot('**/Test.java')).toMatchSnapshot();
      });
    });
  });
});
