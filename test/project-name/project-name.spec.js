const path = require('path');
const expect = require('expect');

const { skipPrettierHelpers: helpers } = require('../utils/utils');
const { requiredConfig, defaultConfig } = require('../../generators/project-name/config');
const { GENERATOR_JHIPSTER } = require('../../generators/generator-constants');

const projectNameGeneratorPath = path.join(__dirname, '../../generators/project-name');

const testDefaultConfig = { ...requiredConfig, jhipsterVersion: '0.0.0' };

describe('JHipster project-name generator', () => {
  describe('with defaults option', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(projectNameGeneratorPath).withOptions({ defaults: true });
    });
    it('should write config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: testDefaultConfig });
    });
    it('should load default config into the generator', () => {
      expect(runResult.generator).toMatchObject({ ...defaultConfig, ...testDefaultConfig });
    });
  });
  describe('with skipPrompts option', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(projectNameGeneratorPath).withOptions({ skipPrompts: true });
    });
    it('should write config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: testDefaultConfig });
    });
    it('should load default config into the generator', () => {
      expect(runResult.generator).toMatchObject({ ...defaultConfig, ...testDefaultConfig });
    });
  });
  describe('with custom prompt values', () => {
    let runResult;
    const promptValues = {
      projectName: 'Beautiful Project',
      baseName: 'BeautifulProject',
    };
    describe('and default options', () => {
      before(async () => {
        runResult = await helpers.run(projectNameGeneratorPath).withPrompts(promptValues);
      });
      it('should write custom config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: promptValues });
      });
    });
    describe('and skipPrompts option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(projectNameGeneratorPath)
          .withOptions({ skipPrompts: true, baseName: 'jhipster' })
          .withPrompts(promptValues);
      });
      it('should write default values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: testDefaultConfig });
      });
    });
    describe('and existing config', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(projectNameGeneratorPath)
          .withOptions({ localConfig: { baseName: 'existing' } })
          .withPrompts(promptValues);
      });
      it('should not write custom prompt values', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: testDefaultConfig });
      });
    });
    describe('and askAnswered option on an exiting project', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .run(projectNameGeneratorPath)
          .withOptions({ askAnswered: true, localConfig: { baseName: 'existing' } })
          .withPrompts(promptValues);
      });
      it('should write custom prompt values', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: promptValues });
      });
    });
  });
});
