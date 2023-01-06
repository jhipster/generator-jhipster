import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import {
  applicationTypes,
  databaseTypes,
  cacheTypes,
  authenticationTypes,
  testFrameworkTypes,
  clientFrameworkTypes,
  buildToolTypes,
} from '../../jdl/jhipster/index.mjs';
import { getGenerator } from '../support/index.mjs';

const { MONOLITH } = applicationTypes;
const { H2_DISK, MYSQL, SQL } = databaseTypes;
const { EHCACHE } = cacheTypes;
const { JWT } = authenticationTypes;
const { CYPRESS } = testFrameworkTypes;
const { ANGULAR } = clientFrameworkTypes;
const { MAVEN } = buildToolTypes;

const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:client', 'jhipster:languages', 'jhipster:entity'];

describe('generator - app - prompts', () => {
  describe('testFrameworks prompt', () => {
    describe('with cypress value', () => {
      let runResult;
      before(() => {
        return helpers
          .create(getGenerator('app'))
          .withOptions({
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
