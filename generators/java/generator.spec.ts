/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';

import Generator from './index.ts';

import { defaultHelpers as helpers, result } from '#testing';

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

    describe('addItemsToJavaEnumFile with existing value to an inner enum', () => {
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
