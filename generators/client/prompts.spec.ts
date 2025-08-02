import { before, describe, it } from 'esmocha';

import { APPLICATION_TYPE_MONOLITH } from '../../lib/core/application-types.ts';
import {
  authenticationTypes,
  buildToolTypes,
  cacheTypes,
  clientFrameworkTypes,
  databaseTypes,
  testFrameworkTypes,
} from '../../lib/jhipster/index.ts';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { GENERATOR_APP } from '../generator-list.ts';

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
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_APP)
          .withSharedApplication({ getWebappTranslation: () => 'translations' })
          .withAnswers({
            baseName: 'sampleMysql',
            packageName: 'com.mycompany.myapp',
            applicationType: APPLICATION_TYPE_MONOLITH,
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
