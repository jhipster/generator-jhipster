import { before, it, describe } from 'esmocha';
import { defaultHelpers as helpers } from '../../test/support/index.js';
import {
  applicationTypes,
  databaseTypes,
  cacheTypes,
  authenticationTypes,
  testFrameworkTypes,
  clientFrameworkTypes,
  buildToolTypes,
} from '../../jdl/jhipster/index.js';
import { GENERATOR_APP } from '../generator-list.js';

const { MONOLITH } = applicationTypes;
const { H2_DISK, MYSQL, SQL } = databaseTypes;
const { EHCACHE } = cacheTypes;
const { JWT } = authenticationTypes;
const { CYPRESS } = testFrameworkTypes;
const { ANGULAR } = clientFrameworkTypes;
const { MAVEN } = buildToolTypes;

const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:languages', 'jhipster:entity'];

describe('generator - client - prompts', () => {
  describe('clientTestFrameworks prompt', () => {
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
            clientTestFrameworks: [CYPRESS],
            buildTool: MAVEN,
            clientFramework: ANGULAR,
            clientTheme: 'none',
          })
          .withSkipWritingPriorities()
          .withMockedGenerators(mockedComposedGenerators);
      });

      it('should write testFrameworks with cypress value to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [CYPRESS] } });
      });
    });
  });
});
