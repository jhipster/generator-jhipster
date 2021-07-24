const expect = require('expect');
const path = require('path');
const sinon = require('sinon');

const { GENERATOR_JHIPSTER } = require('../../generators/generator-constants');
const { skipPrettierHelpers: helpers } = require('../utils/utils');

const testOptions = data => {
  const { generatorPath, customOptions, contextBuilder = () => helpers.create(generatorPath) } = data;
  let runResult;
  before(async () => {
    runResult = await contextBuilder()
      .withOptions({ ...customOptions })
      .run();
  });
  it('should write options to .yo-rc.json', () => {
    runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customOptions });
  });
};

const basicTests = data => {
  const { generatorPath, customPrompts, requiredConfig, defaultConfig, contextBuilder = () => helpers.create(generatorPath) } = data;
  describe('with default options', () => {
    let runResult;
    before(async () => {
      runResult = await contextBuilder().run();
    });
    it('should write default config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
    });
    it('should load default config into the generator', () => {
      expect(runResult.generator).toMatchObject(defaultConfig);
    });
  });
  describe('with defaults option', () => {
    let runResult;
    before(async () => {
      runResult = await contextBuilder().withOptions({ defaults: true }).run();
    });
    it('should write default config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
    });
    it('should load default config into the generator', () => {
      expect(runResult.generator).toMatchObject(requiredConfig);
    });
  });
  describe('with configure option', () => {
    let runResult;
    before(async () => {
      runResult = await contextBuilder().withOptions({ configure: true }).run();
    });
    it('should write .yo-rc.json only', () => {
      expect(runResult.getStateSnapshot()).toEqual({
        '.yo-rc.json': {
          stateCleared: 'modified',
        },
      });
    });
  });
  describe('with custom prompt values', () => {
    let runResult;
    describe('and default options', () => {
      before(async () => {
        runResult = await contextBuilder().withPrompts(customPrompts).run();
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
      });
      it('should load default config with prompt values into the generator', () => {
        expect(runResult.generator).toMatchObject({ ...defaultConfig, ...customPrompts });
      });
    });
    describe('and defaults option', () => {
      before(async () => {
        runResult = await contextBuilder().withOptions({ defaults: true }).withPrompts(customPrompts).run();
      });
      it('should not show prompts and write default config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
      });
      it('should load default config into the generator', () => {
        expect(runResult.generator).toMatchObject({ ...defaultConfig, ...requiredConfig });
      });
    });
    describe('and skipPrompts option', () => {
      let runResult;
      before(async () => {
        runResult = await contextBuilder().withOptions({ skipPrompts: true }).withPrompts(customPrompts).run();
      });
      it('should not show prompts and write required config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
      });
      it('should load default config and required config into the generator', () => {
        expect(runResult.generator).toMatchObject({ ...defaultConfig, ...requiredConfig });
      });
    });
    describe('and existing config', () => {
      let runResult;
      const existing = { baseName: 'existing' };
      before(async () => {
        runResult = await contextBuilder().withOptions({ localConfig: existing }).withPrompts(customPrompts).run();
      });
      it('should not show prompts and write required config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...requiredConfig, ...existing } });
      });
      it('should load default config and required config into the generator', () => {
        expect(runResult.generator).toMatchObject({ ...defaultConfig, ...requiredConfig, ...existing });
      });
    });
    describe('and askAnswered option on an existing project', () => {
      let runResult;
      before(async () => {
        runResult = await contextBuilder()
          .withOptions({ askAnswered: true, localConfig: { baseName: 'existing' } })
          .withPrompts(customPrompts)
          .run();
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
      });
      it('should load default config and prompt values into the generator', () => {
        expect(runResult.generator).toMatchObject({ ...defaultConfig, ...customPrompts });
      });
    });
    describe('and add option on an existing project', () => {
      let runResult;
      const existingConfig = { baseName: 'existing' };
      before(async () => {
        runResult = await contextBuilder().withOptions({ add: true, localConfig: existingConfig }).withPrompts(customPrompts).run();
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...customPrompts, ...existingConfig } });
      });
      it('should load default config and prompt values into the generator', () => {
        expect(runResult.generator).toMatchObject({ ...defaultConfig, ...customPrompts, ...existingConfig });
      });
    });
  });
};

const testBlueprintSupport = generatorName => {
  const priorities = [
    'initializing',
    'prompting',
    'configuring',
    'composing',
    'loading',
    'preparing',
    'preparingFields',
    'preparingRelationships',
    'postWriting',
    'preConflicts',
    'writing',
    'install',
    'end',
  ];
  const addSpies = generator => {
    const prioritiesSpy = sinon.spy();
    let prioritiesCount = 0;
    priorities.forEach(priority => {
      if (Object.getOwnPropertyDescriptor(Object.getPrototypeOf(generator), priority)) {
        prioritiesCount++;
      }
      generator[`_${priority}`] = prioritiesSpy;
    });
    return [prioritiesSpy, prioritiesCount];
  };
  describe('with blueprint', () => {
    let result;
    let spy;
    before(async () => {
      result = await helpers
        .run(path.join(__dirname, `../../generators/${generatorName}/index.cjs`))
        .withMockedGenerators([`jhipster-foo:${generatorName}`])
        .withOptions({ blueprint: 'foo', skipChecks: true })
        .on('ready', generator => {
          spy = addSpies(generator);
        });
    });
    it('should compose with blueprints', () => {
      expect(result.mockedGenerators[`jhipster-foo:${generatorName}`].callCount).toBe(1);
    });
    it('should not call any priority', () => {
      expect(spy[0].callCount).toBe(0);
    });
  });
  describe('with sbs blueprint', () => {
    let result;
    let spy;
    before(async () => {
      const context = helpers
        .run(path.join(__dirname, `../../generators/${generatorName}/index.cjs`))
        .withMockedGenerators([`jhipster-foo-sbs:${generatorName}`])
        .withOptions({ blueprint: 'foo-sbs', skipChecks: true })
        .on('ready', generator => {
          spy = addSpies(generator);
        });

      // simulate a sbs blueprint
      Object.defineProperty(context.mockedGenerators[`jhipster-foo-sbs:${generatorName}`].prototype, 'sbsBlueprint', {
        get() {
          return true;
        },
        enumerable: true,
        configurable: true,
      });

      result = await context;
    });
    it('should compose with blueprints', () => {
      expect(result.mockedGenerators[`jhipster-foo-sbs:${generatorName}`].callCount).toBe(1);
    });
    it('should call every priority', () => {
      expect(spy[0].callCount).toBe(spy[1]);
    });
  });
};

module.exports = {
  basicTests,
  testBlueprintSupport,
  testOptions,
};
