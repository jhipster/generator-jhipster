const assert = require('assert');
const helpers = require('yeoman-test');
const { appDefaultConfig } = require('../../generators/generator-defaults');
const { CYPRESS } = require('../../jdl/jhipster/test-framework-types');

const mockedComposedGenerators = ['jhipster:common', 'jhipster:client', 'jhipster:languages', 'jhipster:cypress'];

describe('jhipster:client composing', () => {
  describe('with translation disabled', () => {
    let runResult;
    const options = { enableTranslation: false };
    before(() => {
      return helpers
        .create(require.resolve('../../generators/client'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .withMockedGenerators(mockedComposedGenerators)
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should compose with jhipster:common', () => {
      assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
    });
    it('should not compose with jhipster:languages', () => {
      assert.equal(runResult.mockedGenerators['jhipster:languages'].callCount, 0);
    });
  });

  describe('with translation enabled', () => {
    let runResult;
    const options = { enableTranslation: true };
    before(() => {
      return helpers
        .create(require.resolve('../../generators/client'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .withMockedGenerators(mockedComposedGenerators)
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should compose with jhipster:common', () => {
      assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
    });
    it('should compose with jhipster:languages', () => {
      assert.equal(runResult.mockedGenerators['jhipster:languages'].callCount, 1);
    });
  });

  describe('without cypress', () => {
    let runResult;
    const options = { testFrameworks: [] };
    before(() => {
      return helpers
        .create(require.resolve('../../generators/client'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .withMockedGenerators(mockedComposedGenerators)
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should compose with jhipster:common', () => {
      assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
    });
    it('should compose with jhipster:languages', () => {
      assert(runResult.mockedGenerators['jhipster:languages'].calledOnce);
    });
    it('should not compose with jhipster:cypress', () => {
      assert.equal(runResult.mockedGenerators['jhipster:cypress'].callCount, 0);
    });
  });

  describe('with cypress', () => {
    let runResult;
    const options = { testFrameworks: [CYPRESS] };
    before(() => {
      return helpers
        .create(require.resolve('../../generators/client'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .withMockedGenerators(mockedComposedGenerators)
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should compose with jhipster:common', () => {
      assert(runResult.mockedGenerators['jhipster:common'].calledOnce);
    });
    it('should compose with jhipster:languages', () => {
      assert(runResult.mockedGenerators['jhipster:languages'].calledOnce);
    });
    it('should compose with jhipster:cypress', () => {
      assert(runResult.mockedGenerators['jhipster:cypress'].calledOnce);
    });
  });
});
