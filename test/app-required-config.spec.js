const assert = require('yeoman-assert');
const { requiredDefaultConfig, defaultConfig } = require('../src/generators/generator-defaults');

const { skipPrettierHelpers } = require('./utils/utils');

describe('JHipster generator with required configuration', () => {
  before(async () => {
    await skipPrettierHelpers
      .create('jhipster:app')
      .withOptions({
        defaultLocalConfig: requiredDefaultConfig,
        baseName: 'jhipster',
        fromCli: true,
        skipInstall: true,
      })
      .run();
  });

  it('writes additional default config to .yo-rc.json', () => {
    assert.JSONFileContent('.yo-rc.json', {
      'generator-jhipster': { ...defaultConfig, skipClient: false, languages: [defaultConfig.nativeLanguage] },
    });
  });
});
