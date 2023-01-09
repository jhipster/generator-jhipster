import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import ClientGenerator from '../../generators/client/index.mjs';
import { CLIENT_WEBPACK_DIR } from '../../generators/generator-constants.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { getGenerator } from '../support/index.mjs';

const { ANGULAR, VUE, REACT } = clientFrameworkTypes;
const assetFrom = 'source';
const assetTo = 'target';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ClientGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      webpackPhase() {
        this.copyExternalAssetsInWebpack(assetFrom, assetTo);
        this.addWebpackConfig('{devServer:{}}');
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API Webpack: JHipster client generator with blueprint', () => {
  function generateAppWithClientFramework(clientFramework) {
    return helpers
      .create(getGenerator('client'))
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
        baseName: 'jhipster',
        clientFramework,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
      .run();
  }

  describe('Angular clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(ANGULAR);
    });

    it('Assert external asset is added to webpack.custom.js', async () => {
      assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.custom.js`, `{ from: '${assetFrom}', to: '${assetTo}' },`);
    });

    it('should add webpack config to webpack.custom.js', async () => {
      assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.custom.js`, '{ devServer: {} }');
    });
  });

  describe('React clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(REACT);
    });

    it('Assert external asset is added to webpack.common.js', async () => {
      assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, `{ from: '${assetFrom}', to: '${assetTo}' },`);
    });
    it('should add webpack config to webpack.common.js', async () => {
      assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, '{ devServer: {} }');
    });
  });

  describe('Vue clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(VUE);
    });

    it('Assert external asset is added to webpack.common.js', async () => {
      assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, `{ from: '${assetFrom}', to: '${assetTo}' },`);
    });
    it('should add webpack config to webpack.common.js', async () => {
      assert.fileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, '{ devServer: {} }');
    });
  });
});
