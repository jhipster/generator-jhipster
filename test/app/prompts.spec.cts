import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { MONOLITH } from '../../jdl/jhipster/application-types';
import { H2_DISK, MYSQL, SQL } from '../../jdl/jhipster/database-types';
import { EHCACHE } from '../../jdl/jhipster/cache-types';
import { JWT } from '../../jdl/jhipster/authentication-types';
import { CYPRESS } from '../../jdl/jhipster/test-framework-types';
import { ANGULAR } from '../../jdl/jhipster/client-framework-types';
import { MAVEN } from '../../jdl/jhipster/build-tool-types';
import { getGenerator } from '../support/index.cjs';

const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:client', 'jhipster:languages', 'jhipster:entity'];

describe('jhipster:app prompts', () => {
  describe('testFrameworks prompt', () => {
    describe('with cypress value', () => {
      let runResult;
      before(() => {
        return helpers
          .create(getGenerator('app'))
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
