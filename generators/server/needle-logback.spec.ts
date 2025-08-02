import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import { GENERATOR_SERVER } from '../generator-list.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';

const filePath = `${SERVER_MAIN_RES_DIR}logback-spring.xml`;

const addNeedlesTask = asPostWritingTask(function ({ source }) {
  source.addMainLog?.({ name: 'org.test.logTest', level: 'OFF' });
});

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
