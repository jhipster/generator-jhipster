const { dryRunHelpers: helpers } = require('../utils/utils');
const GeneratorBase = require('../../generators/generator-base');

const MockedGenerator = class extends GeneratorBase {
  get install() {
    return {
      writeInstallFile() {
        this.writeDestination('installPriority.txt', 'success');
      },
    };
  }

  get end() {
    return {
      writeEndFile() {
        this.writeDestination('endPriority.txt', 'success');
      },
    };
  }
};

describe('Bootstrap generator', () => {
  context('Default configuration with', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create('mocked-generator')
        .withGenerators([[MockedGenerator, 'mocked-generator']])
        .withOptions({ defaults: true })
        .run();
    });
    it('should generate files from every priority', () => {
      runResult.assertFileContent('installPriority.txt', 'success');
      runResult.assertFileContent('endPriority.txt', 'success');
    });
  });
});
