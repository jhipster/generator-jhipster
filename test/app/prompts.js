const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { SUPPORTED_CLIENT_FRAMEWORKS } = require('../../generators/generator-constants');

const ANGULAR = SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

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
            applicationType: 'monolith',
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            prodDatabaseType: 'mysql',
            cacheProvider: 'ehcache',
            authenticationType: 'jwt',
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['en', 'fr'],
            testFrameworks: ['cypress'],
            buildTool: 'maven',
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
        assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: ['cypress'] } });
      });
    });
  });
});
