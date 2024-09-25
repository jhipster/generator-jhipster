import { before, describe, it } from 'esmocha';
import { dryRunHelpers as helpers, result as runResult } from '../../lib/testing/index.js';
import { CLIENT_WEBPACK_DIR } from '../generator-constants.js';
import { clientFrameworkTypes } from '../../lib/jhipster/index.js';
import ClientGenerator from './index.js';

const { ANGULAR, REACT } = clientFrameworkTypes;

const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [ClientGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      webpackPhase({ source }) {
        source.addWebpackConfig!({ config: '{devServer:{}}' });
      },
    });
  }
};

describe('needle API Webpack: JHipster client generator with blueprint', () => {
  function generateAppWithClientFramework(clientFramework) {
    return helpers
      .runJHipster('client')
      .withOptions({
        blueprint: ['myblueprint'],
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
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:client' }]]);
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
});
