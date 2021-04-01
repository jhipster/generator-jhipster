const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ClientGenerator = require('../../generators/client');
const constants = require('../../generators/generator-constants');

const { ANGULAR, VUE, REACT } = constants.SUPPORTED_CLIENT_FRAMEWORKS;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
const assetFrom = 'source';
const assetTo = 'target';

const mockBlueprintSubGen = class extends ClientGenerator {
  constructor(args, opts) {
    super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.configOptions = jhContext.configOptions || {};
  }

  get initializing() {
    return super._initializing();
  }

  get prompting() {
    return super._prompting();
  }

  get configuring() {
    return super._configuring();
  }

  get default() {
    return super._default();
  }

  get writing() {
    const phaseFromJHipster = super._writing();
    const customPhaseSteps = {
      webpackPhase() {
        this.copyExternalAssetsInWebpack(assetFrom, assetTo);
        this.addWebpackConfig('{devServer:{}}');
      },
    };
    return { ...phaseFromJHipster, ...customPhaseSteps };
  }
};

describe('needle API Webpack: JHipster client generator with blueprint', () => {
  function generateAppWithClientFramework(clientFramework) {
    return helpers
      .create(path.join(__dirname, '../../generators/client'))
      .withOptions({
        fromCli: true,
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
      .withPrompts({
        baseName: 'jhipster',
        clientFramework,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      })
      .run();
  }

  it('Assert external asset is added to webpack.custom.js if framework is Angular', async () => {
    await generateAppWithClientFramework(ANGULAR);
    assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.custom.js`, `{ from: '${assetFrom}', to: '${assetTo}' },`);
  });
  it('Assert external asset is added to webpack.common.js if framework is React', async () => {
    await generateAppWithClientFramework(REACT);
    assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, `{ from: '${assetFrom}', to: '${assetTo}' },`);
  });
  it('Assert external asset is added to webpack.common.js if framework is Vue', async () => {
    await generateAppWithClientFramework(VUE);
    assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, `{ from: '${assetFrom}', to: '${assetTo}' },`);
  });

  it('should add webpack config to webpack.custom.js if framework is Angular', async () => {
    await generateAppWithClientFramework(ANGULAR);
    assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.custom.js`, '{ devServer: {} },');
  });
  it('should add webpack config to webpack.common.js if framework is React', async () => {
    await generateAppWithClientFramework(REACT);
    assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, '{ devServer: {} },');
  });
  it('should add webpack config to webpack.common.js if framework is Vue', async () => {
    await generateAppWithClientFramework(VUE);
    assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, '{ devServer: {} },');
  });
});
