import { basicHelpers as helpers, result as runResult } from '../../test/support/index.mjs';
import {
  applicationTypes,
  databaseTypes,
  cacheTypes,
  authenticationTypes,
  testFrameworkTypes,
  clientFrameworkTypes,
  buildToolTypes,
} from '../../jdl/jhipster/index.mjs';
import { GENERATOR_APP } from '../generator-list.mjs';

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
      before(async () => {
        runResult = await helpers
          .runJHipster(GENERATOR_APP)
          .withAnswers({
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
          .withMockedGenerators(mockedComposedGenerators);
      });

      it('should write testFrameworks with cypress value to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [CYPRESS] } });
      });
    });
  });
});
