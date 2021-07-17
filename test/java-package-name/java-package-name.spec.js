const path = require('path');

const { basicTests, testBlueprintSupport } = require('../support');
const { requiredConfig, defaultConfig } = require('../../generators/java-package-name/config');

describe('JHipster java-package-name generator', () => {
  basicTests({
    requiredConfig,
    defaultConfig,
    customPrompts: {
      packageName: 'my.custom.package.name',
    },
    generatorPath: path.join(__dirname, '../../generators/java-package-name'),
  });
  describe('blueprint support', () => testBlueprintSupport('java-package-name'));
});
