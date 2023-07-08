import { dryRunHelpers as helpers, result as runResult } from '../../test/support/index.mjs';
import BaseApplicationGenerator from '../base-application/index.mjs';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { GENERATOR_SERVER } from '../generator-list.mjs';

const filePath = `${SERVER_MAIN_RES_DIR}logback-spring.xml`;

class mockBlueprintSubGen extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addlogStep({ source }) {
        source.addLogbackMainLog?.({ name: 'org.test.logTest', level: 'OFF' });
      },
    });
  }
}

describe('generators - server - needle - logback', () => {
  before(async () => {
    await helpers
      .runJHipster(GENERATOR_SERVER)
      .withJHipsterConfig({
        blueprint: 'myblueprint',
        clientFramework: 'no',
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:server' }]]);
  });

  it('Assert log is added to logback-spring.xml', () => {
    runResult.assertFileContent(filePath, '<logger name="org.test.logTest" level="OFF"/>');
  });
});
