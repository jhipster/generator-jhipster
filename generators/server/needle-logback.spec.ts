import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.js';
import BaseApplicationGenerator from '../base-application/index.js';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import { GENERATOR_SERVER } from '../generator-list.js';

const filePath = `${SERVER_MAIN_RES_DIR}logback-spring.xml`;

class mockBlueprintSubGen extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addlogStep({ source }) {
        source.addMainLog?.({ name: 'org.test.logTest', level: 'OFF' });
      },
    });
  }
}

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
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:server' }]]);
  });

  it('Assert log is added to logback-spring.xml', () => {
    runResult.assertFileContent(filePath, '<logger name="org.test.logTest" level="OFF"/>');
  });
});
