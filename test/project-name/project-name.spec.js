const path = require('path');

const { basicTests, testBlueprintSupport } = require('../support');
const { requiredConfig, defaultConfig, reproducibleConfig } = require('../../generators/project-name/config');

describe('JHipster project-name generator', () => {
  basicTests({
    requiredConfig: { ...requiredConfig, ...reproducibleConfig },
    defaultConfig: { ...defaultConfig, ...reproducibleConfig },
    customPrompts: {
      projectName: 'Beautiful Project',
      baseName: 'BeautifulProject',
    },
    generatorPath: path.join(__dirname, '../../generators/project-name'),
  });
  describe('blueprint support', () => testBlueprintSupport('project-name'));
});
