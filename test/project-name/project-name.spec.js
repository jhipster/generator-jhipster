const path = require('path');

const { basicTests, testBlueprintSupport } = require('../support');
const { requiredConfig, defaultConfig, reproducibleConfigForTests } = require('../../generators/project-name/config');

describe('JHipster project-name generator', () => {
  basicTests({
    requiredConfig: { ...requiredConfig, ...reproducibleConfigForTests },
    defaultConfig: { ...defaultConfig, ...reproducibleConfigForTests },
    customPrompts: {
      projectName: 'Beautiful Project',
      baseName: 'BeautifulProject',
    },
    generatorPath: path.join(__dirname, '../../generators/project-name'),
  });
  describe('blueprint support', () => testBlueprintSupport('project-name'));
});
