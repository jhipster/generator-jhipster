import { basicHelpers as helpers, result as runResult, getGenerator } from '../../test/support/index.mjs';
import ClientGenerator from './index.mjs';
import { CLIENT_WEBPACK_DIR } from '../generator-constants.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

const { ANGULAR, VUE, REACT } = clientFrameworkTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [ClientGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      webpackPhase({ source }) {
        source.addWebpackConfig({ config: '{devServer:{}}' });
      },
    });
  }
};

describe('needle API Webpack: JHipster client generator with blueprint', () => {
  function generateAppWithClientFramework(clientFramework) {
    return helpers
      .create(getGenerator('client'))
      .withOptions({
        blueprint: 'myblueprint',
      })
      .withJHipsterConfig({
        buildTool: 'maven',
        authenticationType: 'jwt',
        prodDatabaseType: 'mysql',
        skipServer: true,
        baseName: 'jhipster',
        clientFramework,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:client' }]])
      .run();
  }

  describe('Angular clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(ANGULAR);
    });

    it('should add webpack config to webpack.custom.js', async () => {
      runResult.assertFileContent(`${CLIENT_WEBPACK_DIR}webpack.custom.js`, '{ devServer: {} }');
    });
  });

  describe('React clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(REACT);
    });

    it('should add webpack config to webpack.common.js', async () => {
      runResult.assertFileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, '{ devServer: {} }');
    });
  });

  describe('Vue clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(VUE);
    });

    it('should add webpack config to webpack.common.js', async () => {
      runResult.assertFileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, '{ devServer: {} }');
    });
  });
});
