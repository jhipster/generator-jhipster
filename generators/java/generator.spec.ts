import { before, describe, expect, it } from 'esmocha';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { snakeCase } from 'lodash-es';

import { defaultHelpers as helpers, result } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';

import Generator from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.ts'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
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

    describe('addItemsToJavaEnumFile', () => {
      before(async () => {
        const javaFile = 'src/main/java/com/exampla/Test.java';
        const fileContent = `package com.example;
public enum Test {
    ;
    // jhipster-needle-add-item-to-enum - JHipster will add new enum values here
}
`;

        await helpers
          .runJHipster(generator)
          .withFiles({ [javaFile]: fileContent })
          .withJHipsterConfig()
          .withTask(
            'postWriting',
            asPostWritingTask(function ({ source }) {
              source.addItemsToJavaEnumFile!(javaFile, {
                enumValues: ['VALUE', 'VALUE_WITH_PARAMS(1, "value")'],
              });
            }),
          );
      });

      it('should match file content', () => {
        expect(result.getSnapshot('**/Test.java')).toMatchSnapshot();
      });
    });

    describe('addItemsToJavaEnumFile with existing value to a inner enum', () => {
      before(async () => {
        const javaFile = 'src/main/java/com/exampla/Test.java';
        const fileContent = `package com.example;
public class Test {
    public static enum TestEnum {
        EXISTING_VALUE;
        // jhipster-needle-add-item-to-enum - JHipster will add new enum values here
    }
}
`;

        await helpers
          .runJHipster(generator)
          .withFiles({ [javaFile]: fileContent })
          .withJHipsterConfig()
          .withTask(
            'postWriting',
            asPostWritingTask(function ({ source }) {
              source.addItemsToJavaEnumFile!(javaFile, {
                enumName: 'TestEnum',
                enumValues: ['VALUE', 'VALUE_WITH_PARAMS(1, "value")'],
              });
            }),
          );
      });

      it('should match file content', () => {
        expect(result.getSnapshot('**/Test.java')).toMatchSnapshot();
      });
    });
  });
});
