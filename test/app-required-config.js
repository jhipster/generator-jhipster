const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { requiredDefaultConfig, defaultConfig } = require('../generators/generator-defaults');
const EnvironmentBuilder = require('../cli/environment-builder');

describe('JHipster generator with required configuration', () => {
  before(() => {
    return helpers
      .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
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
      'generator-jhipster': { ...defaultConfig, languages: [defaultConfig.nativeLanguage] },
    });
  });
});
