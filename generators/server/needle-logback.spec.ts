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

import { before, describe, it } from 'esmocha';

import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.ts';

import { defaultHelpers as helpers, result as runResult } from '#testing';

const filePath = `${SERVER_MAIN_RES_DIR}logback-spring.xml`;

const addNeedlesTask = asPostWritingTask(function ({ source }) {
  source.addMainLog?.({ name: 'org.test.logTest', level: 'OFF' });
});

const GENERATOR_SERVER = 'server';

describe('generators - server - needle - logback', () => {
  before(async () => {
    await helpers
      .runJHipster(GENERATOR_SERVER)
      .withOptions({
        blueprint: ['myblueprint'],
      })
      .withJHipsterConfig({
        clientFramework: 'no',
      })
      .withTask('postWriting', addNeedlesTask);
  });

  it('Assert log is added to logback-spring.xml', () => {
    runResult.assertFileContent(filePath, '<logger name="org.test.logTest" level="OFF"/>');
  });
});
