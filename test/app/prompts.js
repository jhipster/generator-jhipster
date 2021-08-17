const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { MONOLITH } = require('../../jdl/jhipster/application-types');
const { H2_DISK, MYSQL, SQL } = require('../../jdl/jhipster/database-types');
const { EHCACHE } = require('../../jdl/jhipster/cache-types');
const { JWT } = require('../../jdl/jhipster/authentication-types');
const { CYPRESS } = require('../../jdl/jhipster/test-framework-types');
const { ANGULAR } = require('../../jdl/jhipster/client-framework-types');
const { MAVEN } = require('../../jdl/jhipster/build-tool-types');

const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:client', 'jhipster:languages', 'jhipster:entity'];

describe('jhipster:app prompts', () => {
  describe('testFrameworks prompt', () => {
    describe('with cypress value', () => {
      let runResult;
      before(() => {
        return helpers
          .create(require.resolve('../../generators/app'))
          .withOptions({
            fromCli: true,
            skipInstall: true,
            skipChecks: true,
          })
          .withPrompts({
            baseName: 'sampleMysql',
            packageName: 'com.mycompany.myapp',
            applicationType: MONOLITH,
            databaseType: SQL,
            devDatabaseType: H2_DISK,
            prodDatabaseType: MYSQL,
            cacheProvider: EHCACHE,
            authenticationType: JWT,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['en', 'fr'],
            testFrameworks: [CYPRESS],
            buildTool: MAVEN,
            clientFramework: ANGULAR,
            clientTheme: 'none',
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should write testFrameworks with cypress value to .yo-rc.json', () => {
        assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [CYPRESS] } });
      });
    });
  });
});
